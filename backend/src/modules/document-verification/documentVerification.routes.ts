import { Router, type NextFunction, type Request, type Response } from 'express';
import { documentVerificationController } from './documentVerification.controller';
import { authenticate } from '../../middleware/auth.middleware';
import { authorize } from '../../middleware/auth.middleware';
import { validateRequest } from '../../middleware/validate-request.middleware';
import {
  createDocumentVerificationSchema,
  updateDocumentVerificationSchema,
  documentVerificationQuerySchema,
  bulkVerifySchema,
  bulkRejectSchema,
  bulkImportDocumentVerificationSchema,
  approveDocumentSchema,
  rejectDocumentSchema,
  reuploadDocumentSchema,
} from './documentVerification.validator';

// TODO: API versioning - consider prefixing these routes under /api/v2/document-verifications for future breaking changes.
// TODO: OpenAPI/Swagger - document all document verification endpoints.
// TODO: Webhook/event - publish domain events for document verification lifecycle changes.
// TODO: Notification hooks - integrate notification service for verification status changes.
// TODO: AI hooks - integrate OCR and fraud detection services.
// TODO: Audit hooks - log all mutations for compliance and traceability.
// TODO: Metrics - instrument endpoint latency, error rates, and business metrics.

const router: Router = Router();

const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX = 30;
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

const documentVerificationRateLimiter = (req: Request, res: Response, next: NextFunction): void => {
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
// Self-service document upload. No authentication required.
// Future integration: applicant portal, mobile app, WhatsApp bot.

router.post('/', documentVerificationRateLimiter, validateRequest({ body: createDocumentVerificationSchema }), documentVerificationController.create);

// ─── VERIFIER ──────────────────────────────────────────────────────────────
// Document verification, approval, rejection, and review endpoints for VERIFIER role.
// Future integration: verifier dashboard, document management system.

router.get('/', authenticate, authorize('HOD', 'SUPER_ADMIN', 'ADMIN'), documentVerificationRateLimiter, validateRequest({ query: documentVerificationQuerySchema }), documentVerificationController.list);
router.get('/search', authenticate, authorize('HOD', 'SUPER_ADMIN', 'ADMIN'), documentVerificationRateLimiter, validateRequest({ query: documentVerificationQuerySchema }), documentVerificationController.search);
router.get('/:id', authenticate, authorize('HOD', 'SUPER_ADMIN', 'ADMIN'), documentVerificationRateLimiter, documentVerificationController.getById);
router.patch('/:id', authenticate, authorize('HOD', 'SUPER_ADMIN', 'ADMIN'), documentVerificationRateLimiter, validateRequest({ body: updateDocumentVerificationSchema }), documentVerificationController.update);
router.patch('/:id/approve', authenticate, authorize('HOD', 'SUPER_ADMIN', 'ADMIN'), documentVerificationRateLimiter, validateRequest({ body: approveDocumentSchema }), documentVerificationController.approve);
router.patch('/:id/reject', authenticate, authorize('HOD', 'SUPER_ADMIN', 'ADMIN'), documentVerificationRateLimiter, validateRequest({ body: rejectDocumentSchema }), documentVerificationController.reject);
router.patch('/:id/under-review', authenticate, authorize('HOD', 'SUPER_ADMIN', 'ADMIN'), documentVerificationRateLimiter, documentVerificationController.markUnderReview);

// ─── APPLICANT ─────────────────────────────────────────────────────────────
// Re-upload and status check endpoints for STUDENT role.
// Future integration: applicant portal, mobile app.

router.get('/applicant/:applicantId', authenticate, authorize('STUDENT'), documentVerificationRateLimiter, validateRequest({ query: documentVerificationQuerySchema }), documentVerificationController.list);
router.post('/:id/reupload', authenticate, authorize('STUDENT'), documentVerificationRateLimiter, validateRequest({ body: reuploadDocumentSchema }), documentVerificationController.reupload);

// ─── ADMIN ────────────────────────────────────────────────────────────────
// Archive, restore, delete, and bulk operations for ADMIN / SUPER_ADMIN.
// Future integration: admin dashboard, audit logs.

router.delete('/:id', authenticate, authorize('SUPER_ADMIN', 'ADMIN'), documentVerificationRateLimiter, documentVerificationController.delete);
router.post('/:id/restore', authenticate, authorize('SUPER_ADMIN', 'ADMIN'), documentVerificationRateLimiter, documentVerificationController.restore);
router.patch('/:id/archive', authenticate, authorize('SUPER_ADMIN', 'ADMIN', 'HOD'), documentVerificationRateLimiter, documentVerificationController.archive);
router.patch('/:id/restore-archive', authenticate, authorize('SUPER_ADMIN', 'ADMIN', 'HOD'), documentVerificationRateLimiter, documentVerificationController.restoreArchive);

// ─── BULK OPERATIONS ───────────────────────────────────────────────────────
// Bulk operation endpoints for ADMIN / SUPER_ADMIN.
// Future integration: bulk document processing, ERP sync.

router.post('/bulk/verify', authenticate, authorize('SUPER_ADMIN', 'ADMIN'), documentVerificationRateLimiter, validateRequest({ body: bulkVerifySchema }), documentVerificationController.bulkVerify);
router.post('/bulk/reject', authenticate, authorize('SUPER_ADMIN', 'ADMIN'), documentVerificationRateLimiter, validateRequest({ body: bulkRejectSchema }), documentVerificationController.bulkReject);
router.post('/bulk', authenticate, authorize('SUPER_ADMIN', 'ADMIN'), documentVerificationRateLimiter, validateRequest({ body: bulkImportDocumentVerificationSchema }), documentVerificationController.bulkCreate);

// ─── STATISTICS ────────────────────────────────────────────────────────────
// Statistics endpoints for ADMIN / SUPER_ADMIN.
// Future integration: admin dashboard, analytics.

router.get('/statistics/status', authenticate, authorize('HOD', 'SUPER_ADMIN', 'ADMIN'), documentVerificationRateLimiter, documentVerificationController.countByStatus);
router.get('/statistics/document-type', authenticate, authorize('HOD', 'SUPER_ADMIN', 'ADMIN'), documentVerificationRateLimiter, documentVerificationController.countByDocumentType);
router.get('/statistics/pending-review', authenticate, authorize('HOD', 'SUPER_ADMIN', 'ADMIN'), documentVerificationRateLimiter, documentVerificationController.countPendingReview);

export const documentVerificationRoutes: Router = router;
