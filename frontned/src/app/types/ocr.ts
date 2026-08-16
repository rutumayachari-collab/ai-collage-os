export type OCRProvider = "TESSERACT" | "GOOGLE_VISION" | "AZURE_DOCUMENT_INTELLIGENCE";
export type OCRDocumentType = "AADHAAR" | "PAN" | "PASSPORT" | "DRIVING_LICENSE" | "BIRTH_CERTIFICATE" | "MARKSHEET" | "PHOTO" | "OTHER";
export type OCRStatus = "PENDING" | "PROCESSING" | "COMPLETED" | "FAILED";
export type OCRConfidenceLevel = "HIGH" | "MEDIUM" | "LOW";

export interface OCRProcessingRequest {
  provider: OCRProvider;
  documentType: OCRDocumentType;
  fileUrl: string;
  mimeType: string;
  fileSizeBytes: number;
  language?: string;
}

export interface OCRProcessingResult {
  extractedText: string;
  confidence: number;
  confidenceLevel: OCRConfidenceLevel;
  fields: Record<string, string>;
  processingTimeMs: number;
  provider: OCRProvider;
  processedAt: string;
}

export interface OCREngineHealth {
  provider: OCRProvider;
  isHealthy: boolean;
  lastChecked: string;
  errorMessage?: string;
}
