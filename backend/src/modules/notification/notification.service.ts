import { NotFoundError } from '../../shared/utils/api-error.util';
import type { NotificationRecipient, NotificationPayload, Notification, NotificationHistory, NotificationFilterInput, NotificationStats, NotificationChannel, NotificationPriority, NotificationStatus } from './notification.types';

export class NotificationService {
  private notifications: Map<string, Notification> = new Map();
  private history: Map<string, NotificationHistory> = new Map();

  async sendNotification(recipient: NotificationRecipient, payload: NotificationPayload, createdBy: string): Promise<Notification> {
    const notificationId = `NTF-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;

    const notification: Notification = {
      notificationId,
      recipient,
      payload,
      status: 'PENDING',
      retryCount: 0,
      maxRetries: 3,
      createdBy,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.notifications.set(notificationId, notification);

    await this.recordHistory(notification, 'PENDING');

    return notification;
  }

  async getNotification(notificationId: string): Promise<Notification | null> {
    return this.notifications.get(notificationId) || null;
  }

  async listNotifications(filter: NotificationFilterInput): Promise<{ items: Notification[]; total: number }> {
    let items = Array.from(this.notifications.values());

    if (filter.recipientId) {
      items = items.filter((n) => n.recipient.userId === filter.recipientId);
    }
    if (filter.channel) {
      items = items.filter((n) => n.payload.channel === filter.channel);
    }
    if (filter.status) {
      items = items.filter((n) => n.status === filter.status);
    }
    if (filter.priority) {
      items = items.filter((n) => n.payload.priority === filter.priority);
    }
    if (filter.type) {
      items = items.filter((n) => n.payload.type === filter.type);
    }
    if (filter.isRead !== undefined) {
      items = items.filter((n) => (filter.isRead ? n.readAt !== undefined : n.readAt === undefined));
    }
    if (filter.startDate || filter.endDate) {
      items = items.filter((n) => {
        const date = n.createdAt;
        if (filter.startDate && date < filter.startDate) return false;
        if (filter.endDate && date > filter.endDate) return false;
        return true;
      });
    }

    return { items, total: items.length };
  }

  async markAsRead(notificationId: string): Promise<Notification | null> {
    const notification = this.notifications.get(notificationId);
    if (!notification) {
      throw new NotFoundError('Notification not found');
    }

    notification.status = 'READ';
    notification.readAt = new Date();
    notification.updatedAt = new Date();

    this.notifications.set(notificationId, notification);
    await this.recordHistory(notification, 'READ');

    return notification;
  }

  async markAsDelivered(notificationId: string): Promise<Notification | null> {
    const notification = this.notifications.get(notificationId);
    if (!notification) {
      throw new NotFoundError('Notification not found');
    }

    notification.status = 'DELIVERED';
    notification.deliveredAt = new Date();
    notification.updatedAt = new Date();

    this.notifications.set(notificationId, notification);
    await this.recordHistory(notification, 'DELIVERED');

    return notification;
  }

  async markAsFailed(notificationId: string, reason: string): Promise<Notification | null> {
    const notification = this.notifications.get(notificationId);
    if (!notification) {
      throw new NotFoundError('Notification not found');
    }

    notification.status = 'FAILED';
    notification.failedAt = new Date();
    notification.failureReason = reason;
    notification.updatedAt = new Date();

    this.notifications.set(notificationId, notification);
    await this.recordHistory(notification, 'FAILED');

    return notification;
  }

  async getStats(recipientId?: string): Promise<NotificationStats> {
    let items = Array.from(this.notifications.values());

    if (recipientId) {
      items = items.filter((n) => n.recipient.userId === recipientId);
    }

    const byChannel: Record<NotificationChannel, number> = {
      IN_APP: 0,
      EMAIL: 0,
      WHATSAPP: 0,
      SMS: 0,
    };

    const byPriority: Record<NotificationPriority, number> = {
      LOW: 0,
      MEDIUM: 0,
      HIGH: 0,
      URGENT: 0,
    };

    items.forEach((n) => {
      byChannel[n.payload.channel]++;
      byPriority[n.payload.priority]++;
    });

    return {
      total: items.length,
      unread: items.filter((n) => n.readAt === undefined).length,
      read: items.filter((n) => n.readAt !== undefined).length,
      failed: items.filter((n) => n.status === 'FAILED').length,
      byChannel,
      byPriority,
    };
  }

  private async recordHistory(notification: Notification, status: NotificationStatus): Promise<NotificationHistory> {
    const historyId = `HIST-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;

    const history: NotificationHistory = {
      historyId,
      notificationId: notification.notificationId,
      channel: notification.payload.channel,
      status,
      recipient: notification.recipient.userId,
      subject: notification.payload.subject,
      sentAt: notification.sentAt || notification.createdAt,
      deliveredAt: notification.deliveredAt,
      readAt: notification.readAt,
      failureReason: notification.failureReason,
    };

    this.history.set(historyId, history);
    return history;
  }
}

export const notificationService = new NotificationService();
