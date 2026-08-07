import { Schema, model, type HydratedDocument, type Model } from 'mongoose';
import type { DocumentVerificationSchemaType } from './documentVerification.types';

export type DocumentVerificationDocument = HydratedDocument<DocumentVerificationSchemaType>;
export { DocumentVerificationSchemaType };

/**
 * Mongoose schema for the DocumentVerification collection.
 *
 * Includes:
 * - Soft delete via `deletedAt` and `isActive`
 * - Audit fields (`createdBy`, `updatedBy`, `deletedBy`, `createdAt`, `updatedAt`)
 * - Enterprise indexes for query performance
 * - Text search on document and applicant fields
 */
const documentVerificationSchema = new Schema<DocumentVerificationSchemaType>(
  {
    documentVerificationId: { type: String, required: true, unique: true, index: true },
    applicantId: { type: String, required: true, index: true },
    applicationNumber: { type: String, required: true, uppercase: true, trim: true, index: true },
    documentId: { type: String, required: true, trim: true, index: true },
    documentType: { type: String, required: true, enum: ['PHOTO', 'SIGNATURE', 'MARKSHEET', 'CERTIFICATE', 'ID_PROOF', 'ADDRESS_PROOF', 'ENTRANCE_SCORE', 'TRANSFER_CERTIFICATE', 'MIGRATION', 'OTHER'], index: true },
    documentName: { type: String, required: true, trim: true, maxlength: 200, index: true },
    description: { type: String, trim: true, maxlength: 500 },
    fileUrl: { type: String, required: true, trim: true, maxlength: 500 },
    fileSize: { type: Number, required: true, min: 0 },
    mimeType: { type: String, required: true, trim: true, maxlength: 100 },
    uploadedBy: { type: String, required: true, trim: true, index: true },
    uploadedAt: { type: Date, required: true, index: true },
    verificationStatus: { type: String, required: true, enum: ['PENDING', 'UNDER_REVIEW', 'VERIFIED', 'REJECTED', 'EXPIRED', 'REQUIRES_REUPLOAD'], default: 'PENDING', index: true },
    priority: { type: String, required: true, trim: true, maxlength: 50, default: 'MEDIUM', index: true },
    currentVersion: { type: Number, required: true, default: 1, min: 1 },
    versions: [
      {
        version: { type: Number, required: true, min: 1 },
        documentId: { type: String, required: true, trim: true },
        fileUrl: { type: String, required: true, trim: true, maxlength: 500 },
        fileSize: { type: Number, required: true, min: 0 },
        mimeType: { type: String, required: true, trim: true, maxlength: 100 },
        uploadedAt: { type: Date, required: true },
        uploadedBy: { type: String, required: true, trim: true },
        changeReason: { type: String, trim: true, maxlength: 500 },
        isCurrent: { type: Boolean, default: true },
      },
    ],
    ocrResult: {
      status: { type: String, required: true, enum: ['PENDING', 'PROCESSING', 'COMPLETED', 'FAILED'], default: 'PENDING' },
      extractedText: { type: String, trim: true, maxlength: 10000 },
      confidenceScore: { type: Number, min: 0, max: 100 },
      processedAt: { type: Date },
      errorMessage: { type: String, trim: true, maxlength: 500 },
      fields: {
        name: { type: String, trim: true, maxlength: 200 },
        registrationNumber: { type: String, trim: true, maxlength: 100 },
        issuingAuthority: { type: String, trim: true, maxlength: 200 },
        issueDate: { type: Date },
        expiryDate: { type: Date },
        marksPercentage: { type: Number, min: 0, max: 100 },
        totalMarks: { type: Number, min: 0 },
        obtainedMarks: { type: Number, min: 0 },
        grade: { type: String, trim: true, maxlength: 10 },
        additionalFields: { type: Map, of: Schema.Types.Mixed },
      },
    },
    fraudDetection: {
      result: { type: String, required: true, enum: ['CLEAN', 'SUSPICIOUS', 'FRAUDULENT', 'MANUAL_REVIEW_REQUIRED'], default: 'CLEAN' },
      score: { type: Number, required: true, min: 0, max: 100, default: 0 },
      checks: {
        tamperingDetected: { type: Boolean, default: false },
        copyPasteDetected: { type: Boolean, default: false },
        fontInconsistency: { type: Boolean, default: false },
        metadataMismatch: { type: Boolean, default: false },
        duplicateDocumentFound: { type: Boolean, default: false },
      },
      details: [{ type: String, trim: true }],
      detectedAt: { type: Date, required: true, default: Date.now },
      modelVersion: { type: String, trim: true, maxlength: 50 },
    },
    manualReview: {
      decision: { type: String, enum: ['APPROVE', 'REJECT', 'HOLD', 'REQUIRES_REUPLOAD'] },
      reviewedBy: { type: String, trim: true },
      reviewedAt: { type: Date },
      remarks: { type: String, trim: true, maxlength: 1000 },
      rejectionReason: { type: String, trim: true, maxlength: 500 },
      requiresReupload: { type: Boolean, default: false },
      reuploadReason: { type: String, trim: true, maxlength: 500 },
    },
    verifierNotes: [{ type: String, trim: true, maxlength: 1000 }],
    verificationTimeline: [
      {
        eventId: { type: String, required: true, trim: true },
        eventType: { type: String, required: true, enum: ['DOCUMENT_UPLOADED', 'OCR_PROCESSED', 'FRAUD_CHECKED', 'VERIFIED', 'REJECTED', 'REUPLOAD_REQUESTED', 'NOTE_ADDED', 'STATUS_CHANGED'] },
        description: { type: String, required: true, trim: true, maxlength: 1000 },
        performedBy: { type: String, required: true, trim: true },
        performedByRole: { type: String, required: true, trim: true },
        createdAt: { type: Date, required: true },
      },
    ],
    documentExpiry: {
      status: { type: String, required: true, enum: ['VALID', 'EXPIRING_SOON', 'EXPIRED', 'NO_EXPIRY'], default: 'NO_EXPIRY' },
      expiryDate: { type: Date },
      reminderSent: { type: Boolean, default: false },
      reminderSentAt: { type: Date },
      daysUntilExpiry: { type: Number, min: 0 },
    },
    reuploadWorkflow: {
      requested: { type: Boolean, default: false },
      requestedAt: { type: Date },
      requestedBy: { type: String, trim: true },
      reason: { type: String, trim: true, maxlength: 500 },
      deadline: { type: Date },
      reuploadedAt: { type: Date },
      reuploadedBy: { type: String, trim: true },
      isCompleted: { type: Boolean, default: false },
    },
    aiMetadata: {
      ocrConfidence: { type: Number, min: 0, max: 100 },
      fraudScore: { type: Number, min: 0, max: 100 },
      authenticityScore: { type: Number, min: 0, max: 100 },
      modelVersion: { type: String, trim: true, maxlength: 50 },
      generatedAt: { type: Date },
      processingTimeMs: { type: Number, min: 0 },
      recommendedAction: { type: String, trim: true, maxlength: 200 },
      riskLevel: { type: String, enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'] },
    },
    auditTrail: [
      {
        action: { type: String, required: true, enum: ['CREATED', 'UPDATED', 'VERIFIED', 'REJECTED', 'REUPLOADED', 'ARCHIVED', 'RESTORED'] },
        performedBy: { type: String, required: true, trim: true },
        performedByRole: { type: String, required: true, trim: true },
        timestamp: { type: Date, required: true },
        changes: { type: Map, of: Schema.Types.Mixed },
        ipAddress: { type: String, trim: true, maxlength: 45 },
        userAgent: { type: String, trim: true, maxlength: 500 },
      },
    ],
    isActive: { type: Boolean, required: true, default: true, index: true },
    archivedAt: { type: Date },
    archivedBy: { type: String, trim: true },
    createdBy: { type: String, required: true },
    updatedBy: { type: String, required: true },
    deletedBy: { type: String },
    deletedAt: { type: Date, index: true },
  },
  {
    timestamps: true,
    versionKey: false,
    toJSON: {
      transform: (_doc, ret: Record<string, unknown>) => {
        ret.id = ret._id;
        delete ret._id;
        return ret;
      },
    },
  },
);

/**
 * Compound and performance indexes.
 */
documentVerificationSchema.index({ applicantId: 1, verificationStatus: 1 });
documentVerificationSchema.index({ applicationNumber: 1, verificationStatus: 1 });
documentVerificationSchema.index({ documentType: 1, verificationStatus: 1 });
documentVerificationSchema.index({ uploadedBy: 1, verificationStatus: 1 });
documentVerificationSchema.index({ priority: 1, verificationStatus: 1 });
documentVerificationSchema.index({ 'fraudDetection.result': 1 });
documentVerificationSchema.index({ 'documentExpiry.status': 1 });
documentVerificationSchema.index({ 'documentExpiry.expiryDate': 1 });
documentVerificationSchema.index({ 'reuploadWorkflow.isCompleted': 1 });
documentVerificationSchema.index({ createdAt: -1 });
documentVerificationSchema.index({ deletedAt: 1 });
documentVerificationSchema.index({ isActive: 1, verificationStatus: 1 });

/**
 * Text index for global search across document and applicant fields.
 */
documentVerificationSchema.index(
  {
    documentName: 'text',
    applicationNumber: 'text',
    'ocrResult.extractedText': 'text',
  },
  {
    weights: {
      documentName: 10,
      applicationNumber: 10,
      'ocrResult.extractedText': 5,
    },
  },
);

export const DocumentVerificationModel: Model<DocumentVerificationSchemaType> = model<DocumentVerificationSchemaType>('DocumentVerification', documentVerificationSchema);
