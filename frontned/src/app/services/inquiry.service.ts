import { BaseService } from "./base.service";
import { API_ENDPOINTS } from "../constants";
import type { Inquiry, CreateInquiryDto, UpdateInquiryDto } from "../types/inquiry";

export class InquiryService extends BaseService {
  async getAll(params?: Record<string, string | number | boolean | undefined>): Promise<Inquiry[]> {
    return this.get<Inquiry[]>(API_ENDPOINTS.INQUIRIES, params ? { params } : undefined);
  }

  async getById(id: string): Promise<Inquiry> {
    return this.get<Inquiry>(`${API_ENDPOINTS.INQUIRIES}/${id}`);
  }

  async create(data: CreateInquiryDto): Promise<Inquiry> {
    return this.post<Inquiry>(API_ENDPOINTS.INQUIRIES, data);
  }

  async update(id: string, data: UpdateInquiryDto): Promise<Inquiry> {
    return this.patch<Inquiry>(`${API_ENDPOINTS.INQUIRIES}/${id}`, data);
  }
}

export const inquiryService = new InquiryService();
