export type { NotificationChannel, NotificationPayload, NotificationRecipient, NotificationStatus, NotificationPriority, NotificationStats } from './notification.types';

export interface NotificationProviderInterface {
  readonly channel: string;
  readonly isEnabled: boolean;

  send(recipient: { userId: string; userRole: string; email?: string; phone?: string; whatsappNumber?: string }, payload: { channel: string; priority: string; type: string; subject: string; body: string; htmlBody?: string; data?: Record<string, unknown> }): Promise<{ status: string; messageId?: string; error?: string }>;
  validateConfiguration(): Promise<boolean>;
}

export interface NotificationTemplate {
  subject: string;
  body: string;
  htmlBody?: string;
}

export type NotificationTemplateMap = Record<string, NotificationTemplate>;
