import { Router, type NextFunction, type Request, type Response } from 'express';
import { feeController } from './fees.controller';
import { authenticate } from '../../middleware/auth.middleware';
import { authorize } from '../../middleware/auth.middleware';
import { validateRequest } from '../../middleware/validate-request.middleware';
import {
  createFeeStructureSchema,
  updateFeeStructureSchema,
  feeQuerySchema,
  createStudentFeeAccountSchema,
  updateStudentFeeAccountSchema,
  generateInvoiceSchema,
  bulkFeeUpdateSchema,
} from './fees.validator';

const router: Router = Router();

const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX = 30;
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

const feeRateLimiter = (req: Request, res: Response, next: NextFunction): void => {
  const key = (req as { ip?: string }).ip || 'unknown';
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

router.use(authenticate, feeRateLimiter);

router.get('/structures', authorize('ADMIN', 'HOD', 'FACULTY', 'SUPER_ADMIN'), validateRequest({ query: feeQuerySchema }), feeController.getFeeStructures);
router.get('/structures/:id', authorize('ADMIN', 'HOD', 'FACULTY', 'SUPER_ADMIN'), feeController.getFeeStructureById);
router.post('/structures', authorize('ADMIN', 'HOD', 'SUPER_ADMIN'), validateRequest({ body: createFeeStructureSchema }), feeController.createFeeStructure);
router.patch('/structures/:id', authorize('ADMIN', 'HOD', 'SUPER_ADMIN'), validateRequest({ body: updateFeeStructureSchema }), feeController.updateFeeStructure);
router.delete('/structures/:id', authorize('ADMIN', 'HOD', 'SUPER_ADMIN'), feeController.deleteFeeStructure);

router.get('/student/:studentId', authorize('ADMIN', 'HOD', 'FACULTY', 'STUDENT'), feeController.getStudentFeeAccount);
router.get('/accounts', authorize('ADMIN', 'HOD', 'FACULTY', 'SUPER_ADMIN'), validateRequest({ query: feeQuerySchema }), feeController.getStudentFeeAccounts);
router.post('/accounts', authorize('ADMIN', 'HOD', 'SUPER_ADMIN'), validateRequest({ body: createStudentFeeAccountSchema }), feeController.createStudentFeeAccount);
router.patch('/accounts/:id', authorize('ADMIN', 'HOD', 'SUPER_ADMIN'), validateRequest({ body: updateStudentFeeAccountSchema }), feeController.updateStudentFeeAccount);

router.post('/invoices/generate', authorize('ADMIN', 'HOD', 'SUPER_ADMIN'), validateRequest({ body: generateInvoiceSchema }), feeController.generateInvoice);
router.get('/invoices/:studentId', authorize('ADMIN', 'HOD', 'FACULTY', 'STUDENT'), feeController.getInvoices);
router.get('/payments/:studentId', authorize('ADMIN', 'HOD', 'FACULTY', 'STUDENT'), feeController.getPaymentHistory);

router.post('/bulk', authorize('ADMIN', 'HOD', 'SUPER_ADMIN'), validateRequest({ body: bulkFeeUpdateSchema }), feeController.bulkUpdate);

router.get('/statistics/overview', authorize('ADMIN', 'HOD', 'SUPER_ADMIN'), feeController.getStatistics);

export const feeRoutes: Router = router;
