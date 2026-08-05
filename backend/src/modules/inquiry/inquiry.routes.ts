import { Router, type NextFunction, type Request, type Response } from 'express';
import { inquiryController } from './inquiry.controller';
import { authenticate } from '../../middleware/auth.middleware';
import { authorize } from '../../middleware/auth.middleware';
import { validateRequest } from '../../middleware/validate-request.middleware';
import {
  createInquirySchema,
  updateInquirySchema,
  inquiryQuerySchema,
  bulkImportSchema,
  bulkUpdateSchema,
  assignCounselorSchema,
  updateStatusSchema,
  followUpSchema,
  timelineEventSchema,
} from './inquiry.validator';

// TODO: API versioning - consider prefixing these routes under /api/v2/inquiries for future breaking changes.

const router: Router = Router();

const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX = 30;
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

const inquiryRateLimiter = (req: Request, res: Response, next: NextFunction): void => {
  const key = req.ip || 'unknown';
  const now = Date.now();
  const entry = rateLimitMap.get(key);

  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(key, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return next();
  }

  if (entry.count >= RATE_LIMIT_MAX) {
    res.status(429).json({
      success: false,
      message: 'Too many requests, please try again later',
      code: 'RATE_LIMITED',
      timestamp: new Date().toISOString(),
    });
    return;
  }

  entry.count += 1;
  next();
};

// ─── PUBLIC ────────────────────────────────────────────────────────────────
// Self-service inquiry creation. No authentication required.
// TODO: OpenAPI/Swagger - document public create endpoint.
// TODO: Webhook/event - publish InquiryCreated event for downstream automation.

router.post('/', inquiryRateLimiter, validateRequest({ body: createInquirySchema }), inquiryController.create);

// ─── COUNSELOR ─────────────────────────────────────────────────────────────
// Read, update, follow-up, and counseling endpoints for Admission Counselor / FACULTY role.
// TODO: OpenAPI/Swagger - document counselor endpoints.
// TODO: Webhook/event - publish CounselorAssigned, FollowUpScheduled, CounselingCompleted events.

router.get('/', authenticate, authorize('FACULTY', 'HOD', 'SUPER_ADMIN', 'ADMIN'), inquiryRateLimiter, validateRequest({ query: inquiryQuerySchema }), inquiryController.list);
router.get('/search', authenticate, authorize('FACULTY', 'HOD', 'SUPER_ADMIN', 'ADMIN'), inquiryRateLimiter, validateRequest({ query: inquiryQuerySchema }), inquiryController.search);
router.get('/filter', authenticate, authorize('FACULTY', 'HOD', 'SUPER_ADMIN', 'ADMIN'), inquiryRateLimiter, validateRequest({ query: inquiryQuerySchema }), inquiryController.filter);
router.get('/advanced-search', authenticate, authorize('FACULTY', 'HOD', 'SUPER_ADMIN', 'ADMIN'), inquiryRateLimiter, validateRequest({ query: inquiryQuerySchema }), inquiryController.advancedSearch);
router.get('/:id', authenticate, authorize('FACULTY', 'HOD', 'SUPER_ADMIN', 'ADMIN'), inquiryRateLimiter, inquiryController.getById);
router.get('/:id/timeline', authenticate, authorize('FACULTY', 'HOD', 'SUPER_ADMIN', 'ADMIN'), inquiryRateLimiter, inquiryController.listTimeline);
router.get('/:id/status-history', authenticate, authorize('FACULTY', 'HOD', 'SUPER_ADMIN', 'ADMIN'), inquiryRateLimiter, inquiryController.getStatusHistory);
router.get('/:id/conversion', authenticate, authorize('FACULTY', 'HOD', 'SUPER_ADMIN', 'ADMIN'), inquiryRateLimiter, inquiryController.getConversionStatus);
router.put('/:id', authenticate, authorize('FACULTY', 'HOD', 'SUPER_ADMIN', 'ADMIN'), inquiryRateLimiter, validateRequest({ body: updateInquirySchema }), inquiryController.update);
router.put('/:id/counselor-notes', authenticate, authorize('FACULTY', 'HOD', 'SUPER_ADMIN', 'ADMIN'), inquiryRateLimiter, inquiryController.updateCounselorNotes);
router.put('/:id/counseling-outcome', authenticate, authorize('FACULTY', 'HOD', 'SUPER_ADMIN', 'ADMIN'), inquiryRateLimiter, inquiryController.updateCounselingOutcome);
router.post('/:id/follow-up', authenticate, authorize('FACULTY', 'HOD', 'SUPER_ADMIN', 'ADMIN'), inquiryRateLimiter, validateRequest({ body: followUpSchema }), inquiryController.scheduleFollowUp);
router.put('/:id/follow-up', authenticate, authorize('FACULTY', 'HOD', 'SUPER_ADMIN', 'ADMIN'), inquiryRateLimiter, validateRequest({ body: followUpSchema }), inquiryController.updateFollowUp);
router.put('/:id/follow-up/complete', authenticate, authorize('FACULTY', 'HOD', 'SUPER_ADMIN', 'ADMIN'), inquiryRateLimiter, validateRequest({ body: followUpSchema }), inquiryController.completeFollowUp);
router.get('/follow-ups/pending', authenticate, authorize('FACULTY', 'HOD', 'SUPER_ADMIN', 'ADMIN'), inquiryRateLimiter, inquiryController.listPendingFollowUps);
router.get('/counselors/:id/inquiries', authenticate, authorize('FACULTY', 'HOD', 'SUPER_ADMIN', 'ADMIN'), inquiryRateLimiter, inquiryController.listCounselorInquiries);
router.post('/:id/timeline', authenticate, authorize('FACULTY', 'HOD', 'SUPER_ADMIN', 'ADMIN'), inquiryRateLimiter, validateRequest({ body: timelineEventSchema }), inquiryController.addTimelineEvent);

// ─── ADMISSION HEAD ────────────────────────────────────────────────────────
// Status, archive, conversion, statistics, and AI endpoints for HOD role.
// TODO: OpenAPI/Swagger - document admission head endpoints.
// TODO: Webhook/event - publish StatusChanged, InquiryArchived, InquiryConverted events.

router.put('/:id/assign-counselor', authenticate, authorize('HOD', 'SUPER_ADMIN', 'ADMIN'), inquiryRateLimiter, validateRequest({ body: assignCounselorSchema }), inquiryController.assignCounselor);
router.put('/:id/remove-counselor', authenticate, authorize('HOD', 'SUPER_ADMIN', 'ADMIN'), inquiryRateLimiter, inquiryController.removeCounselor);
router.put('/:id/status', authenticate, authorize('HOD', 'SUPER_ADMIN', 'ADMIN'), inquiryRateLimiter, validateRequest({ body: updateStatusSchema }), inquiryController.updateStatus);
router.put('/:id/archive', authenticate, authorize('HOD', 'SUPER_ADMIN', 'ADMIN'), inquiryRateLimiter, inquiryController.archiveInquiry);
router.put('/:id/restore-archive', authenticate, authorize('HOD', 'SUPER_ADMIN', 'ADMIN'), inquiryRateLimiter, inquiryController.restoreArchivedInquiry);
router.post('/:id/convert', authenticate, authorize('HOD', 'SUPER_ADMIN', 'ADMIN'), inquiryRateLimiter, inquiryController.convertToApplicant);
router.get('/statistics/status', authenticate, authorize('HOD', 'SUPER_ADMIN', 'ADMIN'), inquiryRateLimiter, inquiryController.countByStatus);
router.get('/statistics/source', authenticate, authorize('HOD', 'SUPER_ADMIN', 'ADMIN'), inquiryRateLimiter, inquiryController.countBySource);
router.get('/statistics/hot-leads', authenticate, authorize('HOD', 'SUPER_ADMIN', 'ADMIN'), inquiryRateLimiter, inquiryController.countHotLeads);
router.get('/statistics/converted', authenticate, authorize('HOD', 'SUPER_ADMIN', 'ADMIN'), inquiryRateLimiter, inquiryController.countConverted);
router.put('/:id/ai-summary', authenticate, authorize('HOD', 'SUPER_ADMIN', 'ADMIN'), inquiryRateLimiter, inquiryController.updateAISummary);
router.put('/:id/lead-score', authenticate, authorize('HOD', 'SUPER_ADMIN', 'ADMIN'), inquiryRateLimiter, inquiryController.updateLeadScore);
router.put('/:id/recommended-courses', authenticate, authorize('HOD', 'SUPER_ADMIN', 'ADMIN'), inquiryRateLimiter, inquiryController.updateRecommendedCourses);
router.put('/:id/ai-conversation', authenticate, authorize('HOD', 'SUPER_ADMIN', 'ADMIN'), inquiryRateLimiter, inquiryController.updateAIConversation);

// ─── ADMIN ────────────────────────────────────────────────────────────────
// Delete, restore, and administration endpoints for SUPER_ADMIN / ADMIN roles.
// TODO: OpenAPI/Swagger - document admin endpoints.
// TODO: Webhook/event - publish InquiryDeleted, InquiryRestored events.

router.delete('/:id', authenticate, authorize('SUPER_ADMIN', 'ADMIN'), inquiryRateLimiter, inquiryController.delete);
router.post('/:id/restore', authenticate, authorize('SUPER_ADMIN', 'ADMIN'), inquiryRateLimiter, inquiryController.restore);

// ─── BULK ─────────────────────────────────────────────────────────────────
// Bulk operation endpoints for SUPER_ADMIN / ADMIN roles.
// TODO: OpenAPI/Swagger - document bulk operation schemas and error responses.
// TODO: Rate limiting - apply strict rate limiting for bulk mutation endpoints.
// TODO: Webhook/event - publish BulkInquiriesCreated or BulkInquiriesUpdated events.

router.post('/bulk', authenticate, authorize('SUPER_ADMIN', 'ADMIN'), inquiryRateLimiter, validateRequest({ body: bulkImportSchema }), inquiryController.bulkCreate);
router.put('/bulk', authenticate, authorize('SUPER_ADMIN', 'ADMIN'), inquiryRateLimiter, validateRequest({ body: bulkUpdateSchema }), inquiryController.bulkUpdate);

export const inquiryRoutes: Router = router;
