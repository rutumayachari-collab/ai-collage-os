import { Router, type NextFunction, type Request, type Response } from 'express';
import { courseController } from './course.controller';
import { authenticate } from '../../middleware/auth.middleware';
import { authorize } from '../../middleware/auth.middleware';
import { validateRequest } from '../../middleware/validate-request.middleware';
import {
  createCourseSchema,
  updateCourseSchema,
  courseQuerySchema,
  bulkImportSchema,
  bulkUpdateSchema,
  updateCurriculumSchema,
  updateSemesterSchema,
  assignPrimaryCoordinatorSchema,
  addCoCoordinatorSchema,
} from './course.validator';

const router: Router = Router();

const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX = 30;
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

const courseRateLimiter = (req: Request, res: Response, next: NextFunction): void => {
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

router.get('/', courseRateLimiter, validateRequest({ query: courseQuerySchema }), courseController.list);
router.get('/search', courseRateLimiter, validateRequest({ query: courseQuerySchema }), courseController.search);
router.get('/filter', courseRateLimiter, validateRequest({ query: courseQuerySchema }), courseController.filter);
router.get('/code/:code', courseRateLimiter, courseController.findByCode);
router.get('/course-id/:courseId', courseRateLimiter, courseController.findByCourseId);
router.get('/:id', courseRateLimiter, courseController.findById);
router.get('/:id/statistics', courseRateLimiter, courseController.statistics);
router.get('/:id/curriculum-history', courseRateLimiter, courseController.getCurriculumHistory);

router.post('/', authenticate, authorize('SUPER_ADMIN', 'ADMIN'), courseRateLimiter, validateRequest({ body: createCourseSchema }), courseController.create);
router.patch('/:id', authenticate, authorize('SUPER_ADMIN', 'ADMIN', 'HOD'), courseRateLimiter, validateRequest({ body: updateCourseSchema }), courseController.update);
router.delete('/:id', authenticate, authorize('SUPER_ADMIN', 'ADMIN'), courseRateLimiter, courseController.deleteCourse);
router.post('/:id/restore', authenticate, authorize('SUPER_ADMIN', 'ADMIN'), courseRateLimiter, courseController.restoreCourse);

router.patch('/:id/archive', authenticate, authorize('SUPER_ADMIN', 'ADMIN'), courseRateLimiter, courseController.archiveCourse);
router.patch('/:id/restore-archive', authenticate, authorize('SUPER_ADMIN', 'ADMIN'), courseRateLimiter, courseController.restoreArchivedCourse);

router.patch('/:id/primary-coordinator', authenticate, authorize('SUPER_ADMIN', 'ADMIN', 'HOD'), courseRateLimiter, validateRequest({ body: assignPrimaryCoordinatorSchema }), courseController.assignPrimaryCoordinator);
router.post('/:id/co-coordinators', authenticate, authorize('SUPER_ADMIN', 'ADMIN', 'HOD'), courseRateLimiter, validateRequest({ body: addCoCoordinatorSchema }), courseController.addCoCoordinator);
router.delete('/:id/co-coordinators/:facultyId', authenticate, authorize('SUPER_ADMIN', 'ADMIN', 'HOD'), courseRateLimiter, courseController.removeCoCoordinator);

router.patch('/:id/curriculum', authenticate, authorize('SUPER_ADMIN', 'ADMIN'), courseRateLimiter, validateRequest({ body: updateCurriculumSchema }), courseController.updateCurriculum);
router.patch('/:id/semester-structure', authenticate, authorize('SUPER_ADMIN', 'ADMIN', 'HOD'), courseRateLimiter, validateRequest({ body: updateSemesterSchema }), courseController.updateSemesterStructure);

router.post('/bulk', authenticate, authorize('SUPER_ADMIN', 'ADMIN'), courseRateLimiter, validateRequest({ body: bulkImportSchema }), courseController.bulkCreate);
router.patch('/bulk', authenticate, authorize('SUPER_ADMIN', 'ADMIN', 'HOD'), courseRateLimiter, validateRequest({ body: bulkUpdateSchema }), courseController.bulkUpdate);

export const courseRoutes: Router = router;
