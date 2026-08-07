import { z } from 'zod';
import { objectIdSchema } from '../../shared/validators';

/**
 * OCR result schema.
 */
export const ocrResultSchema = z.object({
  status: z.enum(['PENDING', 'PROCESSING', 'COMPLETED', 'FAILED']).default('PENDING'),
  extractedText: z.string().trim().max(10000).optional().or(z.literal('')),
  confidenceScore: z.coerce.number().int().min(0).max(100).optional(),
  processedAt: z.coerce.date().optional(),
  errorMessage: z.string().trim().max(500).optional().or(z.literal('')),
  fields: z.object({
    name: z.string().trim().max(200).optional().or(z.literal('')),
    registrationNumber: z.string().trim().max(100).optional().or(z.literal('')),
    issuingAuthority: z.string().trim().max(200).optional().or(z.literal('')),
    issueDate: z.coerce.date().optional(),
    expiryDate: z.coerce.date().optional(),
    marksPercentage: z.coerce.number().int().min(0).max(100).optional(),
    totalMarks: z.coerce.number().int().min(0).optional(),
    obtainedMarks: z.coerce.number().int().min(0).optional(),
    grade: z.string().trim().max(10).optional().or(z.literal('')),
    additionalFields: z.record(z.unknown()).optional(),
  }).default({}),
});

/**
 * Fraud detection schema.
 */
export const fraudDetectionSchema = z.object({
  result: z.enum(['CLEAN', 'SUSPICIOUS', 'FRAUDULENT', 'MANUAL_REVIEW_REQUIRED']).default('CLEAN'),
  score: z.coerce.number().int().min(0).max(100).default(0),
  checks: z.object({
    tamperingDetected: z.boolean().default(false),
    copyPasteDetected: z.boolean().default(false),
    fontInconsistency: z.boolean().default(false),
    metadataMismatch: z.boolean().default(false),
    duplicateDocumentFound: z.boolean().default(false),
  }).default({
    tamperingDetected: false,
    copyPasteDetected: false,
    fontInconsistency: false,
    metadataMismatch: false,
    duplicateDocumentFound: false,
  }),
  details: z.array(z.string().trim()).default([]),
  detectedAt: z.coerce.date().default(new Date()),
  modelVersion: z.string().trim().max(50).optional().or(z.literal('')),
});

/**
 * Manual review schema.
 */
export const manualReviewSchema = z.object({
  decision: z.enum(['APPROVE', 'REJECT', 'HOLD', 'REQUIRES_REUPLOAD']).optional(),
  reviewedBy: z.string().trim().min(1, 'Reviewed by is required'),
  reviewedAt: z.coerce.date().default(new Date()),
  remarks: z.string().trim().max(1000).optional().or(z.literal('')),
  rejectionReason: z.string().trim().max(500).optional().or(z.literal('')),
  requiresReupload: z.boolean().default(false),
  reuploadReason: z.string().trim().max(500).optional().or(z.literal('')),
});

/**
 * Document version schema.
 */
export const documentVersionSchema = z.object({
  version: z.coerce.number().int().min(1),
  documentId: z.string().trim().min(1, 'Document ID is required'),
  fileUrl: z.string().trim().min(1, 'File URL is required').max(500),
  fileSize: z.coerce.number().int().min(0),
  mimeType: z.string().trim().min(1, 'MIME type is required').max(100),
  uploadedAt: z.coerce.date(),
  uploadedBy: z.string().trim().min(1, 'Uploaded by is required'),
  changeReason: z.string().trim().max(500).optional().or(z.literal('')),
  isCurrent: z.boolean().default(true),
});

/**
 * Document expiry schema.
 */
export const documentExpirySchema = z.object({
  status: z.enum(['VALID', 'EXPIRING_SOON', 'EXPIRED', 'NO_EXPIRY']).default('NO_EXPIRY'),
  expiryDate: z.coerce.date().optional(),
  reminderSent: z.boolean().default(false),
  reminderSentAt: z.coerce.date().optional(),
  daysUntilExpiry: z.coerce.number().int().min(0).optional(),
});

/**
 * Re-upload workflow schema.
 */
export const reuploadWorkflowSchema = z.object({
  requested: z.boolean().default(false),
  requestedAt: z.coerce.date().optional(),
  requestedBy: z.string().trim().optional().or(z.literal('')),
  reason: z.string().trim().max(500).optional().or(z.literal('')),
  deadline: z.coerce.date().optional(),
  reuploadedAt: z.coerce.date().optional(),
  reuploadedBy: z.string().trim().optional().or(z.literal('')),
  isCompleted: z.boolean().default(false),
});

/**
 * AI metadata schema.
 */
export const documentAIMetadataSchema = z.object({
  ocrConfidence: z.coerce.number().int().min(0).max(100).optional(),
  fraudScore: z.coerce.number().int().min(0).max(100).optional(),
  authenticityScore: z.coerce.number().int().min(0).max(100).optional(),
  modelVersion: z.string().trim().max(50).optional().or(z.literal('')),
  generatedAt: z.coerce.date().optional(),
  processingTimeMs: z.coerce.number().int().min(0).optional(),
  recommendedAction: z.string().trim().max(200).optional().or(z.literal('')),
  riskLevel: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']).optional(),
});

/**
 * Document audit trail schema.
 */
export const documentAuditTrailSchema = z.object({
  action: z.enum(['CREATED', 'UPDATED', 'VERIFIED', 'REJECTED', 'REUPLOADED', 'ARCHIVED', 'RESTORED']),
  performedBy: z.string().trim().min(1, 'Performed by is required'),
  performedByRole: z.string().trim().min(1, 'Performed by role is required'),
  timestamp: z.coerce.date(),
  changes: z.record(z.unknown()).optional(),
  ipAddress: z.string().trim().max(45).optional().or(z.literal('')),
  userAgent: z.string().trim().max(500).optional().or(z.literal('')),
});

/**
 * Create document verification schema.
 */
export const createDocumentVerificationSchema = z.object({
  applicantId: objectIdSchema,
  applicationNumber: z.string().trim().regex(/^APP-\d{4}-\d{6}$/, 'Application number must follow format APP-YYYY-NNNNNN'),
  documentId: z.string().trim().min(1, 'Document ID is required'),
  documentType: z.enum(['PHOTO', 'SIGNATURE', 'MARKSHEET', 'CERTIFICATE', 'ID_PROOF', 'ADDRESS_PROOF', 'ENTRANCE_SCORE', 'TRANSFER_CERTIFICATE', 'MIGRATION', 'OTHER']),
  documentName: z.string().trim().min(1, 'Document name is required').max(200),
  description: z.string().trim().max(500).optional().or(z.literal('')),
  fileUrl: z.string().trim().min(1, 'File URL is required').max(500),
  fileSize: z.coerce.number().int().min(0),
  mimeType: z.string().trim().min(1, 'MIME type is required').max(100),
  uploadedBy: z.string().trim().min(1, 'Uploaded by is required'),
  priority: z.string().trim().max(50).default('MEDIUM'),
  expiryDate: z.coerce.date().optional(),
});

/**
 * Update document verification schema.
 */
export const updateDocumentVerificationSchema = z.object({
  verificationStatus: z.enum(['PENDING', 'UNDER_REVIEW', 'VERIFIED', 'REJECTED', 'EXPIRED', 'REQUIRES_REUPLOAD']).optional(),
  priority: z.string().trim().max(50).optional(),
  manualReview: manualReviewSchema.optional(),
  verifierNotes: z.array(z.string().trim()).default([]),
  documentExpiry: documentExpirySchema.optional(),
  reuploadWorkflow: reuploadWorkflowSchema.optional(),
});

/**
 * Approve document schema.
 */
export const approveDocumentSchema = z.object({
  remarks: z.string().trim().max(1000).optional().or(z.literal('')),
});

/**
 * Reject document schema.
 */
export const rejectDocumentSchema = z.object({
  rejectionReason: z.string().trim().min(1, 'Rejection reason is required').max(500),
  requiresReupload: z.boolean().default(false),
  reuploadReason: z.string().trim().max(500).optional().or(z.literal('')),
});

/**
 * Re-upload document schema.
 */
export const reuploadDocumentSchema = z.object({
  fileUrl: z.string().trim().min(1, 'File URL is required').max(500),
  fileSize: z.coerce.number().int().min(0),
  mimeType: z.string().trim().min(1, 'MIME type is required').max(100),
  changeReason: z.string().trim().max(500).optional().or(z.literal('')),
});

/**
 * Document verification query schema.
 */
export const documentVerificationQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  sort: z.string().trim().optional(),
  order: z.enum(['asc', 'desc']).default('desc'),
  search: z.string().trim().optional(),
  verificationStatus: z.enum(['PENDING', 'UNDER_REVIEW', 'VERIFIED', 'REJECTED', 'EXPIRED', 'REQUIRES_REUPLOAD']).optional(),
  documentType: z.enum(['PHOTO', 'SIGNATURE', 'MARKSHEET', 'CERTIFICATE', 'ID_PROOF', 'ADDRESS_PROOF', 'ENTRANCE_SCORE', 'TRANSFER_CERTIFICATE', 'MIGRATION', 'OTHER']).optional(),
  applicantId: z.string().trim().optional(),
  applicationNumber: z.string().trim().optional(),
  priority: z.string().trim().optional(),
  isActive: z.coerce.boolean().optional(),
  uploadedBy: z.string().trim().optional(),
  verifiedBy: z.string().trim().optional(),
  fraudResult: z.enum(['CLEAN', 'SUSPICIOUS', 'FRAUDULENT', 'MANUAL_REVIEW_REQUIRED']).optional(),
  expiryStatus: z.enum(['VALID', 'EXPIRING_SOON', 'EXPIRED', 'NO_EXPIRY']).optional(),
  uploadedFrom: z.string().trim().optional(),
  uploadedTo: z.string().trim().optional(),
});

/**
 * Bulk verify schema.
 */
export const bulkVerifySchema = z.object({
  documentVerificationIds: z.array(objectIdSchema).min(1).max(500),
  verifiedBy: z.string().trim().min(1, 'Verified by is required'),
  remarks: z.string().trim().max(1000).optional().or(z.literal('')),
});

/**
 * Bulk reject schema.
 */
export const bulkRejectSchema = z.object({
  documentVerificationIds: z.array(objectIdSchema).min(1).max(500),
  rejectionReason: z.string().trim().min(1, 'Rejection reason is required').max(500),
  requiresReupload: z.boolean().default(false),
  reuploadReason: z.string().trim().max(500).optional().or(z.literal('')),
});

/**
 * Bulk import schema.
 */
export const bulkImportDocumentVerificationSchema = z.object({
  documents: z.array(createDocumentVerificationSchema).min(1).max(500),
});

export type OCRResultInput = z.infer<typeof ocrResultSchema>;
export type FraudDetectionInput = z.infer<typeof fraudDetectionSchema>;
export type ManualReviewInput = z.infer<typeof manualReviewSchema>;
export type DocumentVersionInput = z.infer<typeof documentVersionSchema>;
export type DocumentExpiryInput = z.infer<typeof documentExpirySchema>;
export type ReuploadWorkflowInput = z.infer<typeof reuploadWorkflowSchema>;
export type DocumentAIMetadataInput = z.infer<typeof documentAIMetadataSchema>;
export type DocumentAuditTrailInput = z.infer<typeof documentAuditTrailSchema>;
export type CreateDocumentVerificationInput = z.infer<typeof createDocumentVerificationSchema>;
export type UpdateDocumentVerificationInput = z.infer<typeof updateDocumentVerificationSchema>;
export type ApproveDocumentInput = z.infer<typeof approveDocumentSchema>;
export type RejectDocumentInput = z.infer<typeof rejectDocumentSchema>;
export type ReuploadDocumentInput = z.infer<typeof reuploadDocumentSchema>;
export type DocumentVerificationQueryInput = z.infer<typeof documentVerificationQuerySchema>;
export type BulkVerifyInput = z.infer<typeof bulkVerifySchema>;
export type BulkRejectInput = z.infer<typeof bulkRejectSchema>;
export type BulkImportDocumentVerificationInput = z.infer<typeof bulkImportDocumentVerificationSchema>;
