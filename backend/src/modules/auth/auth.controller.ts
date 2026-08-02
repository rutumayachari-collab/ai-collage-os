import type { AuthenticatedRequest } from '../../shared/types';
import type { Request, Response } from 'express';
import { HttpStatus } from '../../shared/constants';
import { asyncHandler, sendSuccess } from '../../shared/utils';
import { AuthService, authService } from './auth.service';
import { UnauthorizedError } from '../../shared/utils/api-error.util';
import {
  registerSchema,
  loginSchema,
  refreshSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  verifyEmailSchema,
  type RegisterInput,
  type LoginInput,
  type RefreshInput,
  type ForgotPasswordInput,
  type ResetPasswordInput,
  type VerifyEmailInput,
} from './auth.validator';

export class AuthController {
  constructor(private readonly service: AuthService) {}

  public register = asyncHandler(async (req: Request, res: Response) => {
    const input = registerSchema.parse(req.body) as RegisterInput;
    const result = await this.service.register(input);
    sendSuccess(res, {
      message: 'Registration successful',
      data: result,
      statusCode: HttpStatus.CREATED,
    });
  });

  public login = asyncHandler(async (req: Request, res: Response) => {
    const input = loginSchema.parse(req.body) as LoginInput;
    const result = await this.service.login(input.email, input.password);
    sendSuccess(res, { message: 'Login successful', data: result });
  });

  public refresh = asyncHandler(async (req: Request, res: Response) => {
    const input = refreshSchema.parse(req.body) as RefreshInput;
    const result = await this.service.refreshToken(input.refreshToken);
    sendSuccess(res, { message: 'Token refreshed', data: result });
  });

  public logout = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const user = req.user;
    if (!user) {
      throw new UnauthorizedError('Authentication required');
    }
    await this.service.logout(user.id);
    sendSuccess(res, { message: 'Logged out successfully' });
  });

  public forgotPassword = asyncHandler(async (req: Request, res: Response) => {
    const input = forgotPasswordSchema.parse(req.body) as ForgotPasswordInput;
    await this.service.forgotPassword(input.email);
    sendSuccess(res, {
      message: 'If an account exists, a password reset email has been sent',
    });
  });

  public resetPassword = asyncHandler(async (req: Request, res: Response) => {
    const input = resetPasswordSchema.parse(req.body) as ResetPasswordInput;
    await this.service.resetPassword(input.token, input.password);
    sendSuccess(res, { message: 'Password has been reset successfully' });
  });

  public verifyEmail = asyncHandler(async (req: Request, res: Response) => {
    const input = verifyEmailSchema.parse(req.body) as VerifyEmailInput;
    await this.service.verifyEmail(input.token);
    sendSuccess(res, { message: 'Email verified successfully' });
  });
}

export const authController = new AuthController(authService);
