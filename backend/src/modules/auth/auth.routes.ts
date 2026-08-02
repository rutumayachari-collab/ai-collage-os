import { Router, type NextFunction, type Request, type Response } from 'express';
import { authController } from './auth.controller';
import { authenticate } from '../../middleware/auth.middleware';
import { validateRequest } from '../../middleware/validate-request.middleware';
import {
  registerSchema,
  loginSchema,
  refreshSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  verifyEmailSchema,
} from './auth.validator';

const router: Router = Router();

const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX = 10;
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

const authRateLimiter = (req: Request, res: Response, next: NextFunction): void => {
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
      message: 'Too many attempts, please try again later',
      code: 'RATE_LIMITED',
      timestamp: new Date().toISOString(),
    });
    return;
  }

  entry.count += 1;
  next();
};

router.post('/register', authRateLimiter, validateRequest({ body: registerSchema }), authController.register);
router.post('/login', authRateLimiter, validateRequest({ body: loginSchema }), authController.login);
router.post('/refresh', authRateLimiter, validateRequest({ body: refreshSchema }), authController.refresh);
router.post('/logout', authenticate, authController.logout);
router.post('/forgot-password', authRateLimiter, validateRequest({ body: forgotPasswordSchema }), authController.forgotPassword);
router.post('/reset-password', authRateLimiter, validateRequest({ body: resetPasswordSchema }), authController.resetPassword);
router.post('/verify-email', authRateLimiter, validateRequest({ body: verifyEmailSchema }), authController.verifyEmail);

export const authRoutes: Router = router;
