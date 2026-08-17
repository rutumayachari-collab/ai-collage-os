import { Router, type NextFunction, type Request, type Response } from 'express';
import { examController } from './exam.controller';
import { authenticate } from '../../middleware/auth.middleware';
import { authorize } from '../../middleware/auth.middleware';
import { validateRequest } from '../../middleware/validate-request.middleware';
import {
  createExamSchema,
  updateExamSchema,
  examQuerySchema,
  registerExamSchema,
  publishResultSchema,
  bulkPublishResultSchema,
  bulkUpdateSchema,
  bulkImportSchema,
} from './exam.validator';

// TODO: API versioning - consider prefixing these routes under /api/v2/exams for future breaking changes.
// TODO: OpenAPI/Swagger - document all exam endpoints, request/response schemas, and RBAC requirements.
// TODO: Webhook/event - publish domain events for exam lifecycle changes.
// TODO: Notification hooks - integrate notification service for exam schedules, results, and registrations.
// TODO: AI hooks - integrate AI service for exam difficulty prediction, performance analysis, and recommendations.
// TODO: Audit hooks - log all mutations for compliance and traceability.
// TODO: Metrics - instrument endpoint latency, error rates, and business metrics.
// TODO: Rate limiting - tune limits per role and endpoint sensitivity.

const router: Router = Router();

const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX = 30;
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

const examRateLimiter = (req: Request, res: Response, next: NextFunction): void => {
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

// ─── EXAM CRUD ───────────────────────────────────────────────────────────────
// Core exam management for ADMIN, HOD, FACULTY roles.
// Future integration: academic calendar, timetable engine, ERP sync.

router.get('/', examRateLimiter, validateRequest({ query: examQuerySchema }), examController.list);
router.get('/search', examRateLimiter, validateRequest({ query: examQuerySchema }), examController.search);
router.get('/filter', examRateLimiter, validateRequest({ query: examQuerySchema }), examController.filter);
router.get('/exam-id/:examId', examRateLimiter, examController.findByExamId);
router.get('/code/:code', examRateLimiter, examController.findByCode);
router.get('/:id', examRateLimiter, examController.findById);
router.get('/:id/statistics', examRateLimiter, examController.getStatistics);

router.post('/', authenticate, authorize('SUPER_ADMIN', 'ADMIN', 'HOD', 'FACULTY'), examRateLimiter, validateRequest({ body: createExamSchema }), examController.create);
router.patch('/:id', authenticate, authorize('SUPER_ADMIN', 'ADMIN', 'HOD', 'FACULTY'), examRateLimiter, validateRequest({ body: updateExamSchema }), examController.update);
router.delete('/:id', authenticate, authorize('SUPER_ADMIN', 'ADMIN'), examRateLimiter, examController.delete);
router.post('/:id/restore', authenticate, authorize('SUPER_ADMIN', 'ADMIN'), examRateLimiter, examController.restore);

router.post('/:id/register', authenticate, authorize('STUDENT'), examRateLimiter, validateRequest({ body: registerExamSchema }), examController.register);
router.patch('/:id/results/publish', authenticate, authorize('SUPER_ADMIN', 'ADMIN', 'HOD', 'FACULTY'), examRateLimiter, validateRequest({ body: publishResultSchema }), examController.publishResult);
router.post('/:id/results/bulk-publish', authenticate, authorize('SUPER_ADMIN', 'ADMIN', 'HOD', 'FACULTY'), examRateLimiter, validateRequest({ body: bulkPublishResultSchema }), examController.bulkPublishResults);

router.post('/bulk', authenticate, authorize('SUPER_ADMIN', 'ADMIN'), examRateLimiter, validateRequest({ body: bulkImportSchema }), examController.bulkCreate);
router.patch('/bulk', authenticate, authorize('SUPER_ADMIN', 'ADMIN', 'HOD'), examRateLimiter, validateRequest({ body: bulkUpdateSchema }), examController.bulkUpdate);

export const examRoutes: Router = router;
