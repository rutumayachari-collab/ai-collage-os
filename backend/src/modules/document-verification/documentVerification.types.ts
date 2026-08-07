/** Document verification status lifecycle. */
export type VerificationStatus = 'PENDING' | 'UNDER_REVIEW' | 'VERIFIED' | 'REJECTED' | 'EXPIRED' | 'REQUIRES_REUPLOAD';

/** OCR processing status. */
export type OCRStatus = 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';

/** Fraud detection result. */
export type FraudDetectionResult = 'CLEAN' | 'SUSPICIOUS' | 'FRAUDULENT' | 'MANUAL_REVIEW_REQUIRED';

/** Document expiry status. */
export type DocumentExpiryStatus = 'VALID' | 'EXPIRING_SOON' | 'EXPIRED' | 'NO_EXPIRY';

/** Manual review decision. */
export type ManualReviewDecision = 'APPROVE' | 'REJECT' | 'HOLD' | 'REQUIRES_REUPLOAD';

/**
 * OCR result data for an applicant document.
 */
export interface OCRResult {
  status: OCRStatus;
  extractedText?: string;
  confidenceScore?: number;
  processedAt?: Date;
  errorMessage?: string;
  fields: {
    name?: string;
    registrationNumber?: string;
    issuingAuthority?: string;
    issueDate?: Date;
    expiryDate?: Date;
    marksPercentage?: number;
    totalMarks?: number;
    obtainedMarks?: number;
    grade?: string;
    additionalFields?: Record<string, unknown>;
  };
}

/**
 * Fraud detection data for an applicant document.
 */
export interface FraudDetection {
  result: FraudDetectionResult;
  score: number;
  checks: {
    tamperingDetected: boolean;
    copyPasteDetected: boolean;
    fontInconsistency: boolean;
    metadataMismatch: boolean;
    duplicateDocumentFound: boolean;
  };
  details: string[];
  detectedAt: Date;
  modelVersion?: string;
}

/**
 * Manual review details for a document.
 */
export interface ManualReview {
  decision: ManualReviewDecision;
  reviewedBy: string;
  reviewedAt: Date;
  remarks?: string;
  rejectionReason?: string;
  requiresReupload: boolean;
  reuploadReason?: string;
}

/**
 * Verification timeline event.
 */
export interface VerificationTimelineEvent {
  eventId: string;
  eventType: 'DOCUMENT_UPLOADED' | 'OCR_PROCESSED' | 'FRAUD_CHECKED' | 'VERIFIED' | 'REJECTED' | 'REUPLOAD_REQUESTED' | 'NOTE_ADDED' | 'STATUS_CHANGED';
  description: string;
  performedBy: string;
  performedByRole: string;
  createdAt: Date;
}

/**
 * Document version history entry.
 */
export interface DocumentVersion {
  version: number;
  documentId: string;
  fileUrl: string;
  fileSize: number;
  mimeType: string;
  uploadedAt: Date;
  uploadedBy: string;
  changeReason?: string;
  isCurrent: boolean;
}

/**
 * Document expiry tracking.
 */
export interface DocumentExpiry {
  status: DocumentExpiryStatus;
  expiryDate?: Date;
  reminderSent: boolean;
  reminderSentAt?: Date;
  daysUntilExpiry?: number;
}

/**
 * Re-upload workflow details.
 */
export interface ReuploadWorkflow {
  requested: boolean;
  requestedAt?: Date;
  requestedBy?: string;
  reason?: string;
  deadline?: Date;
  reuploadedAt?: Date;
  reuploadedBy?: string;
  isCompleted: boolean;
}

/**
 * AI metadata for document verification.
 */
export interface DocumentAIMetadata {
  ocrConfidence?: number;
  fraudScore?: number;
  authenticityScore?: number;
  modelVersion?: string;
  generatedAt?: Date;
  processingTimeMs?: number;
  recommendedAction?: string;
  riskLevel?: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
}

/**
 * Audit trail entry for document verification.
 */
export interface DocumentAuditTrail {
  action: 'CREATED' | 'UPDATED' | 'VERIFIED' | 'REJECTED' | 'REUPLOADED' | 'ARCHIVED' | 'RESTORED';
  performedBy: string;
  performedByRole: string;
  timestamp: Date;
  changes?: Record<string, unknown>;
  ipAddress?: string;
  userAgent?: string;
}

/**
 * Core document verification schema type.
 */
export interface DocumentVerificationSchemaType {
  documentVerificationId: string;
  applicantId: string;
  applicationNumber: string;
  documentId: string;
  documentType: 'PHOTO' | 'SIGNATURE' | 'MARKSHEET' | 'CERTIFICATE' | 'ID_PROOF' | 'ADDRESS_PROOF' | 'ENTRANCE_SCORE' | 'TRANSFER_CERTIFICATE' | 'MIGRATION' | 'OTHER';
  documentName: string;
  description?: string;
  fileUrl: string;
  fileSize: number;
  mimeType: string;
  uploadedBy: string;
  uploadedAt: Date;
  verificationStatus: VerificationStatus;
  priority: string;
  currentVersion: number;
  versions: DocumentVersion[];
  ocrResult: OCRResult;
  fraudDetection: FraudDetection;
  manualReview?: ManualReview;
  verifierNotes: string[];
  verificationTimeline: VerificationTimelineEvent[];
  documentExpiry: DocumentExpiry;
  reuploadWorkflow: ReuploadWorkflow;
  aiMetadata: DocumentAIMetadata;
  auditTrail: DocumentAuditTrail[];
  isActive: boolean;
  archivedAt?: Date;
  archivedBy?: string;
  createdBy: string;
  updatedBy: string;
  deletedBy?: string;
  deletedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}
