import nodemailer, { type Transporter } from 'nodemailer';
import { mailConfig } from '../../config/app.config';
import { ErrorCode } from '../constants';
import { ApiError } from '../utils/api-error.util';
import { HttpStatus } from '../constants';
import { logger } from '../utils/logger.util';

export interface MailMessage {
  to: string | string[];
  subject: string;
  text: string;
  html?: string;
}

/**
 * SMTP mail service. The transport is created lazily so the application can
 * boot (and serve non-email traffic) even when SMTP settings are absent.
 */
export class MailService {
  private transporter: Transporter | null = null;

  public get isEnabled(): boolean {
    return mailConfig.isConfigured;
  }

  private getTransporter(): Transporter {
    if (!mailConfig.isConfigured) {
      throw new ApiError(
        HttpStatus.SERVICE_UNAVAILABLE,
        'Email delivery is not configured',
        ErrorCode.MAIL_ERROR,
      );
    }

    if (!this.transporter) {
      this.transporter = nodemailer.createTransport({
        host: mailConfig.host,
        port: mailConfig.port,
        secure: mailConfig.port === 465,
        auth: {
          user: mailConfig.user,
          pass: mailConfig.password,
        },
      });
    }

    return this.transporter;
  }

  /** Sends an email and returns the provider message id. */
  public async send(message: MailMessage): Promise<string> {
    try {
      const info = await this.getTransporter().sendMail({
        from: mailConfig.from,
        to: message.to,
        subject: message.subject,
        text: message.text,
        html: message.html,
      });

      logger.info('Email dispatched', { messageId: info.messageId, subject: message.subject });
      return info.messageId;
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      logger.error('Email delivery failed', error);
      throw new ApiError(
        HttpStatus.BAD_GATEWAY,
        'Unable to deliver email at this time',
        ErrorCode.MAIL_ERROR,
      );
    }
  }

  /** Verifies SMTP connectivity; used by readiness diagnostics. */
  public async verify(): Promise<boolean> {
    if (!mailConfig.isConfigured) {
      return false;
    }
    try {
      await this.getTransporter().verify();
      return true;
    } catch (error) {
      logger.warn('SMTP verification failed', error);
      return false;
    }
  }
}

export const mailService = new MailService();
