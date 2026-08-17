import { Router, type NextFunction, type Request, type Response } from 'express';
import { transportController } from './transport.controller';
import { authenticate } from '../../middleware/auth.middleware';
import { authorize } from '../../middleware/auth.middleware';
import { validateRequest } from '../../middleware/validate-request.middleware';
import {
  createTransportSchema,
  updateTransportSchema,
  transportQuerySchema,
  bulkImportSchema,
  bulkUpdateSchema,
  assignStudentSchema,
  updateFeeSchema,
  addRouteSchema,
  addVehicleSchema,
  addDriverSchema,
  addStopSchema,
  addFeeSchema,
} from './transport.validator';

const router: Router = Router();

const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX = 30;
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

const transportRateLimiter = (req: Request, res: Response, next: NextFunction): void => {
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

router.get('/', transportRateLimiter, validateRequest({ query: transportQuerySchema }), transportController.list);
router.get('/search', transportRateLimiter, validateRequest({ query: transportQuerySchema }), transportController.search);
router.get('/filter', transportRateLimiter, validateRequest({ query: transportQuerySchema }), transportController.filter);
router.get('/transport-id/:transportId', transportRateLimiter, transportController.findByTransportId);
router.get('/:id', transportRateLimiter, transportController.findById);

router.post('/', authenticate, authorize('SUPER_ADMIN', 'ADMIN', 'HOD'), transportRateLimiter, validateRequest({ body: createTransportSchema }), transportController.create);
router.patch('/:id', authenticate, authorize('SUPER_ADMIN', 'ADMIN', 'HOD'), transportRateLimiter, validateRequest({ body: updateTransportSchema }), transportController.update);
router.delete('/:id', authenticate, authorize('SUPER_ADMIN', 'ADMIN'), transportRateLimiter, transportController.delete);
router.post('/:id/restore', authenticate, authorize('SUPER_ADMIN', 'ADMIN'), transportRateLimiter, transportController.restore);

router.post('/:id/routes', authenticate, authorize('SUPER_ADMIN', 'ADMIN', 'HOD'), transportRateLimiter, validateRequest({ body: addRouteSchema }), transportController.addRoute);
router.patch('/:id/routes/:routeId', authenticate, authorize('SUPER_ADMIN', 'ADMIN', 'HOD'), transportRateLimiter, validateRequest({ body: addRouteSchema }), transportController.updateRoute);
router.delete('/:id/routes/:routeId', authenticate, authorize('SUPER_ADMIN', 'ADMIN', 'HOD'), transportRateLimiter, transportController.removeRoute);

router.post('/:id/vehicles', authenticate, authorize('SUPER_ADMIN', 'ADMIN', 'HOD'), transportRateLimiter, validateRequest({ body: addVehicleSchema }), transportController.addVehicle);
router.patch('/:id/vehicles/:vehicleId', authenticate, authorize('SUPER_ADMIN', 'ADMIN', 'HOD'), transportRateLimiter, validateRequest({ body: addVehicleSchema }), transportController.updateVehicle);
router.delete('/:id/vehicles/:vehicleId', authenticate, authorize('SUPER_ADMIN', 'ADMIN', 'HOD'), transportRateLimiter, transportController.removeVehicle);

router.post('/:id/drivers', authenticate, authorize('SUPER_ADMIN', 'ADMIN', 'HOD'), transportRateLimiter, validateRequest({ body: addDriverSchema }), transportController.addDriver);
router.patch('/:id/drivers/:driverId', authenticate, authorize('SUPER_ADMIN', 'ADMIN', 'HOD'), transportRateLimiter, validateRequest({ body: addDriverSchema }), transportController.updateDriver);
router.delete('/:id/drivers/:driverId', authenticate, authorize('SUPER_ADMIN', 'ADMIN', 'HOD'), transportRateLimiter, transportController.removeDriver);

router.post('/:id/stops', authenticate, authorize('SUPER_ADMIN', 'ADMIN', 'HOD'), transportRateLimiter, validateRequest({ body: addStopSchema }), transportController.addStop);
router.patch('/:id/stops/:stopId', authenticate, authorize('SUPER_ADMIN', 'ADMIN', 'HOD'), transportRateLimiter, validateRequest({ body: addStopSchema }), transportController.updateStop);
router.delete('/:id/stops/:stopId', authenticate, authorize('SUPER_ADMIN', 'ADMIN', 'HOD'), transportRateLimiter, transportController.removeStop);

router.post('/:id/assign', authenticate, authorize('SUPER_ADMIN', 'ADMIN', 'HOD'), transportRateLimiter, validateRequest({ body: assignStudentSchema }), transportController.assignStudent);
router.patch('/:id/assignments/:assignmentId/status', authenticate, authorize('SUPER_ADMIN', 'ADMIN', 'HOD'), transportRateLimiter, transportController.updateAssignmentStatus);
router.get('/:id/assignments/student', authenticate, authorize('STUDENT'), transportRateLimiter, transportController.getStudentAssignment);

router.post('/:id/fees', authenticate, authorize('SUPER_ADMIN', 'ADMIN', 'HOD'), transportRateLimiter, validateRequest({ body: addFeeSchema }), transportController.addFee);
router.patch('/:id/fees/:feeId', authenticate, authorize('SUPER_ADMIN', 'ADMIN', 'HOD'), transportRateLimiter, validateRequest({ body: updateFeeSchema }), transportController.updateFee);
router.get('/:id/fees/student', authenticate, authorize('STUDENT'), transportRateLimiter, transportController.getStudentFee);

router.get('/:id/capacity/:vehicleId', transportRateLimiter, transportController.getVehicleCapacity);

router.post('/bulk', authenticate, authorize('SUPER_ADMIN', 'ADMIN'), transportRateLimiter, validateRequest({ body: bulkImportSchema }), transportController.bulkCreate);
router.patch('/bulk', authenticate, authorize('SUPER_ADMIN', 'ADMIN', 'HOD'), transportRateLimiter, validateRequest({ body: bulkUpdateSchema }), transportController.bulkUpdate);

export const transportRoutes: Router = router;
