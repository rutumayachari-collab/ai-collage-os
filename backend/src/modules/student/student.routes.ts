import { Router, type NextFunction, type Request, type Response } from 'express';
import { studentController } from './student.controller';
import { authenticate } from '../../middleware/auth.middleware';
import { authorize } from '../../middleware/auth.middleware';
import { validateRequest } from '../../middleware/validate-request.middleware';
import {
  createStudentSchema,
  updateStudentSchema,
  studentQuerySchema,
  bulkImportSchema,
  bulkUpdateSchema,
  bulkDeleteSchema,
  linkParentSchema,
} from './student.validator';

const router: Router = Router();

const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX = 30;
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

const studentRateLimiter = (req: Request, res: Response, next: NextFunction): void => {
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

router.get('/', studentRateLimiter, validateRequest({ query: studentQuerySchema }), studentController.findMany);
router.get('/search', studentRateLimiter, validateRequest({ query: studentQuerySchema }), studentController.search);
router.get('/filter', studentRateLimiter, validateRequest({ query: studentQuerySchema }), studentController.filter);
router.get('/department/:departmentId', studentRateLimiter, validateRequest({ query: studentQuerySchema }), studentController.findByDepartment);
router.get('/:id', studentRateLimiter, studentController.findById);

router.post('/', authenticate, authorize('SUPER_ADMIN', 'ADMIN', 'HOD'), studentRateLimiter, validateRequest({ body: createStudentSchema }), studentController.create);
router.patch('/:id', authenticate, authorize('SUPER_ADMIN', 'ADMIN', 'HOD'), studentRateLimiter, validateRequest({ body: updateStudentSchema }), studentController.update);
router.delete('/:id', authenticate, authorize('SUPER_ADMIN', 'ADMIN'), studentRateLimiter, studentController.softDelete);
router.post('/:id/restore', authenticate, authorize('SUPER_ADMIN', 'ADMIN'), studentRateLimiter, studentController.restore);

router.post('/bulk-import', authenticate, authorize('SUPER_ADMIN', 'ADMIN'), studentRateLimiter, validateRequest({ body: bulkImportSchema }), studentController.bulkImport);
router.patch('/bulk-update', authenticate, authorize('SUPER_ADMIN', 'ADMIN', 'HOD'), studentRateLimiter, validateRequest({ body: bulkUpdateSchema }), studentController.bulkUpdate);
router.delete('/bulk-delete', authenticate, authorize('SUPER_ADMIN', 'ADMIN'), studentRateLimiter, validateRequest({ body: bulkDeleteSchema }), studentController.bulkDelete);

router.get('/me/profile', authenticate, studentController.getMyProfile);
router.patch('/me/profile', authenticate, studentRateLimiter, validateRequest({ body: updateStudentSchema }), studentController.updateMyProfile);

router.post('/:id/link-parent', authenticate, authorize('SUPER_ADMIN', 'ADMIN', 'HOD'), studentRateLimiter, validateRequest({ body: linkParentSchema }), studentController.linkParent);
router.delete('/:id/unlink-parent', authenticate, authorize('SUPER_ADMIN', 'ADMIN', 'HOD'), studentRateLimiter, studentController.unlinkParent);

export const studentRoutes: Router = router;
