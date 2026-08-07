/** Admission status. */
export type AdmissionStatus = 'PENDING' | 'UNDER_REVIEW' | 'APPROVED' | 'REJECTED' | 'HOLD' | 'WAITLISTED' | 'CONDITIONAL' | 'ADMITTED' | 'CANCELLED';

/** Approval level. */
export type ApprovalLevel = 'LEVEL_1' | 'LEVEL_2' | 'LEVEL_3' | 'FINAL';

/** Approval decision. */
export type ApprovalDecision = 'APPROVED' | 'REJECTED' | 'HOLD' | 'CONDITIONAL';

/** Priority queue status. */
export type PriorityQueueStatus = 'QUEUED' | 'PROCESSING' | 'PROCESSED' | 'CANCELLED';

/** Admission letter status. */
export type AdmissionLetterStatus = 'PENDING' | 'GENERATED' | 'SENT' | 'ACCEPTED' | 'REJECTED' | 'EXPIRED';

/**
 * Approval workflow details.
 */
export interface ApprovalWorkflow {
  currentLevel: ApprovalLevel;
  totalLevels: number;
  approvals: ApprovalRecord[];
  isCompleted: boolean;
  finalDecision?: ApprovalDecision;
}

/**
 * Approval record.
 */
export interface ApprovalRecord {
  level: ApprovalLevel;
  decision: ApprovalDecision;
  reviewedBy: string;
  reviewedAt: Date;
  remarks?: string;
  conditions?: string[];
}

/**
 * Reviewer assignment.
 */
export interface ReviewerAssignment {
  reviewerId: string;
  reviewerName: string;
  reviewerRole: string;
  assignedAt: Date;
  assignedBy: string;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED';
}

/**
 * Seat allocation details.
 */
export interface SeatAllocation {
  status: 'RESERVED' | 'CONFIRMED' | 'CANCELLED';
  seatNumber?: string;
  reservedAt?: Date;
  confirmedAt?: Date;
  cancelledAt?: Date;
  reservationExpiry?: Date;
}

/**
 * Offer letter details.
 */
export interface OfferLetter {
  status: AdmissionLetterStatus;
  generatedAt?: Date;
  sentAt?: Date;
  acceptedAt?: Date;
  rejectedAt?: Date;
  expiredAt?: Date;
  documentId?: string;
  validUntil?: Date;
}

/**
 * Admission letter details.
 */
export interface AdmissionLetter {
  status: AdmissionLetterStatus;
  generatedAt?: Date;
  sentAt?: Date;
  acceptedAt?: Date;
  documentId?: string;
  validUntil?: Date;
}

/**
 * Fee trigger details.
 */
export interface FeeTrigger {
  triggered: boolean;
  triggeredAt?: Date;
  triggeredBy?: string;
  totalFee: number;
  dueDate?: Date;
  paymentStatus: 'PENDING' | 'PAID' | 'OVERDUE';
}

/**
 * Deadline details.
 */
export interface Deadline {
  description: string;
  dueDate: Date;
  reminderSent: boolean;
  reminderSentAt?: Date;
  escalated: boolean;
  escalatedAt?: Date;
}

/**
 * Waiting list entry.
 */
export interface WaitingListEntry {
  position: number;
  listedAt: Date;
  reason?: string;
  priorityScore: number;
  notified: boolean;
  notifiedAt?: Date;
  expiresAt?: Date;
}

/**
 * Priority queue entry.
 */
export interface PriorityQueueEntry {
  queueId: string;
  priority: number;
  queuedAt: Date;
  processedAt?: Date;
  status: PriorityQueueStatus;
  reason?: string;
}

/**
 * Admission timeline event.
 */
export interface AdmissionTimelineEvent {
  eventId: string;
  eventType: 'APPLICATION_SUBMITTED' | 'DOCUMENTS_VERIFIED' | 'ELIGIBILITY_CHECKED' | 'ADMISSION_APPROVED' | 'ADMISSION_REJECTED' | 'SEAT_ALLOCATED' | 'OFFER_LETTER_GENERATED' | 'OFFER_ACCEPTED' | 'FEE_PAID' | 'STUDENT_CREATED' | 'NOTE_ADDED' | 'STATUS_CHANGED';
  description: string;
  performedBy: string;
  performedByRole: string;
  createdAt: Date;
}

/**
 * Version history entry.
 */
export interface VersionHistory {
  version: number;
  changedBy: string;
  changedAt: Date;
  changes: Record<string, unknown>;
  reason?: string;
}

/**
 * AI recommendation details.
 */
export interface AIRecommendation {
  score: number;
  recommendation: 'STRONG_RECOMMEND' | 'RECOMMEND' | 'NEUTRAL' | 'NOT_RECOMMEND' | 'STRONG_NOT_RECOMMEND';
  factors: string[];
  confidence: number;
  modelVersion?: string;
  generatedAt: Date;
}

/**
 * Audit trail entry.
 */
export interface AuditTrailEntry {
  action: string;
  performedBy: string;
  performedByRole: string;
  timestamp: Date;
  changes?: Record<string, unknown>;
  ipAddress?: string;
  userAgent?: string;
}

/**
 * Core admission schema type.
 */
export interface AdmissionSchemaType {
  admissionId: string;
  applicantId: string;
  applicationNumber: string;
  admissionStatus: AdmissionStatus;
  approvalWorkflow: ApprovalWorkflow;
  reviewerAssignments: ReviewerAssignment[];
  seatAllocation: SeatAllocation;
  offerLetter: OfferLetter;
  admissionLetter: AdmissionLetter;
  feeTrigger: FeeTrigger;
  deadlines: Deadline[];
  waitingList: WaitingListEntry[];
  priorityQueue: PriorityQueueEntry[];
  admissionTimeline: AdmissionTimelineEvent[];
  versionHistory: VersionHistory[];
  aiRecommendation?: AIRecommendation;
  auditTrail: AuditTrailEntry[];
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
