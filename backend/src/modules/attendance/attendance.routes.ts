import { Router, type NextFunction, type Request, type Response } from 'express';
import { attendanceController } from './attendance.controller';
import { authenticate } from '../../middleware/auth.middleware';
import { authorize } from '../../middleware/auth.middleware';
import { validateRequest } from '../../middleware/validate-request.middleware';
import {
  createAttendanceRecordSchema,
  updateAttendanceRecordSchema,
  attendanceQuerySchema,
  bulkMarkAttendanceSchema,
  attendanceStatisticsQuerySchema,
} from './attendance.validator';

const router: Router = Router();

const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX = 30;
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

const attendanceRateLimiter = (req: Request, res: Response, next: NextFunction): void => {
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

router.get('/', authenticate, authorize('SUPER_ADMIN', 'ADMIN', 'HOD', 'FACULTY'), attendanceRateLimiter, validateRequest({ query: attendanceQuerySchema }), attendanceController.list);
router.get('/search', authenticate, authorize('SUPER_ADMIN', 'ADMIN', 'HOD', 'FACULTY'), attendanceRateLimiter, validateRequest({ query: attendanceQuerySchema }), attendanceController.search);
router.get('/filter', authenticate, authorize('SUPER_ADMIN', 'ADMIN', 'HOD', 'FACULTY'), attendanceRateLimiter, validateRequest({ query: attendanceQuerySchema }), attendanceController.filter);
router.get('/student/:studentId', authenticate, authorize('SUPER_ADMIN', 'ADMIN', 'HOD', 'FACULTY'), attendanceRateLimiter, attendanceController.list);
router.get('/subject/:subjectId', authenticate, authorize('SUPER_ADMIN', 'ADMIN', 'HOD', 'FACULTY'), attendanceRateLimiter, attendanceController.list);
router.get('/:id', authenticate, authorize('SUPER_ADMIN', 'ADMIN', 'HOD', 'FACULTY'), attendanceRateLimiter, attendanceController.getById);

router.post('/', authenticate, authorize('SUPER_ADMIN', 'ADMIN', 'HOD', 'FACULTY'), attendanceRateLimiter, validateRequest({ body: createAttendanceRecordSchema }), attendanceController.create);
router.patch('/:id', authenticate, authorize('SUPER_ADMIN', 'ADMIN', 'HOD', 'FACULTY'), attendanceRateLimiter, validateRequest({ body: updateAttendanceRecordSchema }), attendanceController.update);
router.delete('/:id', authenticate, authorize('SUPER_ADMIN', 'ADMIN', 'HOD'), attendanceRateLimiter, attendanceController.delete);
router.post('/:id/restore', authenticate, authorize('SUPER_ADMIN', 'ADMIN', 'HOD'), attendanceRateLimiter, attendanceController.restore);

router.post('/bulk-mark', authenticate, authorize('SUPER_ADMIN', 'ADMIN', 'HOD', 'FACULTY'), attendanceRateLimiter, validateRequest({ body: bulkMarkAttendanceSchema }), attendanceController.bulkMark);

router.get('/me/attendance', authenticate, attendanceRateLimiter, attendanceController.getMyAttendance);
router.get('/me/summary/:subjectId', authenticate, attendanceRateLimiter, attendanceController.getMyAttendanceSummary);
router.get('/me/monthly/:subjectId/:month/:year', authenticate, attendanceRateLimiter, attendanceController.getMonthlySummary);

router.get('/statistics/overall', authenticate, authorize('SUPER_ADMIN', 'ADMIN', 'HOD', 'FACULTY'), attendanceRateLimiter, validateRequest({ query: attendanceStatisticsQuerySchema }), attendanceController.getOverallStatistics);
router.get('/statistics/subject/:subjectId', authenticate, authorize('SUPER_ADMIN', 'ADMIN', 'HOD', 'FACULTY'), attendanceRateLimiter, attendanceController.getSubjectWiseStatistics);
router.get('/statistics/student/:studentId', authenticate, authorize('SUPER_ADMIN', 'ADMIN', 'HOD', 'FACULTY'), attendanceRateLimiter, attendanceController.getStudentWiseStatistics);

router.get('/student/:studentId/percentage/:subjectId', authenticate, authorize('SUPER_ADMIN', 'ADMIN', 'HOD', 'FACULTY'), attendanceRateLimiter, attendanceController.getStudentAttendancePercentage);

export const attendanceRoutes: Router = router;
