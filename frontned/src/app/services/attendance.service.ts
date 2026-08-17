import { BaseService } from "./base.service";
import { API_ENDPOINTS } from "../constants";
import type {
  AttendanceRecord,
  AttendanceSummary,
  AttendanceStatistics,
} from "../types/attendance";

export class AttendanceService extends BaseService {
  async getAll(
    params?: Record<string, string | number | boolean | undefined>,
  ): Promise<AttendanceRecord[]> {
    return this.get<AttendanceRecord[]>(API_ENDPOINTS.ATTENDANCE, params ? { params } : undefined);
  }

  async getById(id: string): Promise<AttendanceRecord> {
    return this.get<AttendanceRecord>(`${API_ENDPOINTS.ATTENDANCE}/${id}`);
  }

  async getMyAttendance(
    params?: Record<string, string | number | boolean | undefined>,
  ): Promise<AttendanceRecord[]> {
    return this.get<AttendanceRecord[]>(
      `${API_ENDPOINTS.ATTENDANCE}/me/attendance`,
      params ? { params } : undefined,
    );
  }

  async getMySummary(subjectId: string): Promise<AttendanceSummary> {
    return this.get<AttendanceSummary>(`${API_ENDPOINTS.ATTENDANCE}/me/summary/${subjectId}`);
  }

  async create(data: Partial<AttendanceRecord>): Promise<AttendanceRecord> {
    return this.post<AttendanceRecord>(API_ENDPOINTS.ATTENDANCE, data);
  }

  async update(id: string, data: Partial<AttendanceRecord>): Promise<AttendanceRecord> {
    return this.patch<AttendanceRecord>(`${API_ENDPOINTS.ATTENDANCE}/${id}`, data);
  }

  async bulkMark(data: {
    studentIds: string[];
    subjectId: string;
    date: string;
    periodNumber?: number;
    status: string;
    remarks?: string;
  }): Promise<unknown> {
    return this.post(`${API_ENDPOINTS.ATTENDANCE}/bulk-mark`, data);
  }

  async getStatistics(
    params?: Record<string, string | number | boolean | undefined>,
  ): Promise<AttendanceStatistics> {
    return this.get<AttendanceStatistics>(
      `${API_ENDPOINTS.ATTENDANCE}/statistics/overall`,
      params ? { params } : undefined,
    );
  }
}

export const attendanceService = new AttendanceService();
