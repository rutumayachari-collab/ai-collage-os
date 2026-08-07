import { Router, type NextFunction, type Request, type Response } from 'express';
import { eligibilityController } from './eligibility.controller';
import { authenticate } from '../../middleware/auth.middleware';
import { authorize } from '../../middleware/auth.middleware';
import { validateRequest } from '../../middleware/validate-request.middleware';
import {
  createEligibilitySchema,
  updateEligibilitySchema,
  eligibilityQuerySchema,
  bulkImportEligibilitySchema,
  runEligibilityCheckSchema,
} from './eligibility.validator';

// TODO: API versioning - consider prefixing these routes under /api/v2/eligibility for future breaking changes.
// TODO: OpenAPI/Swagger - document all eligibility endpoints.
// TODO: Webhook/event - publish domain events for eligibility lifecycle changes.
// TODO: Notification hooks - integrate notification service for eligibility status changes.
// TODO: AI hooks - integrate AI service for eligibility rule engine and recommendations.
// TODO: Audit hooks - log all mutations for compliance and traceability.
// TODO: Metrics - instrument endpoint latency, error rates, and business metrics.

const router: Router = Router();

const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX = 30;
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

const eligibilityRateLimiter = (req: Request, res: Response, next: NextFunction): void => {
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

// ─── ADMISSION COMMITTEE ───────────────────────────────────────────────────
// Eligibility check, rule management, and decision endpoints for HOD role.
// Future integration: admission committee dashboard, ERP sync, finance module.

router.post('/', authenticate, authorize('HOD', 'SUPER_ADMIN', 'ADMIN'), eligibilityRateLimiter, validateRequest({ body: createEligibilitySchema }), eligibilityController.create);
router.get('/', authenticate, authorize('HOD', 'SUPER_ADMIN', 'ADMIN'), eligibilityRateLimiter, validateRequest({ query: eligibilityQuerySchema }), eligibilityController.list);
router.get('/search', authenticate, authorize('HOD', 'SUPER_ADMIN', 'ADMIN'), eligibilityRateLimiter, validateRequest({ query: eligibilityQuerySchema }), eligibilityController.search);
router.get('/:id', authenticate, authorize('HOD', 'SUPER_ADMIN', 'ADMIN'), eligibilityRateLimiter, eligibilityController.getById);
router.patch('/:id', authenticate, authorize('HOD', 'SUPER_ADMIN', 'ADMIN'), eligibilityRateLimiter, validateRequest({ body: updateEligibilitySchema }), eligibilityController.update);
router.post('/:id/run-check', authenticate, authorize('HOD', 'SUPER_ADMIN', 'ADMIN'), eligibilityRateLimiter, validateRequest({ body: runEligibilityCheckSchema }), eligibilityController.runCheck);
router.patch('/:id/status', authenticate, authorize('HOD', 'SUPER_ADMIN', 'ADMIN'), eligibilityRateLimiter, validateRequest({ body: updateEligibilitySchema }), eligibilityController.updateStatus);
router.patch('/:id/ai-confidence', authenticate, authorize('HOD', 'SUPER_ADMIN', 'ADMIN'), eligibilityRateLimiter, validateRequest({ body: updateEligibilitySchema }), eligibilityController.updateAIConfidence);
router.patch('/:id/reasons', authenticate, authorize('HOD', 'SUPER_ADMIN', 'ADMIN'), eligibilityRateLimiter, validateRequest({ body: updateEligibilitySchema }), eligibilityController.updateReasonGeneration);
router.patch('/:id/recommendation', authenticate, authorize('HOD', 'SUPER_ADMIN', 'ADMIN'), eligibilityRateLimiter, validateRequest({ body: updateEligibilitySchema }), eligibilityController.updateRecommendation);

// ─── ADMIN ────────────────────────────────────────────────────────────────
// Archive, restore, delete, and bulk operations for ADMIN / SUPER_ADMIN.
// Future integration: admin dashboard, audit logs.

router.delete('/:id', authenticate, authorize('SUPER_ADMIN', 'ADMIN'), eligibilityRateLimiter, eligibilityController.delete);
router.post('/:id/restore', authenticate, authorize('SUPER_ADMIN', 'ADMIN'), eligibilityRateLimiter, eligibilityController.restore);
router.patch('/:id/archive', authenticate, authorize('SUPER_ADMIN', 'ADMIN', 'HOD'), eligibilityRateLimiter, eligibilityController.archive);
router.patch('/:id/restore-archive', authenticate, authorize('SUPER_ADMIN', 'ADMIN', 'HOD'), eligibilityRateLimiter, eligibilityController.restoreArchive);

// ─── BULK OPERATIONS ───────────────────────────────────────────────────────
// Bulk operation endpoints for ADMIN / SUPER_ADMIN.
// Future integration: bulk eligibility processing, ERP sync.

router.post('/bulk', authenticate, authorize('SUPER_ADMIN', 'ADMIN'), eligibilityRateLimiter, validateRequest({ body: bulkImportEligibilitySchema }), eligibilityController.bulkCreate);

// ─── STATISTICS ────────────────────────────────────────────────────────────
// Statistics endpoints for ADMIN / SUPER_ADMIN.
// Future integration: admin dashboard, analytics.

router.get('/statistics/status', authenticate, authorize('HOD', 'SUPER_ADMIN', 'ADMIN'), eligibilityRateLimiter, eligibilityController.countByStatus);
router.get('/statistics/eligible', authenticate, authorize('HOD', 'SUPER_ADMIN', 'ADMIN'), eligibilityRateLimiter, eligibilityController.countEligible);
router.get('/statistics/not-eligible', authenticate, authorize('HOD', 'SUPER_ADMIN', 'ADMIN'), eligibilityRateLimiter, eligibilityController.countNotEligible);
router.get('/statistics/pending-review', authenticate, authorize('HOD', 'SUPER_ADMIN', 'ADMIN'), eligibilityRateLimiter, eligibilityController.countPendingReview);

export const eligibilityRoutes: Router = router;
