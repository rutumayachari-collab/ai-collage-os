import { Schema, model, type HydratedDocument, type Model } from 'mongoose';
import type { AdmissionSchemaType } from './admission.types';

export type AdmissionDocument = HydratedDocument<AdmissionSchemaType>;
export { AdmissionSchemaType };

/**
 * Mongoose schema for the Admission collection.
 *
 * Includes:
 * - Soft delete via `deletedAt` and `isActive`
 * - Audit fields (`createdBy`, `updatedBy`, `deletedBy`, `createdAt`, `updatedAt`)
 * - Enterprise indexes for query performance
 * - Text search on admission and applicant fields
 */
const admissionSchema = new Schema<AdmissionSchemaType>(
  {
    admissionId: { type: String, required: true, unique: true, index: true },
    applicantId: { type: String, required: true, index: true },
    applicationNumber: { type: String, required: true, uppercase: true, trim: true, index: true },
    admissionStatus: { type: String, required: true, enum: ['PENDING', 'UNDER_REVIEW', 'APPROVED', 'REJECTED', 'HOLD', 'WAITLISTED', 'CONDITIONAL', 'ADMITTED', 'CANCELLED'], default: 'PENDING', index: true },
    approvalWorkflow: {
      currentLevel: { type: String, enum: ['LEVEL_1', 'LEVEL_2', 'LEVEL_3', 'FINAL'], default: 'LEVEL_1' },
      totalLevels: { type: Number, min: 1, max: 10, default: 3 },
      approvals: [{
        level: { type: String, required: true, enum: ['LEVEL_1', 'LEVEL_2', 'LEVEL_3', 'FINAL'] },
        decision: { type: String, required: true, enum: ['APPROVED', 'REJECTED', 'HOLD', 'CONDITIONAL'] },
        reviewedBy: { type: String, required: true, trim: true },
        reviewedAt: { type: Date, required: true },
        remarks: { type: String, trim: true, maxlength: 1000 },
        conditions: [{ type: String, trim: true }],
      }],
      isCompleted: { type: Boolean, default: false },
      finalDecision: { type: String, enum: ['APPROVED', 'REJECTED', 'HOLD', 'CONDITIONAL'] },
    },
    reviewerAssignments: [{
      reviewerId: { type: String, required: true, trim: true },
      reviewerName: { type: String, required: true, trim: true, maxlength: 100 },
      reviewerRole: { type: String, required: true, trim: true, maxlength: 50 },
      assignedAt: { type: Date, required: true },
      assignedBy: { type: String, required: true, trim: true },
      status: { type: String, required: true, enum: ['PENDING', 'IN_PROGRESS', 'COMPLETED'], default: 'PENDING' },
    }],
    seatAllocation: {
      status: { type: String, required: true, enum: ['RESERVED', 'CONFIRMED', 'CANCELLED'], default: 'RESERVED' },
      seatNumber: { type: String, trim: true, maxlength: 20 },
      reservedAt: { type: Date },
      confirmedAt: { type: Date },
      cancelledAt: { type: Date },
      reservationExpiry: { type: Date },
    },
    offerLetter: {
      status: { type: String, required: true, enum: ['PENDING', 'GENERATED', 'SENT', 'ACCEPTED', 'REJECTED', 'EXPIRED'], default: 'PENDING' },
      generatedAt: { type: Date },
      sentAt: { type: Date },
      acceptedAt: { type: Date },
      rejectedAt: { type: Date },
      expiredAt: { type: Date },
      documentId: { type: String, trim: true },
      validUntil: { type: Date },
    },
    admissionLetter: {
      status: { type: String, required: true, enum: ['PENDING', 'GENERATED', 'SENT', 'ACCEPTED', 'REJECTED', 'EXPIRED'], default: 'PENDING' },
      generatedAt: { type: Date },
      sentAt: { type: Date },
      acceptedAt: { type: Date },
      documentId: { type: String, trim: true },
      validUntil: { type: Date },
    },
    feeTrigger: {
      triggered: { type: Boolean, required: true, default: false },
      triggeredAt: { type: Date },
      triggeredBy: { type: String, trim: true },
      totalFee: { type: Number, required: true, min: 0, default: 0 },
      dueDate: { type: Date },
      paymentStatus: { type: String, required: true, enum: ['PENDING', 'PAID', 'OVERDUE'], default: 'PENDING' },
    },
    deadlines: [{
      description: { type: String, required: true, trim: true, maxlength: 200 },
      dueDate: { type: Date, required: true },
      reminderSent: { type: Boolean, default: false },
      reminderSentAt: { type: Date },
      escalated: { type: Boolean, default: false },
      escalatedAt: { type: Date },
    }],
    waitingList: [{
      position: { type: Number, required: true, min: 1 },
      listedAt: { type: Date, required: true },
      reason: { type: String, trim: true, maxlength: 500 },
      priorityScore: { type: Number, min: 0, max: 100, default: 0 },
      notified: { type: Boolean, default: false },
      notifiedAt: { type: Date },
      expiresAt: { type: Date },
    }],
    priorityQueue: [{
      queueId: { type: String, required: true, trim: true },
      priority: { type: Number, min: 1, max: 10, default: 5 },
      queuedAt: { type: Date, required: true },
      processedAt: { type: Date },
      status: { type: String, required: true, enum: ['QUEUED', 'PROCESSING', 'PROCESSED', 'CANCELLED'], default: 'QUEUED' },
      reason: { type: String, trim: true, maxlength: 500 },
    }],
    admissionTimeline: [{
      eventId: { type: String, required: true, trim: true },
      eventType: { type: String, required: true, enum: ['APPLICATION_SUBMITTED', 'DOCUMENTS_VERIFIED', 'ELIGIBILITY_CHECKED', 'ADMISSION_APPROVED', 'ADMISSION_REJECTED', 'SEAT_ALLOCATED', 'OFFER_LETTER_GENERATED', 'OFFER_ACCEPTED', 'FEE_PAID', 'STUDENT_CREATED', 'NOTE_ADDED', 'STATUS_CHANGED'] },
      description: { type: String, required: true, trim: true, maxlength: 1000 },
      performedBy: { type: String, required: true, trim: true },
      performedByRole: { type: String, required: true, trim: true },
      createdAt: { type: Date, required: true },
    }],
    versionHistory: [{
      version: { type: Number, required: true, min: 1 },
      changedBy: { type: String, required: true, trim: true },
      changedAt: { type: Date, required: true },
      changes: { type: Map, of: Schema.Types.Mixed },
      reason: { type: String, trim: true, maxlength: 500 },
    }],
    aiRecommendation: {
      score: { type: Number, min: 0, max: 100 },
      recommendation: { type: String, enum: ['STRONG_RECOMMEND', 'RECOMMEND', 'NEUTRAL', 'NOT_RECOMMEND', 'STRONG_NOT_RECOMMEND'], default: 'NEUTRAL' },
      factors: [{ type: String, trim: true }],
      confidence: { type: Number, min: 0, max: 100, default: 0 },
      modelVersion: { type: String, trim: true, maxlength: 50 },
      generatedAt: { type: Date },
    },
    auditTrail: [{
      action: { type: String, required: true, trim: true },
      performedBy: { type: String, required: true, trim: true },
      performedByRole: { type: String, required: true, trim: true },
      timestamp: { type: Date, required: true },
      changes: { type: Map, of: Schema.Types.Mixed },
      ipAddress: { type: String, trim: true, maxlength: 45 },
      userAgent: { type: String, trim: true, maxlength: 500 },
    }],
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
admissionSchema.index({ applicantId: 1, admissionStatus: 1 });
admissionSchema.index({ applicationNumber: 1, admissionStatus: 1 });
admissionSchema.index({ admissionStatus: 1, isActive: 1 });
admissionSchema.index({ 'seatAllocation.status': 1 });
admissionSchema.index({ 'offerLetter.status': 1 });
admissionSchema.index({ 'admissionLetter.status': 1 });
admissionSchema.index({ 'feeTrigger.paymentStatus': 1 });
admissionSchema.index({ 'approvalWorkflow.finalDecision': 1 });
admissionSchema.index({ createdAt: -1 });
admissionSchema.index({ deletedAt: 1 });

/**
 * Text index for global search across admission fields.
 */
admissionSchema.index(
  {
    applicationNumber: 'text',
    'approvalWorkflow.finalDecision': 'text',
  },
  {
    weights: {
      applicationNumber: 10,
      'approvalWorkflow.finalDecision': 5,
    },
  },
);

export const AdmissionModel: Model<AdmissionSchemaType> = model<AdmissionSchemaType>('Admission', admissionSchema);
