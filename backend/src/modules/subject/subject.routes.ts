import { Router, type NextFunction, type Request, type Response } from 'express';
import { subjectController } from './subject.controller';
import { authenticate } from '../../middleware/auth.middleware';
import { authorize } from '../../middleware/auth.middleware';
import { validateRequest } from '../../middleware/validate-request.middleware';
import {
  createSubjectSchema,
  updateSubjectSchema,
  subjectQuerySchema,
  bulkImportSchema,
  bulkUpdateSchema,
  assignFacultySchema,
  assignPrerequisiteSchema,
  createVersionSchema,
  approveVersionSchema,
  rejectVersionSchema,
  uploadDocumentSchema,
  verifyDocumentSchema,
  addLearningResourceSchema,
} from './subject.validator';

const router: Router = Router();

const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX = 30;
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

const subjectRateLimiter = (req: Request, res: Response, next: NextFunction): void => {
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

router.get('/', subjectRateLimiter, validateRequest({ query: subjectQuerySchema }), subjectController.list);
router.get('/search', subjectRateLimiter, validateRequest({ query: subjectQuerySchema }), subjectController.search);
router.get('/filter', subjectRateLimiter, validateRequest({ query: subjectQuerySchema }), subjectController.filter);
router.get('/subject-id/:subjectId', subjectRateLimiter, subjectController.findBySubjectId);
router.get('/code/:code', subjectRateLimiter, subjectController.findByCode);
router.get('/:id', subjectRateLimiter, subjectController.findById);
router.get('/:id/outcome-mapping', subjectRateLimiter, subjectController.getOutcomeMapping);
router.get('/:id/outcome-coverage', subjectRateLimiter, subjectController.calculateOutcomeCoverage);
router.get('/:id/version-history', subjectRateLimiter, subjectController.getVersionHistory);
router.get('/:id/documents', subjectRateLimiter, subjectController.listDocuments);
router.get('/:id/learning-resources/recommend', subjectRateLimiter, subjectController.recommendLearningResources);
router.get('/:id/learning-resources', subjectRateLimiter, subjectController.listLearningResources);
router.get('/:id/statistics', subjectRateLimiter, subjectController.getSubjectStatistics);
router.get('/:id/prerequisite-graph', subjectRateLimiter, subjectController.getPrerequisiteGraph);
router.get('/:id/versions/compare/:versionA/:versionB', subjectRateLimiter, subjectController.compareVersions);

router.post('/', authenticate, authorize('SUPER_ADMIN', 'ADMIN'), subjectRateLimiter, validateRequest({ body: createSubjectSchema }), subjectController.create);
router.patch('/:id', authenticate, authorize('SUPER_ADMIN', 'ADMIN', 'HOD'), subjectRateLimiter, validateRequest({ body: updateSubjectSchema }), subjectController.update);
router.delete('/:id', authenticate, authorize('SUPER_ADMIN', 'ADMIN'), subjectRateLimiter, subjectController.delete);
router.post('/:id/restore', authenticate, authorize('SUPER_ADMIN', 'ADMIN'), subjectRateLimiter, subjectController.restoreSubject);

router.patch('/:id/archive', authenticate, authorize('SUPER_ADMIN', 'ADMIN'), subjectRateLimiter, subjectController.archiveSubject);
router.patch('/:id/restore-archive', authenticate, authorize('SUPER_ADMIN', 'ADMIN'), subjectRateLimiter, subjectController.restoreArchivedSubject);

router.patch('/:id/primary-faculty', authenticate, authorize('SUPER_ADMIN', 'ADMIN', 'HOD'), subjectRateLimiter, validateRequest({ body: assignFacultySchema }), subjectController.assignPrimaryFaculty);
router.post('/:id/co-faculty', authenticate, authorize('SUPER_ADMIN', 'ADMIN', 'HOD'), subjectRateLimiter, validateRequest({ body: assignFacultySchema }), subjectController.addCoFaculty);
router.delete('/:id/co-faculty/:facultyId', authenticate, authorize('SUPER_ADMIN', 'ADMIN', 'HOD'), subjectRateLimiter, subjectController.removeCoFaculty);

router.post('/:id/prerequisites', authenticate, authorize('SUPER_ADMIN', 'ADMIN', 'HOD'), subjectRateLimiter, validateRequest({ body: assignPrerequisiteSchema }), subjectController.addPrerequisite);
router.delete('/:id/prerequisites/:prerequisiteSubjectId', authenticate, authorize('SUPER_ADMIN', 'ADMIN', 'HOD'), subjectRateLimiter, subjectController.removePrerequisite);

router.patch('/:id/outcome-mapping', authenticate, authorize('SUPER_ADMIN', 'ADMIN', 'HOD'), subjectRateLimiter, subjectController.updateOutcomeMapping);

router.post('/:id/versions', authenticate, authorize('SUPER_ADMIN', 'ADMIN', 'HOD'), subjectRateLimiter, validateRequest({ body: createVersionSchema }), subjectController.createVersion);
router.patch('/:id/versions/:version/approve', authenticate, authorize('SUPER_ADMIN', 'ADMIN', 'HOD'), subjectRateLimiter, validateRequest({ body: approveVersionSchema }), subjectController.approveVersion);
router.patch('/:id/versions/:version/reject', authenticate, authorize('SUPER_ADMIN', 'ADMIN', 'HOD'), subjectRateLimiter, validateRequest({ body: rejectVersionSchema }), subjectController.rejectVersion);
router.patch('/:id/versions/:version/publish', authenticate, authorize('SUPER_ADMIN', 'ADMIN', 'HOD'), subjectRateLimiter, subjectController.publishVersion);
router.patch('/:id/versions/:version/restore', authenticate, authorize('SUPER_ADMIN', 'ADMIN', 'HOD'), subjectRateLimiter, subjectController.restoreVersion);

router.post('/:id/documents', authenticate, authorize('SUPER_ADMIN', 'ADMIN', 'HOD'), subjectRateLimiter, validateRequest({ body: uploadDocumentSchema }), subjectController.addDocument);
router.patch('/:id/documents/:documentId', authenticate, authorize('SUPER_ADMIN', 'ADMIN', 'HOD'), subjectRateLimiter, subjectController.updateDocument);
router.patch('/:id/documents/:documentId/verify', authenticate, authorize('SUPER_ADMIN', 'ADMIN', 'HOD'), subjectRateLimiter, validateRequest({ body: verifyDocumentSchema }), subjectController.verifyDocument);
router.delete('/:id/documents/:documentId', authenticate, authorize('SUPER_ADMIN', 'ADMIN', 'HOD'), subjectRateLimiter, subjectController.removeDocument);

router.post('/:id/learning-resources', authenticate, authorize('SUPER_ADMIN', 'ADMIN', 'HOD'), subjectRateLimiter, validateRequest({ body: addLearningResourceSchema }), subjectController.addLearningResource);
router.patch('/:id/learning-resources/:resourceId', authenticate, authorize('SUPER_ADMIN', 'ADMIN', 'HOD'), subjectRateLimiter, subjectController.updateLearningResource);
router.delete('/:id/learning-resources/:resourceId', authenticate, authorize('SUPER_ADMIN', 'ADMIN', 'HOD'), subjectRateLimiter, subjectController.removeLearningResource);
router.patch('/:id/learning-resources/:resourceId/verify', authenticate, authorize('SUPER_ADMIN', 'ADMIN', 'HOD'), subjectRateLimiter, subjectController.verifyLearningResource);

router.patch('/:id/statistics/recalculate', authenticate, authorize('SUPER_ADMIN', 'ADMIN', 'HOD'), subjectRateLimiter, subjectController.recalculateStatistics);

router.post('/bulk', authenticate, authorize('SUPER_ADMIN', 'ADMIN'), subjectRateLimiter, validateRequest({ body: bulkImportSchema }), subjectController.bulkCreate);
router.patch('/bulk', authenticate, authorize('SUPER_ADMIN', 'ADMIN', 'HOD'), subjectRateLimiter, validateRequest({ body: bulkUpdateSchema }), subjectController.bulkUpdate);

export const subjectRoutes: Router = router;
