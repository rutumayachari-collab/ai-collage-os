export type NotificationChannel = 'IN_APP' | 'EMAIL' | 'WHATSAPP' | 'SMS';

export type NotificationPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';

export type NotificationStatus = 'PENDING' | 'SENT' | 'DELIVERED' | 'READ' | 'FAILED';

export type NotificationType = 'INFO' | 'WARNING' | 'SUCCESS' | 'ERROR';

export interface NotificationRecipient {
  userId: string;
  userRole: string;
  email?: string;
  phone?: string;
  whatsappNumber?: string;
}

export interface NotificationPayload {
  channel: NotificationChannel;
  priority: NotificationPriority;
  type: NotificationType;
  subject: string;
  body: string;
  htmlBody?: string;
  data?: Record<string, unknown>;
}

export interface Notification {
  notificationId: string;
  recipient: NotificationRecipient;
  payload: NotificationPayload;
  status: NotificationStatus;
  readAt?: Date;
  deliveredAt?: Date;
  failedAt?: Date;
  failureReason?: string;
  retryCount: number;
  maxRetries: number;
  scheduledAt?: Date;
  sentAt?: Date;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface NotificationHistory {
  historyId: string;
  notificationId: string;
  channel: NotificationChannel;
  status: NotificationStatus;
  recipient: string;
  subject: string;
  sentAt: Date;
  deliveredAt?: Date;
  readAt?: Date;
  failureReason?: string;
  metadata?: Record<string, unknown>;
}

export interface NotificationFilterInput {
  recipientId?: string;
  channel?: NotificationChannel;
  status?: NotificationStatus;
  priority?: NotificationPriority;
  type?: NotificationType;
  startDate?: Date;
  endDate?: Date;
  isRead?: boolean;
}

export interface NotificationStats {
  total: number;
  unread: number;
  read: number;
  failed: number;
  byChannel: Record<NotificationChannel, number>;
  byPriority: Record<NotificationPriority, number>;
}
