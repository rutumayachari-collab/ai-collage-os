import type { OCRProviderInterface } from './ocr.providers';
import type { OCRProvider, OCRProcessingRequest, OCRProcessingResult, OCREngineHealth } from './ocr.types';

export class TesseractOCRProvider implements OCRProviderInterface {
  readonly name: OCRProvider = 'TESSERACT';
  readonly isHealthy = true;

  async processDocument(request: OCRProcessingRequest): Promise<OCRProcessingResult> {
    return {
      extractedText: `Extracted text from ${request.documentType} using Tesseract OCR`,
      confidence: 0.85,
      confidenceLevel: 'HIGH',
      fields: { documentNumber: 'TESS-12345', name: 'Sample Name', dob: '1995-01-01' },
      processingTimeMs: 2500,
      provider: this.name,
      processedAt: new Date(),
    };
  }

  async validateConfiguration(): Promise<boolean> {
    return true;
  }

  async getHealthStatus(): Promise<OCREngineHealth> {
    return {
      provider: this.name,
      isHealthy: true,
      lastChecked: new Date(),
    };
  }
}

export class GoogleVisionOCRProvider implements OCRProviderInterface {
  readonly name: OCRProvider = 'GOOGLE_VISION';
  readonly isHealthy = true;

  async processDocument(request: OCRProcessingRequest): Promise<OCRProcessingResult> {
    return {
      extractedText: `Extracted text from ${request.documentType} using Google Vision AI`,
      confidence: 0.92,
      confidenceLevel: 'HIGH',
      fields: { documentNumber: 'GV-67890', name: 'Sample Name', dob: '1995-01-01' },
      processingTimeMs: 1800,
      provider: this.name,
      processedAt: new Date(),
    };
  }

  async validateConfiguration(): Promise<boolean> {
    return true;
  }

  async getHealthStatus(): Promise<OCREngineHealth> {
    return {
      provider: this.name,
      isHealthy: true,
      lastChecked: new Date(),
    };
  }
}

export class AzureDocumentIntelligenceProvider implements OCRProviderInterface {
  readonly name: OCRProvider = 'AZURE_DOCUMENT_INTELLIGENCE';
  readonly isHealthy = true;

  async processDocument(request: OCRProcessingRequest): Promise<OCRProcessingResult> {
    return {
      extractedText: `Extracted text from ${request.documentType} using Azure Document Intelligence`,
      confidence: 0.94,
      confidenceLevel: 'HIGH',
      fields: { documentNumber: 'ADI-11111', name: 'Sample Name', dob: '1995-01-01' },
      processingTimeMs: 1500,
      provider: this.name,
      processedAt: new Date(),
    };
  }

  async validateConfiguration(): Promise<boolean> {
    return true;
  }

  async getHealthStatus(): Promise<OCREngineHealth> {
    return {
      provider: this.name,
      isHealthy: true,
      lastChecked: new Date(),
    };
  }
}
