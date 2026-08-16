import { Schema, model, type HydratedDocument, type Model } from 'mongoose';
import type {
  CallingCampaignStatus,
  CallOutcome,
  CallIntent,
  CallSentiment,
  AdmissionInterestLevel,
  LeadStage,
  PriorityLevel,
  RecommendedActionType,
  ActionApprovalStatus,
  SupportedLanguage,
} from './calling-agent.types';

// ─── Campaign ───────────────────────────────────────────────────────────────

export interface CallingCampaignSchemaType {
  campaignId: string;
  name: string;
  collegeName: string;
  purpose: string;
  targetCourse?: string;
  defaultLanguage: SupportedLanguage;
  status: CallingCampaignStatus;
  totalLeads: number;
  completedCalls: number;
  pendingCalls: number;
  successfulCalls: number;
  callbacksScheduled: number;
  escalationsCount: number;
  campusVisitsCount: number;
  dncCount: number;
  maxAttempts: number;
  callingHours: {
    start: string;
    end: string;
  };
  retryIntervalHours: number;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
}

export type CallingCampaignDocument = HydratedDocument<CallingCampaignSchemaType>;

const callingCampaignSchema = new Schema<CallingCampaignSchemaType>(
  {
    campaignId: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true, trim: true },
    collegeName: { type: String, required: true, trim: true },
    purpose: { type: String, required: true, trim: true },
    targetCourse: { type: String, trim: true },
    defaultLanguage: { type: String, required: true, default: 'English' },
    status: {
      type: String,
      required: true,
      enum: ['DRAFT', 'ACTIVE', 'PAUSED', 'COMPLETED', 'CANCELLED'],
      default: 'DRAFT',
      index: true,
    },
    totalLeads: { type: Number, required: true, default: 0 },
    completedCalls: { type: Number, required: true, default: 0 },
    pendingCalls: { type: Number, required: true, default: 0 },
    successfulCalls: { type: Number, required: true, default: 0 },
    callbacksScheduled: { type: Number, required: true, default: 0 },
    escalationsCount: { type: Number, required: true, default: 0 },
    campusVisitsCount: { type: Number, required: true, default: 0 },
    dncCount: { type: Number, required: true, default: 0 },
    maxAttempts: { type: Number, required: true, default: 3 },
    callingHours: {
      start: { type: String, default: '09:00' },
      end: { type: String, default: '19:00' },
    },
    retryIntervalHours: { type: Number, default: 24 },
    createdBy: { type: String, required: true, index: true },
    deletedAt: { type: Date, index: true },
  },
  {
    timestamps: true,
    versionKey: false,
    toJSON: {
      transform: (_doc, ret: Record<string, unknown>) => {
        ret.id = ret.campaignId || ret._id;
        delete ret._id;
        return ret;
      },
    },
  },
);

export const CallingCampaignModel: Model<CallingCampaignSchemaType> =
  model<CallingCampaignSchemaType>('CallingCampaign', callingCampaignSchema);

// ─── Queue Item ─────────────────────────────────────────────────────────────

export interface CallQueueItemSchemaType {
  queueId: string;
  campaignId: string;
  studentId: string;
  studentName: string;
  phone: string;
  email?: string;
  courseInterest: string;
  academicScore?: number;
  academicQualification?: string;
  preferredLanguage?: SupportedLanguage;
  priorityLevel: PriorityLevel;
  priorityScore: number;
  priorityReason: string;
  leadStage: LeadStage;
  status:
    | 'PENDING'
    | 'IN_PROGRESS'
    | 'COMPLETED'
    | 'CALLBACK_SCHEDULED'
    | 'ESCALATED'
    | 'CAMPUS_VISIT'
    | 'DNC'
    | 'UNREACHABLE'
    | 'FAILED';
  attempts: number;
  maxAttempts: number;
  lastCalledAt?: Date;
  nextCallbackAt?: Date;
  notes?: string;
  assignedCounselorId?: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
}

export type CallQueueItemDocument = HydratedDocument<CallQueueItemSchemaType>;

const callQueueItemSchema = new Schema<CallQueueItemSchemaType>(
  {
    queueId: { type: String, required: true, unique: true, index: true },
    campaignId: { type: String, required: true, index: true },
    studentId: { type: String, required: true, index: true },
    studentName: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true, index: true },
    email: { type: String, trim: true, lowercase: true },
    courseInterest: { type: String, required: true, trim: true },
    academicScore: { type: Number, min: 0, max: 100 },
    academicQualification: { type: String, trim: true },
    preferredLanguage: { type: String, default: 'English' },
    priorityLevel: {
      type: String,
      required: true,
      enum: ['URGENT', 'HIGH', 'MEDIUM', 'LOW'],
      default: 'MEDIUM',
      index: true,
    },
    priorityScore: { type: Number, required: true, default: 50, index: true },
    priorityReason: { type: String, required: true },
    leadStage: {
      type: String,
      required: true,
      enum: [
        'NEW',
        'CONTACTED',
        'INTERESTED',
        'HIGH_INTENT',
        'COUNSELLING_REQUIRED',
        'CAMPUS_VISIT_REQUESTED',
        'APPLICATION_STARTED',
        'APPLICATION_PENDING',
        'FOLLOW_UP_REQUIRED',
        'NOT_INTERESTED',
        'DNC',
        'UNREACHABLE',
      ],
      default: 'NEW',
      index: true,
    },
    status: {
      type: String,
      required: true,
      enum: [
        'PENDING',
        'IN_PROGRESS',
        'COMPLETED',
        'CALLBACK_SCHEDULED',
        'ESCALATED',
        'CAMPUS_VISIT',
        'DNC',
        'UNREACHABLE',
        'FAILED',
      ],
      default: 'PENDING',
      index: true,
    },
    attempts: { type: Number, required: true, default: 0 },
    maxAttempts: { type: Number, required: true, default: 3 },
    lastCalledAt: { type: Date },
    nextCallbackAt: { type: Date, index: true },
    notes: { type: String, trim: true },
    assignedCounselorId: { type: String, index: true },
    deletedAt: { type: Date, index: true },
  },
  {
    timestamps: true,
    versionKey: false,
    toJSON: {
      transform: (_doc, ret: Record<string, unknown>) => {
        ret.id = ret.queueId || ret._id;
        delete ret._id;
        return ret;
      },
    },
  },
);

callQueueItemSchema.index({ campaignId: 1, status: 1, priorityScore: -1 });

export const CallQueueItemModel: Model<CallQueueItemSchemaType> =
  model<CallQueueItemSchemaType>('CallQueueItem', callQueueItemSchema);

// ─── Call Record ────────────────────────────────────────────────────────────

export interface CallRecordSchemaType {
  callId: string;
  campaignId: string;
  queueItemId: string;
  studentId: string;
  studentName: string;
  phone: string;
  courseInterest: string;
  preferredLanguage: SupportedLanguage;
  detectedLanguage?: SupportedLanguage;
  languageChanges?: Array<{ from: SupportedLanguage; to: SupportedLanguage; at: Date }>;
  durationSeconds: number;
  status: 'COMPLETED' | 'FAILED' | 'ABANDONED';
  sentiment: CallSentiment;
  intent: CallIntent;
  admissionInterest: AdmissionInterestLevel;
  primaryConcern?: string;
  outcome: CallOutcome;
  recommendedAction: RecommendedActionType;
  actionReasoning: string;
  actionApprovalStatus: ActionApprovalStatus;
  approvedActionDetails?: {
    approvedBy?: string;
    approvedAt?: Date;
    scheduledCallback?: Date;
    assignedCounselorId?: string;
    campusVisitSlot?: {
      date: Date;
      timeSlot: string;
      notes?: string;
    };
    overrideNotes?: string;
  };
  transcript: Array<{
    id: string;
    speaker: 'agent' | 'student';
    text: string;
    timestamp: Date;
    language: SupportedLanguage;
    sentiment?: CallSentiment;
    intent?: CallIntent;
  }>;
  notes?: string;
  isSimulated: boolean;
  recordedBy: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
}

export type CallRecordDocument = HydratedDocument<CallRecordSchemaType>;

const callRecordSchema = new Schema<CallRecordSchemaType>(
  {
    callId: { type: String, required: true, unique: true, index: true },
    campaignId: { type: String, required: true, index: true },
    queueItemId: { type: String, required: true, index: true },
    studentId: { type: String, required: true, index: true },
    studentName: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true },
    courseInterest: { type: String, required: true, trim: true },
    preferredLanguage: { type: String, required: true, default: 'English' },
    detectedLanguage: { type: String },
    languageChanges: [
      {
        from: { type: String, required: true },
        to: { type: String, required: true },
        at: { type: Date, default: Date.now },
      },
    ],
    durationSeconds: { type: Number, required: true, default: 0 },
    status: {
      type: String,
      required: true,
      enum: ['COMPLETED', 'FAILED', 'ABANDONED'],
      default: 'COMPLETED',
      index: true,
    },
    sentiment: {
      type: String,
      required: true,
      enum: ['POSITIVE', 'NEUTRAL', 'CONCERNED', 'CONFUSED', 'FRUSTRATED', 'URGENT'],
      default: 'NEUTRAL',
      index: true,
    },
    intent: {
      type: String,
      required: true,
      enum: [
        'ADMISSION_INTEREST',
        'COURSE_ENQUIRY',
        'FEE_QUERY',
        'SCHOLARSHIP_QUERY',
        'ELIGIBILITY_QUERY',
        'HOSTEL_QUERY',
        'PLACEMENT_QUERY',
        'CAMPUS_VISIT',
        'APPLICATION_ASSISTANCE',
        'DOCUMENT_ASSISTANCE',
        'COUNSELOR_REQUEST',
        'CALLBACK_REQUEST',
        'CALL_LATER',
        'ALREADY_APPLIED',
        'NOT_INTERESTED',
        'OPT_OUT_DNC',
        'WRONG_NUMBER',
        'OTHER',
      ],
      default: 'ADMISSION_INTEREST',
      index: true,
    },
    admissionInterest: {
      type: String,
      required: true,
      enum: ['LOW', 'MEDIUM', 'HIGH'],
      default: 'MEDIUM',
      index: true,
    },
    primaryConcern: { type: String, trim: true },
    outcome: {
      type: String,
      required: true,
      enum: [
        'INTERESTED',
        'NOT_INTERESTED',
        'CALLBACK_REQUESTED',
        'CAMPUS_VISIT_SCHEDULED',
        'COUNSELOR_ESCALATED',
        'APPLICATION_INITIATED',
        'NO_ANSWER',
        'BUSY',
        'FAILED',
        'WRONG_NUMBER',
        'LANGUAGE_BARRIER',
        'OPTED_OUT_DNC',
      ],
      index: true,
    },
    recommendedAction: {
      type: String,
      required: true,
      enum: [
        'SCHEDULE_COUNSELOR_CALLBACK',
        'SCHEDULE_CAMPUS_VISIT',
        'SEND_COURSE_INFORMATION',
        'SEND_FEE_INFORMATION',
        'SEND_SCHOLARSHIP_INFORMATION',
        'SEND_APPLICATION_INFORMATION',
        'DOCUMENT_FOLLOWUP',
        'CALL_BACK_LATER',
        'ESCALATE_COUNSELOR',
        'MARK_NOT_INTERESTED',
        'MARK_DNC',
        'NO_ACTION',
      ],
      default: 'NO_ACTION',
    },
    actionReasoning: { type: String, default: '' },
    actionApprovalStatus: {
      type: String,
      required: true,
      enum: ['PENDING_APPROVAL', 'APPROVED', 'REJECTED', 'EXECUTED'],
      default: 'PENDING_APPROVAL',
      index: true,
    },
    approvedActionDetails: {
      approvedBy: { type: String },
      approvedAt: { type: Date },
      scheduledCallback: { type: Date },
      assignedCounselorId: { type: String },
      campusVisitSlot: {
        date: { type: Date },
        timeSlot: { type: String },
        notes: { type: String },
      },
      overrideNotes: { type: String },
    },
    transcript: [
      {
        id: { type: String, required: true },
        speaker: { type: String, required: true, enum: ['agent', 'student'] },
        text: { type: String, required: true },
        timestamp: { type: Date, required: true },
        language: { type: String, required: true },
        sentiment: { type: String },
        intent: { type: String },
      },
    ],
    notes: { type: String, trim: true },
    isSimulated: { type: Boolean, required: true, default: true },
    recordedBy: { type: String, required: true, index: true },
    deletedAt: { type: Date, index: true },
  },
  {
    timestamps: true,
    versionKey: false,
    toJSON: {
      transform: (_doc, ret: Record<string, unknown>) => {
        ret.id = ret.callId || ret._id;
        delete ret._id;
        return ret;
      },
    },
  },
);

export const CallRecordModel: Model<CallRecordSchemaType> =
  model<CallRecordSchemaType>('CallRecord', callRecordSchema);

// ─── Do Not Call (DNC) Registry ─────────────────────────────────────────────

export interface DoNotCallSchemaType {
  phone: string;
  studentId?: string;
  studentName?: string;
  reason?: string;
  requestedAt: Date;
  campaignId?: string;
  recordedBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export type DoNotCallDocument = HydratedDocument<DoNotCallSchemaType>;

const doNotCallSchema = new Schema<DoNotCallSchemaType>(
  {
    phone: { type: String, required: true, unique: true, trim: true, index: true },
    studentId: { type: String, trim: true },
    studentName: { type: String, trim: true },
    reason: { type: String, trim: true, default: 'Student requested opt-out during call' },
    requestedAt: { type: Date, required: true, default: Date.now },
    campaignId: { type: String, index: true },
    recordedBy: { type: String, required: true },
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

export const DoNotCallModel: Model<DoNotCallSchemaType> =
  model<DoNotCallSchemaType>('DoNotCall', doNotCallSchema);
