import { Router, type NextFunction, type Request, type Response } from 'express';
import { admissionController } from './admission.controller';
import { authenticate } from '../../middleware/auth.middleware';
import { authorize } from '../../middleware/auth.middleware';
import { validateRequest } from '../../middleware/validate-request.middleware';
import {
  createAdmissionSchema,
  updateAdmissionSchema,
  admissionQuerySchema,
  bulkApprovalSchema,
  approvalActionSchema,
  seatAllocationActionSchema,
  generateOfferLetterSchema,
  generateAdmissionLetterSchema,
  bulkImportAdmissionSchema,
} from './admission.validator';

// TODO: API versioning - consider prefixing these routes under /api/v2/admissions for future breaking changes.
// TODO: OpenAPI/Swagger - document all admission endpoints.
// TODO: Webhook/event - publish domain events for admission lifecycle changes.
// TODO: Notification hooks - integrate notification service for admission decisions.
// TODO: AI hooks - integrate AI service for admission recommendations.
// TODO: Audit hooks - log all mutations for compliance and traceability.
// TODO: Metrics - instrument endpoint latency, error rates, and business metrics.

const router: Router = Router();

const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX = 30;
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

const admissionRateLimiter = (req: Request, res: Response, next: NextFunction): void => {
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
// Admission workflow, approval, seat allocation, offer letter, and statistics for HOD role.
// Future integration: admission committee dashboard, ERP sync, finance module.

router.post('/', authenticate, authorize('HOD', 'SUPER_ADMIN', 'ADMIN'), admissionRateLimiter, validateRequest({ body: createAdmissionSchema }), admissionController.create);
router.get('/', authenticate, authorize('HOD', 'SUPER_ADMIN', 'ADMIN'), admissionRateLimiter, validateRequest({ query: admissionQuerySchema }), admissionController.list);
router.get('/search', authenticate, authorize('HOD', 'SUPER_ADMIN', 'ADMIN'), admissionRateLimiter, validateRequest({ query: admissionQuerySchema }), admissionController.search);
router.get('/:id', authenticate, authorize('HOD', 'SUPER_ADMIN', 'ADMIN'), admissionRateLimiter, admissionController.getById);
router.patch('/:id', authenticate, authorize('HOD', 'SUPER_ADMIN', 'ADMIN'), admissionRateLimiter, validateRequest({ body: updateAdmissionSchema }), admissionController.update);

router.patch('/:id/approve', authenticate, authorize('HOD', 'SUPER_ADMIN', 'ADMIN'), admissionRateLimiter, validateRequest({ body: approvalActionSchema }), admissionController.processApproval);
router.patch('/:id/reject', authenticate, authorize('HOD', 'SUPER_ADMIN', 'ADMIN'), admissionRateLimiter, validateRequest({ body: approvalActionSchema }), admissionController.processApproval);
router.patch('/:id/hold', authenticate, authorize('HOD', 'SUPER_ADMIN', 'ADMIN'), admissionRateLimiter, validateRequest({ body: approvalActionSchema }), admissionController.processApproval);

router.patch('/:id/seat-allocation', authenticate, authorize('HOD', 'SUPER_ADMIN', 'ADMIN'), admissionRateLimiter, validateRequest({ body: seatAllocationActionSchema }), admissionController.allocateSeat);
router.post('/:id/offer-letter/generate', authenticate, authorize('HOD', 'SUPER_ADMIN', 'ADMIN'), admissionRateLimiter, validateRequest({ body: generateOfferLetterSchema }), admissionController.generateOfferLetter);
router.post('/:id/admission-letter/generate', authenticate, authorize('HOD', 'SUPER_ADMIN', 'ADMIN'), admissionRateLimiter, validateRequest({ body: generateAdmissionLetterSchema }), admissionController.generateAdmissionLetter);

router.patch('/:id/fee-trigger', authenticate, authorize('HOD', 'SUPER_ADMIN', 'ADMIN'), admissionRateLimiter, admissionController.triggerFee);

router.post('/:id/waiting-list', authenticate, authorize('HOD', 'SUPER_ADMIN', 'ADMIN'), admissionRateLimiter, admissionController.addToWaitingList);

// ─── ADMIN ────────────────────────────────────────────────────────────────
// Archive, restore, delete, and bulk operations for ADMIN / SUPER_ADMIN.
// Future integration: admin dashboard, audit logs.

router.delete('/:id', authenticate, authorize('SUPER_ADMIN', 'ADMIN'), admissionRateLimiter, admissionController.delete);
router.post('/:id/restore', authenticate, authorize('SUPER_ADMIN', 'ADMIN'), admissionRateLimiter, admissionController.restore);
router.patch('/:id/archive', authenticate, authorize('SUPER_ADMIN', 'ADMIN', 'HOD'), admissionRateLimiter, admissionController.archive);
router.patch('/:id/restore-archive', authenticate, authorize('SUPER_ADMIN', 'ADMIN', 'HOD'), admissionRateLimiter, admissionController.restoreArchive);

// ─── BULK OPERATIONS ───────────────────────────────────────────────────────
// Bulk operation endpoints for ADMIN / SUPER_ADMIN.
// Future integration: bulk admission processing, ERP sync.

router.post('/bulk-approval', authenticate, authorize('SUPER_ADMIN', 'ADMIN'), admissionRateLimiter, validateRequest({ body: bulkApprovalSchema }), admissionController.bulkApproval);
router.post('/bulk', authenticate, authorize('SUPER_ADMIN', 'ADMIN'), admissionRateLimiter, validateRequest({ body: bulkImportAdmissionSchema }), admissionController.bulkCreate);

// ─── STATISTICS ────────────────────────────────────────────────────────────
// Statistics endpoints for ADMIN / SUPER_ADMIN.
// Future integration: admin dashboard, analytics.

router.get('/statistics/status', authenticate, authorize('HOD', 'SUPER_ADMIN', 'ADMIN'), admissionRateLimiter, admissionController.countByStatus);
router.get('/statistics/pending-approval', authenticate, authorize('HOD', 'SUPER_ADMIN', 'ADMIN'), admissionRateLimiter, admissionController.countPendingApproval);
router.get('/statistics/approved', authenticate, authorize('HOD', 'SUPER_ADMIN', 'ADMIN'), admissionRateLimiter, admissionController.countApproved);
router.get('/statistics/rejected', authenticate, authorize('HOD', 'SUPER_ADMIN', 'ADMIN'), admissionRateLimiter, admissionController.countRejected);
router.get('/statistics/waitlisted', authenticate, authorize('HOD', 'SUPER_ADMIN', 'ADMIN'), admissionRateLimiter, admissionController.countWaitlisted);
router.get('/statistics/admitted', authenticate, authorize('HOD', 'SUPER_ADMIN', 'ADMIN'), admissionRateLimiter, admissionController.countAdmitted);

export const admissionRoutes: Router = router;
