import { BaseService } from "./base.service";
import { API_ENDPOINTS } from "../constants";
import type { Company, Drive, Application, Interview, Offer } from "../types/placement";

export class PlacementService extends BaseService {
  async getCompanies(
    params?: Record<string, string | number | boolean | undefined>,
  ): Promise<Company[]> {
    return this.get<Company[]>(
      `${API_ENDPOINTS.PLACEMENT}/companies`,
      params ? { params } : undefined,
    );
  }

  async getCompany(id: string): Promise<Company> {
    return this.get<Company>(`${API_ENDPOINTS.PLACEMENT}/companies/${id}`);
  }

  async createCompany(data: Partial<Company>): Promise<Company> {
    return this.post<Company>(`${API_ENDPOINTS.PLACEMENT}/companies`, data);
  }

  async updateCompany(id: string, data: Partial<Company>): Promise<Company> {
    return this.patch<Company>(`${API_ENDPOINTS.PLACEMENT}/companies/${id}`, data);
  }

  async getDrives(
    params?: Record<string, string | number | boolean | undefined>,
  ): Promise<Drive[]> {
    return this.get<Drive[]>(`${API_ENDPOINTS.PLACEMENT}/drives`, params ? { params } : undefined);
  }

  async getDrive(id: string): Promise<Drive> {
    return this.get<Drive>(`${API_ENDPOINTS.PLACEMENT}/drives/${id}`);
  }

  async createDrive(data: Partial<Drive>): Promise<Drive> {
    return this.post<Drive>(`${API_ENDPOINTS.PLACEMENT}/drives`, data);
  }

  async updateDrive(id: string, data: Partial<Drive>): Promise<Drive> {
    return this.patch<Drive>(`${API_ENDPOINTS.PLACEMENT}/drives/${id}`, data);
  }

  async getApplications(
    params?: Record<string, string | number | boolean | undefined>,
  ): Promise<Application[]> {
    return this.get<Application[]>(
      `${API_ENDPOINTS.PLACEMENT}/applications`,
      params ? { params } : undefined,
    );
  }

  async applyToDrive(data: { driveId: string; studentId: string }): Promise<Application> {
    return this.post<Application>(`${API_ENDPOINTS.PLACEMENT}/applications`, data);
  }

  async updateApplication(id: string, data: Partial<Application>): Promise<Application> {
    return this.patch<Application>(`${API_ENDPOINTS.PLACEMENT}/applications/${id}`, data);
  }

  async getStatistics(): Promise<unknown> {
    return this.get(`${API_ENDPOINTS.PLACEMENT}/statistics`);
  }
}

export const placementService = new PlacementService();
