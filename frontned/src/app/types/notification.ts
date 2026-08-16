export type NotificationChannel = "IN_APP" | "EMAIL" | "WHATSAPP" | "SMS";
export type NotificationPriority = "LOW" | "MEDIUM" | "HIGH" | "URGENT";
export type NotificationType = "INFO" | "WARNING" | "SUCCESS" | "ERROR";
export type NotificationStatus = "PENDING" | "SENT" | "DELIVERED" | "READ" | "FAILED";

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
}

export interface Notification {
  notificationId: string;
  recipient: NotificationRecipient;
  payload: NotificationPayload;
  status: NotificationStatus;
  readAt?: string;
  createdAt: string;
}

export interface NotificationStats {
  total: number;
  unread: number;
  read: number;
  failed: number;
  byChannel: Record<NotificationChannel, number>;
  byPriority: Record<NotificationPriority, number>;
}
