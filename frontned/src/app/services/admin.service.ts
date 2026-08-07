import { BaseService } from "./base.service";
import { API_ENDPOINTS } from "../constants";
import type {
  AdminStats,
  AdmissionFunnel,
  DepartmentStat,
  FacultyStat,
  RevenueData,
  ScholarshipData,
  TimelineData,
  ProcessingTimeData,
  AIAccuracyData,
  ReportConfig,
  SettingsData,
} from "../types/admin";

export class AdminService extends BaseService {
  async getStats(): Promise<AdminStats> {
    return this.get<AdminStats>(`${API_ENDPOINTS.ADMISSIONS}/admin/stats`);
  }

  async getAdmissionFunnel(): Promise<AdmissionFunnel> {
    return this.get<AdmissionFunnel>(`${API_ENDPOINTS.ADMISSIONS}/admin/funnel`);
  }

  async getDepartmentStats(): Promise<DepartmentStat[]> {
    return this.get<DepartmentStat[]>(`${API_ENDPOINTS.DEPARTMENTS}/stats`);
  }

  async getFacultyStats(): Promise<FacultyStat[]> {
    return this.get<FacultyStat[]>(`${API_ENDPOINTS.FACULTY}/stats`);
  }

  async getRevenue(): Promise<RevenueData[]> {
    return this.get<RevenueData[]>(`${API_ENDPOINTS.ADMISSIONS}/admin/revenue`);
  }

  async getScholarshipDistribution(): Promise<ScholarshipData[]> {
    return this.get<ScholarshipData[]>(`${API_ENDPOINTS.ADMISSIONS}/admin/scholarships`);
  }

  async getAdmissionTimeline(): Promise<TimelineData[]> {
    return this.get<TimelineData[]>(`${API_ENDPOINTS.ADMISSIONS}/admin/timeline`);
  }

  async getProcessingTime(): Promise<ProcessingTimeData[]> {
    return this.get<ProcessingTimeData[]>(`${API_ENDPOINTS.ADMISSIONS}/admin/processing-time`);
  }

  async getAIAccuracy(): Promise<AIAccuracyData[]> {
    return this.get<AIAccuracyData[]>(`${API_ENDPOINTS.ADMISSIONS}/admin/ai-accuracy`);
  }

  async generateReport(config: ReportConfig): Promise<Blob> {
    const response = await fetch(`${API_ENDPOINTS.ADMISSIONS}/admin/reports/generate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(config),
    });
    if (!response.ok) throw new Error("Failed to generate report");
    return response.blob();
  }

  async getSettings(): Promise<SettingsData> {
    return this.get<SettingsData>(`${API_ENDPOINTS.SETTINGS}`);
  }

  async updateSettings(data: Partial<SettingsData>): Promise<SettingsData> {
    return this.patch<SettingsData>(`${API_ENDPOINTS.SETTINGS}`, data);
  }
}

export const adminService = new AdminService();
