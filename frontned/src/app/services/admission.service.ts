import { BaseService } from "./base.service";
import { API_ENDPOINTS } from "../constants";
import type { Admission, AdmissionStage } from "../types/admission";

export class AdmissionService extends BaseService {
  async getAll(
    params?: Record<string, string | number | boolean | undefined>,
  ): Promise<Admission[]> {
    return this.get<Admission[]>(API_ENDPOINTS.ADMISSIONS, params ? { params } : undefined);
  }

  async getById(id: string): Promise<Admission> {
    return this.get<Admission>(`${API_ENDPOINTS.ADMISSIONS}/${id}`);
  }

  async getByApplicant(applicantId: string): Promise<Admission> {
    return this.get<Admission>(`${API_ENDPOINTS.ADMISSIONS}`, { params: { applicantId } });
  }

  async getStages(id: string): Promise<AdmissionStage[]> {
    return this.get<AdmissionStage[]>(`${API_ENDPOINTS.ADMISSIONS}/${id}/stages`);
  }

  async updateStage(id: string, stage: string): Promise<Admission> {
    return this.patch<Admission>(`${API_ENDPOINTS.ADMISSIONS}/${id}/stages`, { stage });
  }
}

export const admissionService = new AdmissionService();
