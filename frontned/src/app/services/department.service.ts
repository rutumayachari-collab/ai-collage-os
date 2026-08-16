import { BaseService } from "./base.service";
import { API_ENDPOINTS } from "../constants";
import type { Department, CreateDepartmentDto, UpdateDepartmentDto } from "../types/department";

export class DepartmentService extends BaseService {
  async getAll(
    params?: Record<string, string | number | boolean | undefined>,
  ): Promise<Department[]> {
    return this.get<Department[]>(API_ENDPOINTS.DEPARTMENTS, params ? { params } : undefined);
  }

  async getById(id: string): Promise<Department> {
    return this.get<Department>(`${API_ENDPOINTS.DEPARTMENTS}/${id}`);
  }

  async create(data: CreateDepartmentDto): Promise<Department> {
    return this.post<Department>(API_ENDPOINTS.DEPARTMENTS, data);
  }

  async update(id: string, data: UpdateDepartmentDto): Promise<Department> {
    return this.patch<Department>(`${API_ENDPOINTS.DEPARTMENTS}/${id}`, data);
  }

  async deleteById(id: string): Promise<void> {
    await super.delete(`${API_ENDPOINTS.DEPARTMENTS}/${id}`);
  }
}

export const departmentService = new DepartmentService();
