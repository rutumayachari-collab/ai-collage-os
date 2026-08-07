export type OCRProvider = 'TESSERACT' | 'GOOGLE_VISION' | 'AZURE_DOCUMENT_INTELLIGENCE';

export type OCREngine = 'TESSERACT' | 'GOOGLE_VISION' | 'AZURE_DOCUMENT_INTELLIGENCE';

export type OCRDocumentType = 'AADHAAR' | 'PAN' | 'PASSPORT' | 'DRIVING_LICENSE' | 'BIRTH_CERTIFICATE' | 'MARKSHEET' | 'PHOTO' | 'OTHER';

export type OCRStatus = 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';

export type OCRConfidenceLevel = 'HIGH' | 'MEDIUM' | 'LOW';

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
  processedAt: Date;
}

export interface OCRDocument {
  documentId: string;
  applicantId: string;
  documentType: OCRDocumentType;
  provider: OCRProvider;
  status: OCRStatus;
  extractedText?: string;
  confidence?: number;
  confidenceLevel?: OCRConfidenceLevel;
  fields?: Record<string, string>;
  errorMessage?: string;
  processingTimeMs?: number;
  fileUrl: string;
  mimeType: string;
  fileSizeBytes: number;
  processedAt?: Date;
  createdBy: string;
  updatedBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface OCRProcessingHistory {
  historyId: string;
  documentId: string;
  applicantId: string;
  provider: OCRProvider;
  status: OCRStatus;
  extractedText?: string;
  confidence?: number;
  errorMessage?: string;
  processingTimeMs?: number;
  processedBy?: string;
  createdAt: Date;
}

export interface OCREngineHealth {
  provider: OCRProvider;
  isHealthy: boolean;
  lastChecked: Date;
  errorMessage?: string;
}
