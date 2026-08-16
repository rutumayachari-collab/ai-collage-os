import { BaseService } from "./base.service";
import { API_ENDPOINTS } from "../constants";
import type {
  Notification,
  NotificationStats,
  NotificationChannel,
  NotificationPriority,
  NotificationType,
  NotificationStatus,
} from "../types/notification";

export class NotificationService extends BaseService {
  async getStats(recipientId?: string): Promise<NotificationStats> {
    const params = recipientId ? { params: { recipientId } } : undefined;
    return this.get<NotificationStats>(`${API_ENDPOINTS.NOTIFICATIONS}/stats/summary`, params);
  }

  async getAll(params?: Record<string, string | number | boolean | undefined>): Promise<{ items: Notification[]; total: number }> {
    return this.get<{ items: Notification[]; total: number }>(API_ENDPOINTS.NOTIFICATIONS, params ? { params } : undefined);
  }

  async send(data: {
    recipient: {
      userId: string;
      userRole: string;
      email?: string;
      phone?: string;
      whatsappNumber?: string;
    };
    payload: {
      channel: NotificationChannel;
      priority: NotificationPriority;
      type: NotificationType;
      subject: string;
      body: string;
    };
    createdBy: string;
  }): Promise<Notification> {
    return this.post<Notification>(`${API_ENDPOINTS.NOTIFICATIONS}/send`, data);
  }

  async markAsRead(notificationId: string): Promise<Notification> {
    return this.patch<Notification>(`${API_ENDPOINTS.NOTIFICATIONS}/${notificationId}/read`, {});
  }

  async markAsDelivered(notificationId: string): Promise<Notification> {
    return this.patch<Notification>(`${API_ENDPOINTS.NOTIFICATIONS}/${notificationId}/delivered`, {});
  }

  async markAsFailed(notificationId: string, reason: string): Promise<Notification> {
    return this.patch<Notification>(`${API_ENDPOINTS.NOTIFICATIONS}/${notificationId}/failed`, { reason });
  }
}

export const notificationService = new NotificationService();
