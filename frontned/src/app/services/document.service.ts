import { BaseService } from "./base.service";
import { API_ENDPOINTS } from "../constants";
import type { Document, CreateDocumentDto, UpdateDocumentDto } from "../types/document";

export class DocumentService extends BaseService {
  async getAll(
    params?: Record<string, string | number | boolean | undefined>,
  ): Promise<Document[]> {
    return this.get<Document[]>(API_ENDPOINTS.DOCUMENTS, params ? { params } : undefined);
  }

  async getById(id: string): Promise<Document> {
    return this.get<Document>(`${API_ENDPOINTS.DOCUMENTS}/${id}`);
  }

  async getByApplicant(applicantId: string): Promise<Document[]> {
    return this.get<Document[]>(`${API_ENDPOINTS.DOCUMENTS}/applicant/${applicantId}`);
  }

  async create(data: CreateDocumentDto): Promise<Document> {
    return this.post<Document>(API_ENDPOINTS.DOCUMENTS, data);
  }

  async update(id: string, data: UpdateDocumentDto): Promise<Document> {
    return this.patch<Document>(`${API_ENDPOINTS.DOCUMENTS}/${id}`, data);
  }

  async approve(id: string): Promise<Document> {
    return this.patch<Document>(`${API_ENDPOINTS.DOCUMENTS}/${id}/approve`, {});
  }

  async reject(id: string, reason: string): Promise<Document> {
    return this.patch<Document>(`${API_ENDPOINTS.DOCUMENTS}/${id}/reject`, { reason });
  }
}

export const documentService = new DocumentService();
