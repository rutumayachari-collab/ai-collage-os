import { Router, type NextFunction, type Request, type Response } from 'express';
import { facultyController } from './faculty.controller';
import { authenticate } from '../../middleware/auth.middleware';
import { authorize } from '../../middleware/auth.middleware';
import { validateRequest } from '../../middleware/validate-request.middleware';
import {
  createFacultySchema,
  updateFacultySchema,
  facultyQuerySchema,
  bulkImportSchema,
  bulkUpdateSchema,
  assignDepartmentSchema,
  assignCourseSchema,
  assignSubjectSchema,
  updateOfficeSchema,
  facultyTeachingLoadSchema,
  facultyLeaveBalanceSchema,
  facultyAvailabilitySchema,
  facultyCommitteeAssignmentSchema,
  facultyResearchProjectSchema,
} from './faculty.validator';

const router: Router = Router();

const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX = 30;
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

const facultyRateLimiter = (req: Request, res: Response, next: NextFunction): void => {
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

router.get('/', facultyRateLimiter, validateRequest({ query: facultyQuerySchema }), facultyController.list);
router.get('/search', facultyRateLimiter, validateRequest({ query: facultyQuerySchema }), facultyController.search);
router.get('/filter', facultyRateLimiter, validateRequest({ query: facultyQuerySchema }), facultyController.filter);
router.get('/employee-id/:employeeId', facultyRateLimiter, facultyController.findByEmployeeId);
router.get('/email/:email', facultyRateLimiter, facultyController.findByEmail);
router.get('/official-email/:officialEmail', facultyRateLimiter, facultyController.findByOfficialEmail);
router.get('/:id', facultyRateLimiter, facultyController.findById);
router.get('/:id/public-profile', facultyRateLimiter, facultyController.publicProfile);
router.get('/:id/statistics', facultyRateLimiter, facultyController.statistics);

router.post('/', authenticate, authorize('SUPER_ADMIN', 'ADMIN'), facultyRateLimiter, validateRequest({ body: createFacultySchema }), facultyController.create);
router.patch('/:id', authenticate, authorize('SUPER_ADMIN', 'ADMIN', 'HOD'), facultyRateLimiter, validateRequest({ body: updateFacultySchema }), facultyController.update);
router.delete('/:id', authenticate, authorize('SUPER_ADMIN', 'ADMIN'), facultyRateLimiter, facultyController.softDelete);
router.post('/:id/restore', authenticate, authorize('SUPER_ADMIN', 'ADMIN'), facultyRateLimiter, facultyController.restore);

router.patch('/:id/archive', authenticate, authorize('SUPER_ADMIN', 'ADMIN'), facultyRateLimiter, facultyController.archiveFaculty);
router.patch('/:id/restore-archive', authenticate, authorize('SUPER_ADMIN', 'ADMIN'), facultyRateLimiter, facultyController.restoreArchivedFaculty);

router.patch('/:id/assign-department', authenticate, authorize('SUPER_ADMIN', 'ADMIN', 'HOD'), facultyRateLimiter, validateRequest({ body: assignDepartmentSchema }), facultyController.assignDepartment);
router.delete('/:id/departments/:departmentId', authenticate, authorize('SUPER_ADMIN', 'ADMIN', 'HOD'), facultyRateLimiter, facultyController.removeDepartment);

router.post('/:id/assign-course', authenticate, authorize('SUPER_ADMIN', 'ADMIN', 'HOD'), facultyRateLimiter, validateRequest({ body: assignCourseSchema }), facultyController.assignCourse);
router.post('/:id/assign-subject', authenticate, authorize('SUPER_ADMIN', 'ADMIN', 'HOD'), facultyRateLimiter, validateRequest({ body: assignSubjectSchema }), facultyController.assignSubject);

router.patch('/:id/teaching-load', authenticate, authorize('SUPER_ADMIN', 'ADMIN', 'HOD'), facultyRateLimiter, validateRequest({ body: facultyTeachingLoadSchema }), facultyController.updateTeachingLoad);
router.patch('/:id/leave-balance', authenticate, authorize('SUPER_ADMIN', 'ADMIN', 'HOD'), facultyRateLimiter, validateRequest({ body: facultyLeaveBalanceSchema }), facultyController.updateLeaveBalance);
router.patch('/:id/office-hours', authenticate, authorize('SUPER_ADMIN', 'ADMIN', 'HOD'), facultyRateLimiter, validateRequest({ body: updateOfficeSchema }), facultyController.updateOfficeHours);
router.patch('/:id/availability', authenticate, authorize('SUPER_ADMIN', 'ADMIN', 'HOD'), facultyRateLimiter, validateRequest({ body: facultyAvailabilitySchema }), facultyController.updateAvailability);

router.post('/:id/committees', authenticate, authorize('SUPER_ADMIN', 'ADMIN', 'HOD'), facultyRateLimiter, validateRequest({ body: facultyCommitteeAssignmentSchema }), facultyController.addCommitteeAssignment);
router.patch('/:id/committees/:committeeId', authenticate, authorize('SUPER_ADMIN', 'ADMIN', 'HOD'), facultyRateLimiter, validateRequest({ body: facultyCommitteeAssignmentSchema }), facultyController.updateCommitteeAssignment);
router.delete('/:id/committees/:committeeId', authenticate, authorize('SUPER_ADMIN', 'ADMIN', 'HOD'), facultyRateLimiter, facultyController.removeCommitteeAssignment);

router.post('/:id/research-projects', authenticate, authorize('SUPER_ADMIN', 'ADMIN', 'HOD'), facultyRateLimiter, validateRequest({ body: facultyResearchProjectSchema }), facultyController.addResearchProject);
router.patch('/:id/research-projects/:projectTitle', authenticate, authorize('SUPER_ADMIN', 'ADMIN', 'HOD'), facultyRateLimiter, validateRequest({ body: facultyResearchProjectSchema }), facultyController.updateResearchProject);
router.delete('/:id/research-projects/:projectTitle', authenticate, authorize('SUPER_ADMIN', 'ADMIN', 'HOD'), facultyRateLimiter, facultyController.removeResearchProject);

router.post('/bulk', authenticate, authorize('SUPER_ADMIN', 'ADMIN'), facultyRateLimiter, validateRequest({ body: bulkImportSchema }), facultyController.bulkCreate);
router.patch('/bulk', authenticate, authorize('SUPER_ADMIN', 'ADMIN', 'HOD'), facultyRateLimiter, validateRequest({ body: bulkUpdateSchema }), facultyController.bulkUpdate);

export const facultyRoutes: Router = router;
