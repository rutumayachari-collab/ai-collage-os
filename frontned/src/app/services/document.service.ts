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
    return this.get<Document[]>(`${API_ENDPOINTS.DOCUMENTS}`, { params: { applicantId } });
  }

  async create(data: CreateDocumentDto): Promise<Document> {
    return this.post<Document>(API_ENDPOINTS.DOCUMENTS, data);
  }

  async update(id: string, data: UpdateDocumentDto): Promise<Document> {
    return this.patch<Document>(`${API_ENDPOINTS.DOCUMENTS}/${id}`, data);
  }

  async upload(file: File, applicantId: string, type: string): Promise<Document> {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("applicantId", applicantId);
    formData.append("type", type);

    const response = await fetch(`${API_ENDPOINTS.UPLOAD}`, {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      throw new Error("Upload failed");
    }

    return response.json();
  }
}

export const documentService = new DocumentService();
