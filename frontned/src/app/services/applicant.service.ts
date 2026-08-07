import { BaseService } from "./base.service";
import { API_ENDPOINTS } from "../constants";
import type { Applicant, CreateApplicantDto, UpdateApplicantDto } from "../types/applicant";

export class ApplicantService extends BaseService {
  async getAll(
    params?: Record<string, string | number | boolean | undefined>,
  ): Promise<Applicant[]> {
    return this.get<Applicant[]>(API_ENDPOINTS.APPLICANTS, params ? { params } : undefined);
  }

  async getById(id: string): Promise<Applicant> {
    return this.get<Applicant>(`${API_ENDPOINTS.APPLICANTS}/${id}`);
  }

  async create(data: CreateApplicantDto): Promise<Applicant> {
    return this.post<Applicant>(API_ENDPOINTS.APPLICANTS, data);
  }

  async update(id: string, data: UpdateApplicantDto): Promise<Applicant> {
    return this.patch<Applicant>(`${API_ENDPOINTS.APPLICANTS}/${id}`, data);
  }
}

export const applicantService = new ApplicantService();
