import { BaseService } from "./base.service";
import { API_ENDPOINTS } from "../constants";
import type {
  FacultyStats,
  ReviewItem,
  AICopilotInsight,
  NotificationItem,
} from "../types/faculty";

export class FacultyService extends BaseService {
  async getStats(): Promise<FacultyStats> {
    return this.get<FacultyStats>(`${API_ENDPOINTS.ADMISSIONS}/stats`);
  }

  async getReviewQueue(type: string): Promise<ReviewItem[]> {
    return this.get<ReviewItem[]>(`${API_ENDPOINTS.ADMISSIONS}/queue/${type}`);
  }

  async getAICopilotInsight(applicantId: string): Promise<AICopilotInsight> {
    return this.get<AICopilotInsight>(`${API_ENDPOINTS.ADMISSIONS}/${applicantId}/ai-insight`);
  }

  async getNotifications(): Promise<NotificationItem[]> {
    return this.get<NotificationItem[]>(API_ENDPOINTS.NOTIFICATIONS);
  }

  async markNotificationRead(id: string): Promise<void> {
    await this.post(`${API_ENDPOINTS.NOTIFICATIONS}/${id}/read`, {});
  }
}

export const facultyService = new FacultyService();
