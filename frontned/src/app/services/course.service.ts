import { BaseService } from "./base.service";
import { API_ENDPOINTS } from "../constants";
import type { Course, CreateCourseDto, UpdateCourseDto } from "../types/course";

export class CourseService extends BaseService {
  async getAll(params?: Record<string, string | number | boolean | undefined>): Promise<Course[]> {
    return this.get<Course[]>(API_ENDPOINTS.COURSES, params ? { params } : undefined);
  }

  async getById(id: string): Promise<Course> {
    return this.get<Course>(`${API_ENDPOINTS.COURSES}/${id}`);
  }

  async create(data: CreateCourseDto): Promise<Course> {
    return this.post<Course>(API_ENDPOINTS.COURSES, data);
  }

  async update(id: string, data: UpdateCourseDto): Promise<Course> {
    return this.patch<Course>(`${API_ENDPOINTS.COURSES}/${id}`, data);
  }

  async deleteById(id: string): Promise<void> {
    await super.delete(`${API_ENDPOINTS.COURSES}/${id}`);
  }
}

export const courseService = new CourseService();
