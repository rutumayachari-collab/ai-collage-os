import { BaseService } from "./base.service";
import { API_ENDPOINTS } from "../constants";
import type { Eligibility, CreateEligibilityDto, UpdateEligibilityDto } from "../types/eligibility";

export class EligibilityService extends BaseService {
  async getAll(
    params?: Record<string, string | number | boolean | undefined>,
  ): Promise<Eligibility[]> {
    return this.get<Eligibility[]>(API_ENDPOINTS.ELIGIBILITY, params ? { params } : undefined);
  }

  async getById(id: string): Promise<Eligibility> {
    return this.get<Eligibility>(`${API_ENDPOINTS.ELIGIBILITY}/${id}`);
  }

  async getByApplicant(applicantId: string): Promise<Eligibility[]> {
    return this.get<Eligibility[]>(`${API_ENDPOINTS.ELIGIBILITY}`, { params: { applicantId } });
  }

  async create(data: CreateEligibilityDto): Promise<Eligibility> {
    return this.post<Eligibility>(API_ENDPOINTS.ELIGIBILITY, data);
  }

  async update(id: string, data: UpdateEligibilityDto): Promise<Eligibility> {
    return this.patch<Eligibility>(`${API_ENDPOINTS.ELIGIBILITY}/${id}`, data);
  }

  async runCheck(id: string): Promise<Eligibility> {
    return this.post<Eligibility>(`${API_ENDPOINTS.ELIGIBILITY}/${id}/run-check`, {});
  }
}

export const eligibilityService = new EligibilityService();
