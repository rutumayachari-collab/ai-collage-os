import { NotFoundError } from '../../shared/utils/api-error.util';
import { NotificationHistoryModel, NotificationModel } from './notification.model';
import type {
  Notification,
  NotificationChannel,
  NotificationFilterInput,
  NotificationHistory,
  NotificationPriority,
  NotificationRecipient,
  NotificationPayload,
  NotificationStats,
  NotificationStatus,
} from './notification.types';

export class NotificationService {
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

    const saved = await NotificationModel.create(notification);
    await this.recordHistory(saved.toObject() as Notification, 'PENDING');
    return saved.toObject() as Notification;
  }

  async getNotification(notificationId: string): Promise<Notification | null> {
    const notification = await NotificationModel.findOne({ notificationId }).lean<Notification | null>();
    return notification ?? null;
  }

  async listNotifications(filter: NotificationFilterInput): Promise<{ items: Notification[]; total: number }> {
    const query: Record<string, unknown> = {};

    if (filter.recipientId) {
      query['recipient.userId'] = filter.recipientId;
    }
    if (filter.channel) {
      query['payload.channel'] = filter.channel;
    }
    if (filter.status) {
      query.status = filter.status;
    }
    if (filter.priority) {
      query['payload.priority'] = filter.priority;
    }
    if (filter.type) {
      query['payload.type'] = filter.type;
    }
    if (filter.isRead !== undefined) {
      query.readAt = filter.isRead ? { $ne: null } : { $eq: null };
    }
    if (filter.startDate || filter.endDate) {
      query.createdAt = {} as Record<string, Date>;
      if (filter.startDate) {
        (query.createdAt as Record<string, Date>).$gte = filter.startDate;
      }
      if (filter.endDate) {
        (query.createdAt as Record<string, Date>).$lte = filter.endDate;
      }
    }

    const [items, total] = await Promise.all([
      NotificationModel.find(query).sort({ createdAt: -1 }).lean<Notification[]>(),
      NotificationModel.countDocuments(query),
    ]);

    return { items, total };
  }

  async markAsRead(notificationId: string): Promise<Notification | null> {
    const updated = await NotificationModel.findOneAndUpdate(
      { notificationId },
      { $set: { status: 'READ', readAt: new Date(), updatedAt: new Date() } },
      { new: true, runValidators: true },
    ).lean<Notification | null>();

    if (!updated) {
      throw new NotFoundError('Notification not found');
    }

    await this.recordHistory(updated as Notification, 'READ');
    return updated as Notification;
  }

  async markAsDelivered(notificationId: string): Promise<Notification | null> {
    const updated = await NotificationModel.findOneAndUpdate(
      { notificationId },
      { $set: { status: 'DELIVERED', deliveredAt: new Date(), updatedAt: new Date() } },
      { new: true, runValidators: true },
    ).lean<Notification | null>();

    if (!updated) {
      throw new NotFoundError('Notification not found');
    }

    await this.recordHistory(updated as Notification, 'DELIVERED');
    return updated as Notification;
  }

  async markAsFailed(notificationId: string, reason: string): Promise<Notification | null> {
    const updated = await NotificationModel.findOneAndUpdate(
      { notificationId },
      { $set: { status: 'FAILED', failedAt: new Date(), failureReason: reason, updatedAt: new Date() } },
      { new: true, runValidators: true },
    ).lean<Notification | null>();

    if (!updated) {
      throw new NotFoundError('Notification not found');
    }

    await this.recordHistory(updated as Notification, 'FAILED');
    return updated as Notification;
  }

  async getStats(recipientId?: string): Promise<NotificationStats> {
    const query: Record<string, unknown> = recipientId ? { 'recipient.userId': recipientId } : {};
    const items = await NotificationModel.find(query).lean<Notification[]>();

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

    items.forEach((notification) => {
      byChannel[notification.payload.channel] += 1;
      byPriority[notification.payload.priority] += 1;
    });

    return {
      total: items.length,
      unread: items.filter((notification) => notification.readAt === undefined).length,
      read: items.filter((notification) => notification.readAt !== undefined).length,
      failed: items.filter((notification) => notification.status === 'FAILED').length,
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
      sentAt: notification.sentAt ?? notification.createdAt,
      deliveredAt: notification.deliveredAt,
      readAt: notification.readAt,
      failureReason: notification.failureReason,
    };

    await NotificationHistoryModel.create(history);
    return history;
  }
}

export const notificationService = new NotificationService();
