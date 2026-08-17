import { Router, type NextFunction, type Request, type Response } from 'express';
import { placementController } from './placement.controller';
import { authenticate } from '../../middleware/auth.middleware';
import { authorize } from '../../middleware/auth.middleware';
import { validateRequest } from '../../middleware/validate-request.middleware';
import {
  createCompanySchema,
  updateCompanySchema,
  companyQuerySchema,
  createDriveSchema,
  updateDriveSchema,
  driveQuerySchema,
  createApplicationSchema,
  updateApplicationSchema,
  applicationQuerySchema,
  createInterviewSchema,
  updateInterviewSchema,
  interviewQuerySchema,
  createOfferSchema,
  updateOfferSchema,
  offerQuerySchema,
  createPlacementSchema,
  updatePlacementSchema,
  placementQuerySchema,
  statisticsQuerySchema,
} from './placement.validator';

const router: Router = Router();

const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX = 30;
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

const placementRateLimiter = (req: Request, res: Response, next: NextFunction): void => {
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

// Company routes
router.get('/companies', placementRateLimiter, validateRequest({ query: companyQuerySchema }), placementController.listCompanies);
router.get('/companies/search', placementRateLimiter, validateRequest({ query: companyQuerySchema }), placementController.searchCompanies);
router.get('/companies/company-id/:companyId', placementRateLimiter, placementController.findCompanyByCompanyId);
router.get('/companies/:id', placementRateLimiter, placementController.findCompanyById);
router.post('/companies', authenticate, authorize('SUPER_ADMIN', 'ADMIN', 'HOD'), placementRateLimiter, validateRequest({ body: createCompanySchema }), placementController.createCompany);
router.patch('/companies/:id', authenticate, authorize('SUPER_ADMIN', 'ADMIN', 'HOD'), placementRateLimiter, validateRequest({ body: updateCompanySchema }), placementController.updateCompany);
router.delete('/companies/:id', authenticate, authorize('SUPER_ADMIN', 'ADMIN'), placementRateLimiter, placementController.deleteCompany);
router.patch('/companies/:id/restore', authenticate, authorize('SUPER_ADMIN', 'ADMIN'), placementRateLimiter, placementController.restoreCompany);

// Drive routes
router.get('/drives', placementRateLimiter, validateRequest({ query: driveQuerySchema }), placementController.listDrives);
router.get('/drives/search', placementRateLimiter, validateRequest({ query: driveQuerySchema }), placementController.searchDrives);
router.get('/drives/drive-id/:driveId', placementRateLimiter, placementController.findDriveByDriveId);
router.get('/drives/:id', placementRateLimiter, placementController.findDriveById);
router.post('/drives', authenticate, authorize('SUPER_ADMIN', 'ADMIN', 'HOD'), placementRateLimiter, validateRequest({ body: createDriveSchema }), placementController.createDrive);
router.patch('/drives/:id', authenticate, authorize('SUPER_ADMIN', 'ADMIN', 'HOD'), placementRateLimiter, validateRequest({ body: updateDriveSchema }), placementController.updateDrive);
router.delete('/drives/:id', authenticate, authorize('SUPER_ADMIN', 'ADMIN'), placementRateLimiter, placementController.deleteDrive);
router.patch('/drives/:id/restore', authenticate, authorize('SUPER_ADMIN', 'ADMIN'), placementRateLimiter, placementController.restoreDrive);

// Application routes
router.get('/applications', placementRateLimiter, validateRequest({ query: applicationQuerySchema }), placementController.listApplications);
router.get('/applications/search', placementRateLimiter, validateRequest({ query: applicationQuerySchema }), placementController.searchApplications);
router.get('/applications/application-id/:applicationId', placementRateLimiter, placementController.findApplicationByApplicationId);
router.get('/applications/:id', placementRateLimiter, placementController.findApplicationById);
router.post('/applications', authenticate, authorize('SUPER_ADMIN', 'ADMIN', 'HOD', 'STUDENT'), placementRateLimiter, validateRequest({ body: createApplicationSchema }), placementController.createApplication);
router.patch('/applications/:id', authenticate, authorize('SUPER_ADMIN', 'ADMIN', 'HOD'), placementRateLimiter, validateRequest({ body: updateApplicationSchema }), placementController.updateApplication);
router.delete('/applications/:id', authenticate, authorize('SUPER_ADMIN', 'ADMIN'), placementRateLimiter, placementController.deleteApplication);
router.patch('/applications/:id/restore', authenticate, authorize('SUPER_ADMIN', 'ADMIN'), placementRateLimiter, placementController.restoreApplication);

// Interview routes
router.get('/interviews', placementRateLimiter, validateRequest({ query: interviewQuerySchema }), placementController.listInterviews);
router.get('/interviews/search', placementRateLimiter, validateRequest({ query: interviewQuerySchema }), placementController.searchInterviews);
router.get('/interviews/interview-id/:interviewId', placementRateLimiter, placementController.findInterviewByInterviewId);
router.get('/interviews/:id', placementRateLimiter, placementController.findInterviewById);
router.post('/interviews', authenticate, authorize('SUPER_ADMIN', 'ADMIN', 'HOD'), placementRateLimiter, validateRequest({ body: createInterviewSchema }), placementController.createInterview);
router.patch('/interviews/:id', authenticate, authorize('SUPER_ADMIN', 'ADMIN', 'HOD'), placementRateLimiter, validateRequest({ body: updateInterviewSchema }), placementController.updateInterview);
router.delete('/interviews/:id', authenticate, authorize('SUPER_ADMIN', 'ADMIN'), placementRateLimiter, placementController.deleteInterview);
router.patch('/interviews/:id/restore', authenticate, authorize('SUPER_ADMIN', 'ADMIN'), placementRateLimiter, placementController.restoreInterview);

// Offer routes
router.get('/offers', placementRateLimiter, validateRequest({ query: offerQuerySchema }), placementController.listOffers);
router.get('/offers/search', placementRateLimiter, validateRequest({ query: offerQuerySchema }), placementController.searchOffers);
router.get('/offers/offer-id/:offerId', placementRateLimiter, placementController.findOfferByOfferId);
router.get('/offers/:id', placementRateLimiter, placementController.findOfferById);
router.post('/offers', authenticate, authorize('SUPER_ADMIN', 'ADMIN', 'HOD'), placementRateLimiter, validateRequest({ body: createOfferSchema }), placementController.createOffer);
router.patch('/offers/:id', authenticate, authorize('SUPER_ADMIN', 'ADMIN', 'HOD'), placementRateLimiter, validateRequest({ body: updateOfferSchema }), placementController.updateOffer);
router.delete('/offers/:id', authenticate, authorize('SUPER_ADMIN', 'ADMIN'), placementRateLimiter, placementController.deleteOffer);
router.patch('/offers/:id/restore', authenticate, authorize('SUPER_ADMIN', 'ADMIN'), placementRateLimiter, placementController.restoreOffer);

// Placement routes
router.get('/placements', placementRateLimiter, validateRequest({ query: placementQuerySchema }), placementController.listPlacements);
router.get('/placements/search', placementRateLimiter, validateRequest({ query: placementQuerySchema }), placementController.searchPlacements);
router.get('/placements/placement-id/:placementId', placementRateLimiter, placementController.findPlacementByPlacementId);
router.get('/placements/:id', placementRateLimiter, placementController.findPlacementById);
router.post('/placements', authenticate, authorize('SUPER_ADMIN', 'ADMIN', 'HOD'), placementRateLimiter, validateRequest({ body: createPlacementSchema }), placementController.createPlacement);
router.patch('/placements/:id', authenticate, authorize('SUPER_ADMIN', 'ADMIN', 'HOD'), placementRateLimiter, validateRequest({ body: updatePlacementSchema }), placementController.updatePlacement);
router.delete('/placements/:id', authenticate, authorize('SUPER_ADMIN', 'ADMIN'), placementRateLimiter, placementController.deletePlacement);
router.patch('/placements/:id/restore', authenticate, authorize('SUPER_ADMIN', 'ADMIN'), placementRateLimiter, placementController.restorePlacement);

// Statistics routes
router.get('/statistics', placementRateLimiter, validateRequest({ query: statisticsQuerySchema }), placementController.getPlacementStatistics);
router.post('/statistics/calculate', authenticate, authorize('SUPER_ADMIN', 'ADMIN', 'HOD'), placementRateLimiter, placementController.calculatePlacementStatistics);

export const placementRoutes: Router = router;
