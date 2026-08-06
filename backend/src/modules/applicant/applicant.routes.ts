import { Router, type NextFunction, type Request, type Response } from 'express';
import { applicantController } from './applicant.controller';
import { authenticate } from '../../middleware/auth.middleware';
import { authorize } from '../../middleware/auth.middleware';
import { validateRequest } from '../../middleware/validate-request.middleware';
import {
  createApplicantSchema,
  updateApplicantSchema,
  applicantQuerySchema,
  bulkImportSchema,
  bulkUpdateSchema,
  assignReviewerSchema,
  updateStatusSchema,
  interviewResultSchema,
  updatePaymentSchema,
  scheduleInterviewSchema,
} from './applicant.validator';

// TODO: API versioning - consider prefixing these routes under /api/v2/applicants for future breaking changes.
// TODO: OpenAPI/Swagger - document all applicant endpoints, request/response schemas, and RBAC requirements.
// TODO: Webhook/event - publish domain events for applicant lifecycle changes.
// TODO: Notification hooks - integrate notification service for status changes, interviews, and offer letters.
// TODO: AI hooks - integrate AI service for eligibility scoring, document analysis, and recommendations.
// TODO: Audit hooks - log all mutations for compliance and traceability.
// TODO: Metrics - instrument endpoint latency, error rates, and business metrics.
// TODO: Rate limiting - tune limits per role and endpoint sensitivity.

const router: Router = Router();

const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX = 30;
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

const applicantRateLimiter = (req: Request, res: Response, next: NextFunction): void => {
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
// Self-service application submission and status lookup. No authentication required.
// Future integration: public portal, WhatsApp bot, education fair kiosks.

router.post('/', applicantRateLimiter, validateRequest({ body: createApplicantSchema }), applicantController.create);

router.get('/application-status', applicantRateLimiter, validateRequest({ query: applicantQuerySchema }), applicantController.list);

router.get('/public-info/:applicationNumber', applicantRateLimiter, applicantController.getByApplicationNumber);

// ─── APPLICANT ─────────────────────────────────────────────────────────────
// Self-service profile, application, documents, interview, fee, timeline for STUDENT role.
// Future integration: applicant portal, mobile app, chatbot.

router.get('/me/profile', authenticate, authorize('STUDENT'), applicantRateLimiter, applicantController.getById);
router.get('/:id/profile', authenticate, authorize('STUDENT', 'FACULTY', 'HOD', 'ADMIN', 'SUPER_ADMIN'), applicantRateLimiter, applicantController.getById);
router.patch('/:id/profile', authenticate, authorize('STUDENT'), applicantRateLimiter, validateRequest({ body: updateApplicantSchema }), applicantController.update);

router.get('/:id/application', authenticate, authorize('STUDENT', 'FACULTY', 'HOD', 'ADMIN', 'SUPER_ADMIN'), applicantRateLimiter, applicantController.getById);

router.get('/:id/workflow', authenticate, authorize('STUDENT', 'FACULTY', 'HOD', 'ADMIN', 'SUPER_ADMIN'), applicantRateLimiter, applicantController.getById);
router.patch('/:id/workflow', authenticate, authorize('STUDENT', 'FACULTY', 'HOD', 'ADMIN', 'SUPER_ADMIN'), applicantRateLimiter, validateRequest({ body: updateStatusSchema }), applicantController.updateStatus);

router.get('/:id/checklist', authenticate, authorize('STUDENT', 'FACULTY', 'HOD', 'ADMIN', 'SUPER_ADMIN'), applicantRateLimiter, applicantController.getChecklist);
router.patch('/:id/checklist', authenticate, authorize('STUDENT', 'FACULTY', 'HOD', 'ADMIN', 'SUPER_ADMIN'), applicantRateLimiter, validateRequest({ body: updateApplicantSchema }), applicantController.updateChecklist);

router.get('/:id/documents', authenticate, authorize('STUDENT', 'FACULTY', 'HOD', 'ADMIN', 'SUPER_ADMIN'), applicantRateLimiter, applicantController.listDocuments);
router.post('/:id/documents', authenticate, authorize('STUDENT'), applicantRateLimiter, validateRequest({ body: createApplicantSchema }), applicantController.addDocument);
router.patch('/:id/documents/:documentId/verify', authenticate, authorize('STUDENT'), applicantRateLimiter, validateRequest({ body: updateApplicantSchema }), applicantController.verifyDocument);

router.get('/:id/interview', authenticate, authorize('STUDENT', 'FACULTY', 'HOD', 'ADMIN', 'SUPER_ADMIN'), applicantRateLimiter, applicantController.getInterview);
router.post('/:id/interview', authenticate, authorize('STUDENT'), applicantRateLimiter, validateRequest({ body: scheduleInterviewSchema }), applicantController.scheduleInterview);
router.patch('/:id/interview/result', authenticate, authorize('STUDENT', 'FACULTY', 'HOD', 'ADMIN', 'SUPER_ADMIN'), applicantRateLimiter, validateRequest({ body: interviewResultSchema }), applicantController.recordInterviewResult);

router.get('/:id/offer-letter', authenticate, authorize('STUDENT', 'FACULTY', 'HOD', 'ADMIN', 'SUPER_ADMIN'), applicantRateLimiter, applicantController.getOfferLetter);
router.post('/:id/offer-letter/generate', authenticate, authorize('STUDENT'), applicantRateLimiter, validateRequest({ body: updateApplicantSchema }), applicantController.generateOfferLetter);
router.patch('/:id/offer-letter/respond', authenticate, authorize('STUDENT'), applicantRateLimiter, validateRequest({ body: updateApplicantSchema }), applicantController.respondToOffer);

router.get('/:id/fee-summary', authenticate, authorize('STUDENT', 'FACULTY', 'HOD', 'ADMIN', 'SUPER_ADMIN'), applicantRateLimiter, applicantController.getFeeSummary);
router.patch('/:id/fee-summary', authenticate, authorize('STUDENT'), applicantRateLimiter, validateRequest({ body: updatePaymentSchema }), applicantController.updateFeeSummary);

router.get('/:id/timeline', authenticate, authorize('STUDENT', 'FACULTY', 'HOD', 'ADMIN', 'SUPER_ADMIN'), applicantRateLimiter, applicantController.listTimeline);

router.get('/search', authenticate, authorize('STUDENT', 'FACULTY', 'HOD', 'ADMIN', 'SUPER_ADMIN'), applicantRateLimiter, validateRequest({ query: applicantQuerySchema }), applicantController.search);
router.get('/filter', authenticate, authorize('STUDENT', 'FACULTY', 'HOD', 'ADMIN', 'SUPER_ADMIN'), applicantRateLimiter, validateRequest({ query: applicantQuerySchema }), applicantController.filter);

// ─── COUNSELOR ─────────────────────────────────────────────────────────────
// Review, assignment, counseling, and interview endpoints for FACULTY role.
// Future integration: counselor dashboard, interview scheduling system.

router.get('/counselor/applicants', authenticate, authorize('FACULTY', 'HOD', 'SUPER_ADMIN', 'ADMIN'), applicantRateLimiter, validateRequest({ query: applicantQuerySchema }), applicantController.list);
router.post('/counselor/applicants/:id/assign', authenticate, authorize('FACULTY', 'HOD', 'SUPER_ADMIN', 'ADMIN'), applicantRateLimiter, validateRequest({ body: assignReviewerSchema }), applicantController.assignReviewer);
router.patch('/counselor/applicants/:id/notes', authenticate, authorize('FACULTY', 'HOD', 'SUPER_ADMIN', 'ADMIN'), applicantRateLimiter, validateRequest({ body: updateApplicantSchema }), applicantController.update);
router.get('/counselor/applicants/:id/eligibility', authenticate, authorize('FACULTY', 'HOD', 'SUPER_ADMIN', 'ADMIN'), applicantRateLimiter, applicantController.getById);
router.post('/counselor/applicants/:id/interview', authenticate, authorize('FACULTY', 'HOD', 'SUPER_ADMIN', 'ADMIN'), applicantRateLimiter, validateRequest({ body: scheduleInterviewSchema }), applicantController.scheduleInterview);
router.patch('/counselor/applicants/:id/interview/result', authenticate, authorize('FACULTY', 'HOD', 'SUPER_ADMIN', 'ADMIN'), applicantRateLimiter, validateRequest({ body: interviewResultSchema }), applicantController.recordInterviewResult);
router.patch('/counselor/applicants/:id/workflow', authenticate, authorize('FACULTY', 'HOD', 'SUPER_ADMIN', 'ADMIN'), applicantRateLimiter, validateRequest({ body: updateStatusSchema }), applicantController.updateStatus);

// ─── ADMISSION COMMITTEE ───────────────────────────────────────────────────
// Approval, rejection, scholarship, seat allocation, offer letter, and conversion for HOD role.
// Future integration: admission committee dashboard, ERP sync, finance module.

router.patch('/admission/applicants/:id/approve', authenticate, authorize('HOD', 'SUPER_ADMIN', 'ADMIN'), applicantRateLimiter, validateRequest({ body: updateStatusSchema }), applicantController.updateStatus);
router.patch('/admission/applicants/:id/reject', authenticate, authorize('HOD', 'SUPER_ADMIN', 'ADMIN'), applicantRateLimiter, validateRequest({ body: updateStatusSchema }), applicantController.updateStatus);
router.patch('/admission/applicants/:id/hold', authenticate, authorize('HOD', 'SUPER_ADMIN', 'ADMIN'), applicantRateLimiter, validateRequest({ body: updateStatusSchema }), applicantController.updateStatus);
router.patch('/admission/applicants/:id/scholarship', authenticate, authorize('HOD', 'SUPER_ADMIN', 'ADMIN'), applicantRateLimiter, validateRequest({ body: updateApplicantSchema }), applicantController.updateScholarship);
router.patch('/admission/applicants/:id/seat-allocation', authenticate, authorize('HOD', 'SUPER_ADMIN', 'ADMIN'), applicantRateLimiter, validateRequest({ body: updateApplicantSchema }), applicantController.allocateSeat);
router.post('/admission/applicants/:id/offer-letter/generate', authenticate, authorize('HOD', 'SUPER_ADMIN', 'ADMIN'), applicantRateLimiter, validateRequest({ body: updateApplicantSchema }), applicantController.generateOfferLetter);
router.post('/admission/applicants/:id/convert', authenticate, authorize('HOD', 'SUPER_ADMIN', 'ADMIN'), applicantRateLimiter, validateRequest({ body: updateApplicantSchema }), applicantController.convertToStudent);

// ─── ADMIN ────────────────────────────────────────────────────────────────
// Archive, restore, delete, bulk operations, statistics, and reports for ADMIN / SUPER_ADMIN.
// Future integration: admin dashboard, audit logs, ERP admin sync.

router.delete('/:id', authenticate, authorize('SUPER_ADMIN', 'ADMIN'), applicantRateLimiter, applicantController.delete);
router.post('/:id/restore', authenticate, authorize('SUPER_ADMIN', 'ADMIN'), applicantRateLimiter, applicantController.restore);
router.patch('/:id/archive', authenticate, authorize('SUPER_ADMIN', 'ADMIN', 'HOD'), applicantRateLimiter, applicantController.archiveApplicant);
router.patch('/:id/restore-archive', authenticate, authorize('SUPER_ADMIN', 'ADMIN', 'HOD'), applicantRateLimiter, applicantController.restoreArchivedApplicant);

router.post('/bulk', authenticate, authorize('SUPER_ADMIN', 'ADMIN'), applicantRateLimiter, validateRequest({ body: bulkImportSchema }), applicantController.bulkCreate);
router.patch('/bulk', authenticate, authorize('SUPER_ADMIN', 'ADMIN', 'HOD'), applicantRateLimiter, validateRequest({ body: bulkUpdateSchema }), applicantController.bulkUpdate);

router.get('/statistics/status', authenticate, authorize('HOD', 'SUPER_ADMIN', 'ADMIN'), applicantRateLimiter, applicantController.countByStatus);
router.get('/statistics/admission-rounds', authenticate, authorize('HOD', 'SUPER_ADMIN', 'ADMIN'), applicantRateLimiter, applicantController.countByAdmissionRound);
router.get('/statistics/hot-leads', authenticate, authorize('HOD', 'SUPER_ADMIN', 'ADMIN'), applicantRateLimiter, applicantController.countHotLeads);
router.get('/statistics/converted', authenticate, authorize('HOD', 'SUPER_ADMIN', 'ADMIN'), applicantRateLimiter, applicantController.countConverted);
router.get('/reports/summary', authenticate, authorize('HOD', 'SUPER_ADMIN', 'ADMIN'), applicantRateLimiter, validateRequest({ query: applicantQuerySchema }), applicantController.list);

export const applicantRoutes: Router = router;
