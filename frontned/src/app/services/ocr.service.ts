import { BaseService } from "./base.service";
import { API_ENDPOINTS } from "../constants";
import type { OCRProcessingRequest, OCRProcessingResult, OCREngineHealth } from "../types/ocr";

export class OCRService extends BaseService {
  async processDocument(input: OCRProcessingRequest): Promise<OCRProcessingResult> {
    return this.post<OCRProcessingResult>(`${API_ENDPOINTS.OCR}/process`, input);
  }

  async getProviderHealth(): Promise<OCREngineHealth[]> {
    return this.get<OCREngineHealth[]>(`${API_ENDPOINTS.OCR}/health`);
  }

  async validateProviders(): Promise<{ isValid: boolean }> {
    return this.get<{ isValid: boolean }>(`${API_ENDPOINTS.OCR}/validate`);
  }
}

export const ocrService = new OCRService();
