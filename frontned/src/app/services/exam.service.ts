import { BaseService } from "./base.service";
import { API_ENDPOINTS } from "../constants";
import type { Exam, CreateExamDto, UpdateExamDto } from "../types/exam";

export class ExamService extends BaseService {
  async getAll(params?: Record<string, string | number | boolean | undefined>): Promise<Exam[]> {
    return this.get<Exam[]>(API_ENDPOINTS.EXAMS, params ? { params } : undefined);
  }

  async getById(id: string): Promise<Exam> {
    return this.get<Exam>(`${API_ENDPOINTS.EXAMS}/${id}`);
  }

  async create(data: CreateExamDto): Promise<Exam> {
    return this.post<Exam>(API_ENDPOINTS.EXAMS, data);
  }

  async update(id: string, data: UpdateExamDto): Promise<Exam> {
    return this.patch<Exam>(`${API_ENDPOINTS.EXAMS}/${id}`, data);
  }

  async registerStudent(examId: string, studentId: string): Promise<unknown> {
    return this.post(`${API_ENDPOINTS.EXAMS}/${examId}/register`, { studentId });
  }

  async publishResult(examId: string, resultData: Record<string, unknown>): Promise<unknown> {
    return this.patch(`${API_ENDPOINTS.EXAMS}/${examId}/results/publish`, resultData);
  }

  async getStatistics(examId: string): Promise<unknown> {
    return this.get(`${API_ENDPOINTS.EXAMS}/${examId}/statistics`);
  }
}

export const examService = new ExamService();
