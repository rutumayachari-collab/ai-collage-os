import { z } from 'zod';
import { objectIdSchema } from '../../shared/validators';

/**
 * Approval record schema.
 */
export const approvalRecordSchema = z.object({
  level: z.enum(['LEVEL_1', 'LEVEL_2', 'LEVEL_3', 'FINAL']),
  decision: z.enum(['APPROVED', 'REJECTED', 'HOLD', 'CONDITIONAL']),
  reviewedBy: z.string().trim().min(1, 'Reviewed by is required'),
  reviewedAt: z.coerce.date().default(new Date()),
  remarks: z.string().trim().max(1000).optional().or(z.literal('')),
  conditions: z.array(z.string().trim()).default([]),
});

/**
 * Approval workflow schema.
 */
export const approvalWorkflowSchema = z.object({
  currentLevel: z.enum(['LEVEL_1', 'LEVEL_2', 'LEVEL_3', 'FINAL']).default('LEVEL_1'),
  totalLevels: z.coerce.number().int().min(1).max(10).default(3),
  approvals: z.array(approvalRecordSchema).default([]),
  isCompleted: z.boolean().default(false),
  finalDecision: z.enum(['APPROVED', 'REJECTED', 'HOLD', 'CONDITIONAL']).optional(),
});

/**
 * Reviewer assignment schema.
 */
export const reviewerAssignmentSchema = z.object({
  reviewerId: z.string().trim().min(1, 'Reviewer ID is required'),
  reviewerName: z.string().trim().min(1, 'Reviewer name is required').max(100),
  reviewerRole: z.string().trim().min(1, 'Reviewer role is required').max(50),
  assignedAt: z.coerce.date().default(new Date()),
  assignedBy: z.string().trim().min(1, 'Assigned by is required'),
  status: z.enum(['PENDING', 'IN_PROGRESS', 'COMPLETED']).default('PENDING'),
});

/**
 * Seat allocation schema.
 */
export const seatAllocationSchema = z.object({
  status: z.enum(['RESERVED', 'CONFIRMED', 'CANCELLED']).default('RESERVED'),
  seatNumber: z.string().trim().max(20).optional().or(z.literal('')),
  reservedAt: z.coerce.date().optional(),
  confirmedAt: z.coerce.date().optional(),
  cancelledAt: z.coerce.date().optional(),
  reservationExpiry: z.coerce.date().optional(),
});

/**
 * Offer letter schema.
 */
export const offerLetterSchema = z.object({
  status: z.enum(['PENDING', 'GENERATED', 'SENT', 'ACCEPTED', 'REJECTED', 'EXPIRED']).default('PENDING'),
  generatedAt: z.coerce.date().optional(),
  sentAt: z.coerce.date().optional(),
  acceptedAt: z.coerce.date().optional(),
  rejectedAt: z.coerce.date().optional(),
  expiredAt: z.coerce.date().optional(),
  documentId: z.string().trim().optional().or(z.literal('')),
  validUntil: z.coerce.date().optional(),
});

/**
 * Admission letter schema.
 */
export const admissionLetterSchema = z.object({
  status: z.enum(['PENDING', 'GENERATED', 'SENT', 'ACCEPTED', 'REJECTED', 'EXPIRED']).default('PENDING'),
  generatedAt: z.coerce.date().optional(),
  sentAt: z.coerce.date().optional(),
  acceptedAt: z.coerce.date().optional(),
  documentId: z.string().trim().optional().or(z.literal('')),
  validUntil: z.coerce.date().optional(),
});

/**
 * Fee trigger schema.
 */
export const feeTriggerSchema = z.object({
  triggered: z.boolean().default(false),
  triggeredAt: z.coerce.date().optional(),
  triggeredBy: z.string().trim().optional().or(z.literal('')),
  totalFee: z.coerce.number().int().min(0).default(0),
  dueDate: z.coerce.date().optional(),
  paymentStatus: z.enum(['PENDING', 'PAID', 'OVERDUE']).default('PENDING'),
});

/**
 * Deadline schema.
 */
export const deadlineSchema = z.object({
  description: z.string().trim().min(1, 'Description is required').max(200),
  dueDate: z.coerce.date(),
  reminderSent: z.boolean().default(false),
  reminderSentAt: z.coerce.date().optional(),
  escalated: z.boolean().default(false),
  escalatedAt: z.coerce.date().optional(),
});

/**
 * Waiting list entry schema.
 */
export const waitingListEntrySchema = z.object({
  position: z.coerce.number().int().min(1),
  listedAt: z.coerce.date().default(new Date()),
  reason: z.string().trim().max(500).optional().or(z.literal('')),
  priorityScore: z.coerce.number().int().min(0).max(100).default(0),
  notified: z.boolean().default(false),
  notifiedAt: z.coerce.date().optional(),
  expiresAt: z.coerce.date().optional(),
});

/**
 * Priority queue entry schema.
 */
export const priorityQueueEntrySchema = z.object({
  queueId: z.string().trim().min(1, 'Queue ID is required'),
  priority: z.coerce.number().int().min(1).max(10).default(5),
  queuedAt: z.coerce.date().default(new Date()),
  processedAt: z.coerce.date().optional(),
  status: z.enum(['QUEUED', 'PROCESSING', 'PROCESSED', 'CANCELLED']).default('QUEUED'),
  reason: z.string().trim().max(500).optional().or(z.literal('')),
});

/**
 * Admission timeline event schema.
 */
export const admissionTimelineEventSchema = z.object({
  eventId: z.string().trim().min(1, 'Event ID is required'),
  eventType: z.enum(['APPLICATION_SUBMITTED', 'DOCUMENTS_VERIFIED', 'ELIGIBILITY_CHECKED', 'ADMISSION_APPROVED', 'ADMISSION_REJECTED', 'SEAT_ALLOCATED', 'OFFER_LETTER_GENERATED', 'OFFER_ACCEPTED', 'FEE_PAID', 'STUDENT_CREATED', 'NOTE_ADDED', 'STATUS_CHANGED']),
  description: z.string().trim().min(1, 'Description is required').max(1000),
  performedBy: z.string().trim().min(1, 'Performed by is required'),
  performedByRole: z.string().trim().min(1, 'Performed by role is required'),
  createdAt: z.coerce.date().default(new Date()),
});

/**
 * Version history schema.
 */
export const versionHistorySchema = z.object({
  version: z.coerce.number().int().min(1),
  changedBy: z.string().trim().min(1, 'Changed by is required'),
  changedAt: z.coerce.date().default(new Date()),
  changes: z.record(z.unknown()),
  reason: z.string().trim().max(500).optional().or(z.literal('')),
});

/**
 * AI recommendation schema.
 */
export const aiRecommendationSchema = z.object({
  score: z.coerce.number().int().min(0).max(100).default(0),
  recommendation: z.enum(['STRONG_RECOMMEND', 'RECOMMEND', 'NEUTRAL', 'NOT_RECOMMEND', 'STRONG_NOT_RECOMMEND']).default('NEUTRAL'),
  factors: z.array(z.string().trim()).default([]),
  confidence: z.coerce.number().int().min(0).max(100).default(0),
  modelVersion: z.string().trim().max(50).optional().or(z.literal('')),
  generatedAt: z.coerce.date().default(new Date()),
});

/**
 * Audit trail entry schema.
 */
export const auditTrailEntrySchema = z.object({
  action: z.string().trim().min(1, 'Action is required'),
  performedBy: z.string().trim().min(1, 'Performed by is required'),
  performedByRole: z.string().trim().min(1, 'Performed by role is required'),
  timestamp: z.coerce.date().default(new Date()),
  changes: z.record(z.unknown()).optional(),
  ipAddress: z.string().trim().max(45).optional().or(z.literal('')),
  userAgent: z.string().trim().max(500).optional().or(z.literal('')),
});

/**
 * Create admission schema.
 */
export const createAdmissionSchema = z.object({
  applicantId: objectIdSchema,
  applicationNumber: z.string().trim().regex(/^APP-\d{4}-\d{6}$/, 'Application number must follow format APP-YYYY-NNNNNN'),
  admissionStatus: z.enum(['PENDING', 'UNDER_REVIEW', 'APPROVED', 'REJECTED', 'HOLD', 'WAITLISTED', 'CONDITIONAL', 'ADMITTED', 'CANCELLED']).default('PENDING'),
  approvalWorkflow: approvalWorkflowSchema.default({
    currentLevel: 'LEVEL_1',
    totalLevels: 3,
    approvals: [],
    isCompleted: false,
  }),
  reviewerAssignments: z.array(reviewerAssignmentSchema).default([]),
  seatAllocation: seatAllocationSchema.default({ status: 'RESERVED' }),
  offerLetter: offerLetterSchema.default({ status: 'PENDING' }),
  admissionLetter: admissionLetterSchema.default({ status: 'PENDING' }),
  feeTrigger: feeTriggerSchema.default({ triggered: false, totalFee: 0, paymentStatus: 'PENDING' }),
  deadlines: z.array(deadlineSchema).default([]),
  waitingList: z.array(waitingListEntrySchema).default([]),
  priorityQueue: z.array(priorityQueueEntrySchema).default([]),
  aiRecommendation: aiRecommendationSchema.optional(),
});

/**
 * Update admission schema.
 */
export const updateAdmissionSchema = z.object({
  admissionStatus: z.enum(['PENDING', 'UNDER_REVIEW', 'APPROVED', 'REJECTED', 'HOLD', 'WAITLISTED', 'CONDITIONAL', 'ADMITTED', 'CANCELLED']).optional(),
  approvalWorkflow: approvalWorkflowSchema.optional(),
  reviewerAssignments: z.array(reviewerAssignmentSchema).default([]),
  seatAllocation: seatAllocationSchema.optional(),
  offerLetter: offerLetterSchema.optional(),
  admissionLetter: admissionLetterSchema.optional(),
  feeTrigger: feeTriggerSchema.optional(),
  deadlines: z.array(deadlineSchema).default([]),
  waitingList: z.array(waitingListEntrySchema).default([]),
  priorityQueue: z.array(priorityQueueEntrySchema).default([]),
  aiRecommendation: aiRecommendationSchema.optional(),
});

/**
 * Admission query schema.
 */
export const admissionQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  sort: z.string().trim().optional(),
  order: z.enum(['asc', 'desc']).default('desc'),
  search: z.string().trim().optional(),
  admissionStatus: z.enum(['PENDING', 'UNDER_REVIEW', 'APPROVED', 'REJECTED', 'HOLD', 'WAITLISTED', 'CONDITIONAL', 'ADMITTED', 'CANCELLED']).optional(),
  applicantId: z.string().trim().optional(),
  applicationNumber: z.string().trim().optional(),
  isActive: z.coerce.boolean().optional(),
});

/**
 * Approval action schema.
 */
export const approvalActionSchema = z.object({
  decision: z.enum(['APPROVED', 'REJECTED', 'HOLD', 'CONDITIONAL']),
  remarks: z.string().trim().max(1000).optional().or(z.literal('')),
  conditions: z.array(z.string().trim()).default([]),
});

/**
 * Bulk approval schema.
 */
export const bulkApprovalSchema = z.object({
  admissionIds: z.array(objectIdSchema).min(1).max(500),
  decision: z.enum(['APPROVED', 'REJECTED', 'HOLD', 'CONDITIONAL']),
  remarks: z.string().trim().max(1000).optional().or(z.literal('')),
  conditions: z.array(z.string().trim()).default([]),
});

/**
 * Seat allocation schema.
 */
export const seatAllocationActionSchema = z.object({
  seatNumber: z.string().trim().max(20).optional().or(z.literal('')),
  reservationExpiry: z.coerce.date().optional(),
});

/**
 * Generate offer letter schema.
 */
export const generateOfferLetterSchema = z.object({
  validUntil: z.coerce.date(),
  documentId: z.string().trim().optional().or(z.literal('')),
});

/**
 * Generate admission letter schema.
 */
export const generateAdmissionLetterSchema = z.object({
  validUntil: z.coerce.date(),
  documentId: z.string().trim().optional().or(z.literal('')),
});

/**
 * Bulk import admission schema.
 */
export const bulkImportAdmissionSchema = z.object({
  admissions: z.array(createAdmissionSchema).min(1).max(500),
});

export type ApprovalRecordInput = z.infer<typeof approvalRecordSchema>;
export type ApprovalWorkflowInput = z.infer<typeof approvalWorkflowSchema>;
export type ReviewerAssignmentInput = z.infer<typeof reviewerAssignmentSchema>;
export type SeatAllocationInput = z.infer<typeof seatAllocationSchema>;
export type OfferLetterInput = z.infer<typeof offerLetterSchema>;
export type AdmissionLetterInput = z.infer<typeof admissionLetterSchema>;
export type FeeTriggerInput = z.infer<typeof feeTriggerSchema>;
export type DeadlineInput = z.infer<typeof deadlineSchema>;
export type WaitingListEntryInput = z.infer<typeof waitingListEntrySchema>;
export type PriorityQueueEntryInput = z.infer<typeof priorityQueueEntrySchema>;
export type AdmissionTimelineEventInput = z.infer<typeof admissionTimelineEventSchema>;
export type VersionHistoryInput = z.infer<typeof versionHistorySchema>;
export type AIRecommendationInput = z.infer<typeof aiRecommendationSchema>;
export type AuditTrailEntryInput = z.infer<typeof auditTrailEntrySchema>;
export type CreateAdmissionInput = z.infer<typeof createAdmissionSchema>;
export type UpdateAdmissionInput = z.infer<typeof updateAdmissionSchema>;
export type AdmissionQueryInput = z.infer<typeof admissionQuerySchema>;
export type ApprovalActionInput = z.infer<typeof approvalActionSchema>;
export type BulkApprovalInput = z.infer<typeof bulkApprovalSchema>;
export type SeatAllocationActionInput = z.infer<typeof seatAllocationActionSchema>;
export type GenerateOfferLetterInput = z.infer<typeof generateOfferLetterSchema>;
export type GenerateAdmissionLetterInput = z.infer<typeof generateAdmissionLetterSchema>;
export type BulkImportAdmissionInput = z.infer<typeof bulkImportAdmissionSchema>;
