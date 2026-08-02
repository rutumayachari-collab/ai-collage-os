import { Router, type NextFunction, type Request, type Response } from 'express';
import { departmentController } from './department.controller';
import { authenticate } from '../../middleware/auth.middleware';
import { authorize } from '../../middleware/auth.middleware';
import { validateRequest } from '../../middleware/validate-request.middleware';
import {
  createDepartmentSchema,
  updateDepartmentSchema,
  departmentQuerySchema,
  bulkImportSchema,
  bulkUpdateSchema,
  assignHodSchema,
} from './department.validator';

const router: Router = Router();

const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX = 30;
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

const departmentRateLimiter = (req: Request, res: Response, next: NextFunction): void => {
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

router.get('/', departmentRateLimiter, validateRequest({ query: departmentQuerySchema }), departmentController.list);
router.get('/search', departmentRateLimiter, validateRequest({ query: departmentQuerySchema }), departmentController.search);
router.get('/filter', departmentRateLimiter, validateRequest({ query: departmentQuerySchema }), departmentController.filter);
router.get('/code/:code', departmentRateLimiter, departmentController.findByCode);
router.get('/:id', departmentRateLimiter, departmentController.findById);
router.get('/:id/statistics', departmentRateLimiter, departmentController.statistics);

router.post('/', authenticate, authorize('SUPER_ADMIN', 'ADMIN'), departmentRateLimiter, validateRequest({ body: createDepartmentSchema }), departmentController.create);
router.patch('/:id', authenticate, authorize('SUPER_ADMIN', 'ADMIN', 'HOD'), departmentRateLimiter, validateRequest({ body: updateDepartmentSchema }), departmentController.update);
router.delete('/:id', authenticate, authorize('SUPER_ADMIN', 'ADMIN'), departmentRateLimiter, departmentController.softDelete);
router.post('/:id/restore', authenticate, authorize('SUPER_ADMIN', 'ADMIN'), departmentRateLimiter, departmentController.restore);

router.patch('/:id/assign-hod', authenticate, authorize('SUPER_ADMIN', 'ADMIN'), departmentRateLimiter, validateRequest({ body: assignHodSchema }), departmentController.assignHOD);
router.patch('/:id/remove-hod', authenticate, authorize('SUPER_ADMIN', 'ADMIN'), departmentRateLimiter, departmentController.removeHOD);

router.post('/bulk', authenticate, authorize('SUPER_ADMIN', 'ADMIN'), departmentRateLimiter, validateRequest({ body: bulkImportSchema }), departmentController.bulkCreate);
router.patch('/bulk', authenticate, authorize('SUPER_ADMIN', 'ADMIN', 'HOD'), departmentRateLimiter, validateRequest({ body: bulkUpdateSchema }), departmentController.bulkUpdate);

export const departmentRoutes: Router = router;
