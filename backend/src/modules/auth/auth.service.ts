import crypto from 'node:crypto';
import { UserRole, type UserRoleValue } from '../../shared/constants';
import { signAccessToken } from '../../shared/utils/jwt.util';
import { hashPassword, verifyPassword } from '../../shared/utils/password.util';
import { ConflictError, UnauthorizedError } from '../../shared/utils/api-error.util';
import { userRepository, type UserRepository } from './auth.repository';
import { mailService } from '../../shared/services/mail.service';
import { appConfig } from '../../config/app.config';
import { logger } from '../../shared/utils/logger.util';
import type { UserDocument } from './auth.model';

const REFRESH_TOKEN_EXPIRY_MS = 30 * 24 * 60 * 60 * 1000;
const PASSWORD_RESET_EXPIRY_MS = 60 * 60 * 1000;

export interface AuthenticatedResult {
  token: string;
  refreshToken: string;
  user: {
    id: string;
    fullName: string;
    email: string;
    role: UserRoleValue;
  };
}

export class AuthService {
  constructor(private readonly users: UserRepository) {}

  private generateToken(): string {
    return crypto.randomBytes(32).toString('hex');
  }

  private getClientUrl(): string {
    return appConfig.clientUrls[0] || 'http://localhost:8080';
  }

  private async sendMail(to: string, subject: string, text: string, html: string): Promise<void> {
    if (!mailService.isEnabled) {
      logger.warn('Mail service not configured, skipping email send', { to, subject });
      return;
    }

    try {
      await mailService.send({ to, subject, text, html });
    } catch (error) {
      logger.error('Failed to send email', error);
    }
  }

  public async register(input: {
    fullName: string;
    email: string;
    password: string;
    role?: UserRoleValue;
  }): Promise<AuthenticatedResult> {
    const existing = await this.users.findByEmail(input.email);
    if (existing) {
      throw new ConflictError('An account with this email already exists');
    }

    const user = await this.users.create({
      fullName: input.fullName,
      email: input.email.toLowerCase(),
      passwordHash: await hashPassword(input.password),
      role: input.role ?? UserRole.STUDENT,
      isActive: true,
    });

    const emailVerificationToken = this.generateToken();
    await this.users.setEmailVerificationToken(user.id as string, emailVerificationToken);

    const clientUrl = this.getClientUrl();
    await this.sendMail(
      user.email,
      'Verify your email address',
      `Welcome to AICollegeOS! Click the following link to verify your email address: ${clientUrl}/verify-email?token=${emailVerificationToken}`,
      `<p>Welcome to AICollegeOS! Click <a href="${clientUrl}/verify-email?token=${emailVerificationToken}">here</a> to verify your email address.</p>`,
    );

    return this.toAuthenticatedResult(user);
  }

  public async login(email: string, password: string): Promise<AuthenticatedResult> {
    const user = await this.users.findByEmail(email, true);

    if (!user || !user.isActive) {
      throw new UnauthorizedError('Invalid email or password');
    }

    const passwordMatches = await verifyPassword(password, user.passwordHash);
    if (!passwordMatches) {
      throw new UnauthorizedError('Invalid email or password');
    }

    await this.users.touchLastLogin(user.id as string);
    return this.toAuthenticatedResult(user);
  }

  public async refreshToken(refreshToken: string): Promise<AuthenticatedResult> {
    const user = await this.users.findByRefreshToken(refreshToken);
    if (!user || !user.isActive) {
      throw new UnauthorizedError('Invalid or expired refresh token');
    }

    return this.toAuthenticatedResult(user);
  }

  public async logout(userId: string): Promise<void> {
    await this.users.clearRefreshToken(userId);
  }

  public async forgotPassword(email: string): Promise<void> {
    const user = await this.users.findByEmail(email);
    if (!user) {
      return;
    }

    const token = this.generateToken();
    const expires = new Date(Date.now() + PASSWORD_RESET_EXPIRY_MS);
    await this.users.setPasswordResetToken(user.id as string, token, expires);

    const clientUrl = this.getClientUrl();
    await this.sendMail(
      user.email,
      'Password reset request',
      `Click the following link to reset your password: ${clientUrl}/reset-password?token=${token}. This link expires in 1 hour.`,
      `<p>Click <a href="${clientUrl}/reset-password?token=${token}">here</a> to reset your password. This link expires in 1 hour.</p>`,
    );
  }

  public async resetPassword(token: string, newPassword: string): Promise<void> {
    const user = await this.users.findByPasswordResetToken(token);
    if (!user) {
      throw new UnauthorizedError('Invalid or expired reset token');
    }

    const passwordHash = await hashPassword(newPassword);
    await this.users.updateById(user.id as string, { passwordHash });
    await this.users.clearPasswordResetToken(user.id as string);
    await this.users.clearRefreshToken(user.id as string);
  }

  public async verifyEmail(token: string): Promise<void> {
    const user = await this.users.findByEmailVerificationToken(token);
    if (!user) {
      throw new UnauthorizedError('Invalid or expired verification token');
    }

    await this.users.setEmailVerified(user.id as string);
    await this.users.clearEmailVerificationToken(user.id as string);
  }

  private async toAuthenticatedResult(user: UserDocument): Promise<AuthenticatedResult> {
    const id = user.id as string;
    const refreshToken = this.generateToken();
    const expires = new Date(Date.now() + REFRESH_TOKEN_EXPIRY_MS);

    await this.users.setRefreshToken(id, refreshToken, expires);

    return {
      token: signAccessToken({ sub: id, email: user.email, role: user.role }),
      refreshToken,
      user: {
        id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
      },
    };
  }
}

export const authService = new AuthService(userRepository);
