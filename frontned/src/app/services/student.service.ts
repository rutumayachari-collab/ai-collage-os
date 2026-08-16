import { BaseService } from "./base.service";
import { API_ENDPOINTS } from "../constants";
import type { Student, StudentQueryParams } from "../types/student";

export class StudentService extends BaseService {
  async getMany(params?: StudentQueryParams): Promise<Student[]> {
    return this.get<Student[]>(`${API_ENDPOINTS.STUDENTS}`, params ? { params: params as Record<string, string | number | boolean | undefined> } : undefined);
  }

  async getById(id: string): Promise<Student> {
    return this.get<Student>(`${API_ENDPOINTS.STUDENTS}/${id}`);
  }

  async getMyProfile(): Promise<Student> {
    return this.get<Student>(`${API_ENDPOINTS.STUDENTS}/me/profile`);
  }

  async updateMyProfile(data: Partial<Student>): Promise<Student> {
    return this.patch<Student>(`${API_ENDPOINTS.STUDENTS}/me/profile`, data);
  }

  async search(params?: StudentQueryParams): Promise<Student[]> {
    return this.get<Student[]>(`${API_ENDPOINTS.STUDENTS}/search`, params ? { params: params as Record<string, string | number | boolean | undefined> } : undefined);
  }

  async filter(params?: StudentQueryParams): Promise<Student[]> {
    return this.get<Student[]>(`${API_ENDPOINTS.STUDENTS}/filter`, params ? { params: params as Record<string, string | number | boolean | undefined> } : undefined);
  }

  async getByDepartment(departmentId: string): Promise<Student[]> {
    return this.get<Student[]>(`${API_ENDPOINTS.STUDENTS}/department/${departmentId}`);
  }
}

export const studentService = new StudentService();
