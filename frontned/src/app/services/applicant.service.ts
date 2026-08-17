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

  async getMeProfile(): Promise<Applicant> {
    return this.get<Applicant>(`${API_ENDPOINTS.APPLICANTS}/me/profile`);
  }

  async getByApplicationNumber(applicationNumber: string): Promise<Applicant> {
    return this.get<Applicant>(
      `${API_ENDPOINTS.APPLICANTS}/public-info/${encodeURIComponent(applicationNumber)}`,
    );
  }

  async create(data: CreateApplicantDto): Promise<Applicant> {
    return this.post<Applicant>(API_ENDPOINTS.APPLICANTS, data);
  }

  async update(id: string, data: UpdateApplicantDto): Promise<Applicant> {
    return this.patch<Applicant>(`${API_ENDPOINTS.APPLICANTS}/${id}`, data);
  }

  async getWorkflow(id: string): Promise<Applicant> {
    return this.get<Applicant>(`${API_ENDPOINTS.APPLICANTS}/${id}/workflow`);
  }

  async updateWorkflow(id: string, data: UpdateApplicantDto): Promise<Applicant> {
    return this.patch<Applicant>(`${API_ENDPOINTS.APPLICANTS}/${id}/workflow`, data);
  }

  async getChecklist(id: string): Promise<Applicant> {
    return this.get<Applicant>(`${API_ENDPOINTS.APPLICANTS}/${id}/checklist`);
  }

  async getDocuments(id: string): Promise<unknown[]> {
    return this.get<unknown[]>(`${API_ENDPOINTS.APPLICANTS}/${id}/documents`);
  }

  async getInterview(id: string): Promise<unknown> {
    return this.get<unknown>(`${API_ENDPOINTS.APPLICANTS}/${id}/interview`);
  }

  async getOfferLetter(id: string): Promise<unknown> {
    return this.get<unknown>(`${API_ENDPOINTS.APPLICANTS}/${id}/offer-letter`);
  }

  async getFeeSummary(id: string): Promise<unknown> {
    return this.get<unknown>(`${API_ENDPOINTS.APPLICANTS}/${id}/fee-summary`);
  }

  async getTimeline(id: string): Promise<unknown[]> {
    return this.get<unknown[]>(`${API_ENDPOINTS.APPLICANTS}/${id}/timeline`);
  }

  async search(
    params?: Record<string, string | number | boolean | undefined>,
  ): Promise<Applicant[]> {
    return this.get<Applicant[]>(
      `${API_ENDPOINTS.APPLICANTS}/search`,
      params ? { params } : undefined,
    );
  }
}

export const applicantService = new ApplicantService();
