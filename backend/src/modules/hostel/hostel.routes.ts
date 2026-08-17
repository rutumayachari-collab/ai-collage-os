import { Router, type NextFunction, type Request, type Response } from 'express';
import { hostelController } from './hostel.controller';
import { authenticate } from '../../middleware/auth.middleware';
import { authorize } from '../../middleware/auth.middleware';
import { validateRequest } from '../../middleware/validate-request.middleware';
import {
  createHostelSchema,
  updateHostelSchema,
  hostelQuerySchema,
  createRoomSchema,
  updateRoomSchema,
  roomQuerySchema,
  createAllocationSchema,
  updateAllocationSchema,
  allocationQuerySchema,
  checkInSchema,
  checkOutSchema,
  createFeeSchema,
  updateFeeSchema,
  feeQuerySchema,
} from './hostel.validator';

const router: Router = Router();

const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX = 30;
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

const hostelRateLimiter = (req: Request, res: Response, next: NextFunction): void => {
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

// ─── HOSTEL ROUTES ────────────────────────────────────────────────────────────

router.get('/', hostelRateLimiter, validateRequest({ query: hostelQuerySchema }), hostelController.listHostels);
router.get('/search', hostelRateLimiter, validateRequest({ query: hostelQuerySchema }), hostelController.listHostels);
router.get('/:id', hostelRateLimiter, hostelController.getHostel);
router.get('/:id/statistics', hostelRateLimiter, hostelController.getHostelStatistics);

router.post('/', authenticate, authorize('SUPER_ADMIN', 'ADMIN', 'HOD'), hostelRateLimiter, validateRequest({ body: createHostelSchema }), hostelController.createHostel);
router.patch('/:id', authenticate, authorize('SUPER_ADMIN', 'ADMIN', 'HOD'), hostelRateLimiter, validateRequest({ body: updateHostelSchema }), hostelController.updateHostel);
router.delete('/:id', authenticate, authorize('SUPER_ADMIN', 'ADMIN'), hostelRateLimiter, hostelController.deleteHostel);
router.post('/:id/restore', authenticate, authorize('SUPER_ADMIN', 'ADMIN'), hostelRateLimiter, hostelController.restoreHostel);

// ─── ROOM ROUTES ─────────────────────────────────────────────────────────────

router.get('/:hostelId/rooms', hostelRateLimiter, validateRequest({ query: roomQuerySchema }), hostelController.listRooms);
router.get('/:hostelId/rooms/:roomId', hostelRateLimiter, hostelController.getRoom);
router.get('/:hostelId/rooms/:roomId/vacancy', hostelRateLimiter, hostelController.getVacancy);

router.post('/:hostelId/rooms', authenticate, authorize('SUPER_ADMIN', 'ADMIN', 'HOD'), hostelRateLimiter, validateRequest({ body: createRoomSchema }), hostelController.createRoom);
router.patch('/:hostelId/rooms/:roomId', authenticate, authorize('SUPER_ADMIN', 'ADMIN', 'HOD'), hostelRateLimiter, validateRequest({ body: updateRoomSchema }), hostelController.updateRoom);
router.delete('/:hostelId/rooms/:roomId', authenticate, authorize('SUPER_ADMIN', 'ADMIN'), hostelRateLimiter, hostelController.deleteRoom);
router.post('/:hostelId/rooms/:roomId/restore', authenticate, authorize('SUPER_ADMIN', 'ADMIN'), hostelRateLimiter, hostelController.restoreRoom);

// ─── ALLOCATION ROUTES ───────────────────────────────────────────────────────

router.get('/allocations', hostelRateLimiter, validateRequest({ query: allocationQuerySchema }), hostelController.listAllocations);
router.get('/allocations/search', hostelRateLimiter, validateRequest({ query: allocationQuerySchema }), hostelController.listAllocations);
router.get('/allocations/:id', hostelRateLimiter, hostelController.getAllocation);
router.get('/allocations/:id/check-in', authenticate, authorize('SUPER_ADMIN', 'ADMIN', 'HOD'), hostelRateLimiter, validateRequest({ body: checkInSchema }), hostelController.checkIn);
router.get('/allocations/:id/check-out', authenticate, authorize('SUPER_ADMIN', 'ADMIN', 'HOD'), hostelRateLimiter, validateRequest({ body: checkOutSchema }), hostelController.checkOut);

router.post('/allocations', authenticate, authorize('SUPER_ADMIN', 'ADMIN', 'HOD'), hostelRateLimiter, validateRequest({ body: createAllocationSchema }), hostelController.createAllocation);
router.patch('/allocations/:id', authenticate, authorize('SUPER_ADMIN', 'ADMIN', 'HOD'), hostelRateLimiter, validateRequest({ body: updateAllocationSchema }), hostelController.updateAllocation);
router.delete('/allocations/:id', authenticate, authorize('SUPER_ADMIN', 'ADMIN'), hostelRateLimiter, hostelController.deleteAllocation);
router.post('/allocations/:id/restore', authenticate, authorize('SUPER_ADMIN', 'ADMIN'), hostelRateLimiter, hostelController.restoreAllocation);

router.get('/allocations/status/:status/count', hostelRateLimiter, hostelController.countAllocationsByStatus);

// ─── FEE ROUTES ──────────────────────────────────────────────────────────────

router.get('/fees', hostelRateLimiter, validateRequest({ query: feeQuerySchema }), hostelController.listFees);
router.get('/fees/search', hostelRateLimiter, validateRequest({ query: feeQuerySchema }), hostelController.listFees);
router.get('/fees/:id', hostelRateLimiter, hostelController.getFee);
router.get('/fees/status/:status/count', hostelRateLimiter, hostelController.countFeesByStatus);
router.get('/fees/overdue/count', hostelRateLimiter, hostelController.countOverdueFees);

router.post('/fees', authenticate, authorize('SUPER_ADMIN', 'ADMIN', 'HOD'), hostelRateLimiter, validateRequest({ body: createFeeSchema }), hostelController.createFee);
router.patch('/fees/:id', authenticate, authorize('SUPER_ADMIN', 'ADMIN', 'HOD'), hostelRateLimiter, validateRequest({ body: updateFeeSchema }), hostelController.updateFee);
router.delete('/fees/:id', authenticate, authorize('SUPER_ADMIN', 'ADMIN'), hostelRateLimiter, hostelController.deleteFee);

export const hostelRoutes: Router = router;
