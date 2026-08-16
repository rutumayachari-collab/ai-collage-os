export const SupportedLanguages = [
  'English',
  'Hindi',
  'Marathi',
  'Gujarati',
  'Bengali',
  'Tamil',
  'Telugu',
  'Kannada',
  'Malayalam',
  'Punjabi',
] as const;
export type SupportedLanguage = (typeof SupportedLanguages)[number];

export const LanguageCodeMap: Record<SupportedLanguage, string> = {
  English: 'en',
  Hindi: 'hi',
  Marathi: 'mr',
  Gujarati: 'gu',
  Bengali: 'bn',
  Tamil: 'ta',
  Telugu: 'te',
  Kannada: 'kn',
  Malayalam: 'ml',
  Punjabi: 'pa',
};

export const CallingCampaignStatuses = ['DRAFT', 'ACTIVE', 'PAUSED', 'COMPLETED', 'CANCELLED'] as const;
export type CallingCampaignStatus = (typeof CallingCampaignStatuses)[number];

export const CallIntents = [
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
] as const;
export type CallIntent = (typeof CallIntents)[number];

export const CallSentiments = ['POSITIVE', 'NEUTRAL', 'CONCERNED', 'CONFUSED', 'FRUSTRATED', 'URGENT'] as const;
export type CallSentiment = (typeof CallSentiments)[number];

export const AdmissionInterestLevels = ['LOW', 'MEDIUM', 'HIGH'] as const;
export type AdmissionInterestLevel = (typeof AdmissionInterestLevels)[number];

export const LeadStages = [
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
] as const;
export type LeadStage = (typeof LeadStages)[number];

export const PriorityLevels = ['URGENT', 'HIGH', 'MEDIUM', 'LOW'] as const;
export type PriorityLevel = (typeof PriorityLevels)[number];

export const CallOutcomes = [
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
] as const;
export type CallOutcome = (typeof CallOutcomes)[number];

export const RecommendedActionTypes = [
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
] as const;
export type RecommendedActionType = (typeof RecommendedActionTypes)[number];

export const ActionApprovalStatuses = ['PENDING_APPROVAL', 'APPROVED', 'REJECTED', 'EXECUTED'] as const;
export type ActionApprovalStatus = (typeof ActionApprovalStatuses)[number];

export const CampaignPurposes = [
  'New admission outreach',
  'B.Tech admission campaign',
  'Course promotion',
  'Application follow-up',
  'Admission enquiry follow-up',
  'Scholarship awareness',
  'Campus visit invitation',
  'Counselling invitation',
  'Application assistance',
  'Document assistance',
  'Fee information',
  'Placement information',
  'Hostel information',
  'General admission enquiry',
] as const;
export type CampaignPurpose = (typeof CampaignPurposes)[number] | (string & {});

export interface StudentLeadInput {
  studentId?: string;
  name: string;
  phone: string;
  email?: string;
  courseInterest: string;
  academicQualification?: string;
  academicScore?: number;
  admissionStage?: LeadStage;
  leadSource?: string;
  preferredLanguage?: SupportedLanguage;
  previousInteraction?: string;
  callbackPreference?: string;
  notes?: string;
}

export interface CSVValidationRow {
  rowNumber: number;
  raw: Record<string, string>;
  student: StudentLeadInput;
  isValid: boolean;
  isDuplicate: boolean;
  isDncSuppressed: boolean;
  errors: string[];
  calculatedPriority: PriorityLevel;
  priorityScore: number;
  priorityReason: string;
}

export interface CSVValidationReport {
  totalRows: number;
  validRowsCount: number;
  invalidRowsCount: number;
  duplicateRowsCount: number;
  dncSuppressedCount: number;
  rows: CSVValidationRow[];
}

export interface CallingCampaignInput {
  name: string;
  collegeName: string;
  purpose: string;
  targetCourse?: string;
  defaultLanguage?: SupportedLanguage;
  maxAttempts?: number;
  callingHours?: { start: string; end: string };
  retryIntervalHours?: number;
  studentLeads?: StudentLeadInput[];
}

export interface CallQueueItemInput {
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
  leadStage?: LeadStage;
  notes?: string;
  assignedCounselorId?: string;
}

export interface CallOutcomeInput {
  queueItemId: string;
  outcome: CallOutcome;
  sentiment: CallSentiment;
  intent: CallIntent;
  admissionInterest: AdmissionInterestLevel;
  primaryConcern?: string;
  notes: string;
  recommendedAction: RecommendedActionType;
  actionReasoning: string;
  callbackTime?: Date;
  campusVisitSlot?: {
    date: Date;
    timeSlot: string;
    notes?: string;
  };
  counselorHandoff?: {
    counselorId?: string;
    counselorRole?: string;
    escalationReason: string;
  };
  durationSeconds: number;
  transcript: Array<{
    id?: string;
    speaker: 'agent' | 'student';
    text: string;
    timestamp: Date;
    language: SupportedLanguage;
    sentiment?: CallSentiment;
    intent?: CallIntent;
  }>;
  preferredLanguage?: SupportedLanguage;
  detectedLanguage?: SupportedLanguage;
  languageChanges?: Array<{ from: SupportedLanguage; to: SupportedLanguage; at: Date }>;
}

export interface ActionApprovalInput {
  action: RecommendedActionType;
  approvalStatus: 'APPROVED' | 'REJECTED';
  counselorId?: string;
  scheduledTime?: Date;
  campusVisitDetails?: {
    date: Date;
    timeSlot: string;
    notes?: string;
  };
  overrideNotes?: string;
}

export interface DoNotCallRecord {
  phone: string;
  studentId?: string;
  studentName?: string;
  reason?: string;
  requestedAt: Date;
  campaignId?: string;
  recordedBy: string;
}

export interface CallAnalytics {
  campaignId: string;
  totalLeads: number;
  callsAttempted: number;
  callsCompleted: number;
  pendingCalls: number;
  interestedCount: number;
  highIntentCount: number;
  callbacksScheduled: number;
  counselorEscalations: number;
  campusVisitsRequested: number;
  applicationsInitiated: number;
  notInterestedCount: number;
  dncCount: number;
  unreachableCount: number;
  averageDurationSeconds: number;
  interestRate: number;
  conversionFunnel: {
    contacted: number;
    interested: number;
    counselling: number;
    campusVisit: number;
    applicationStarted: number;
  };
  sentimentBreakdown: Record<CallSentiment, number>;
  intentBreakdown: Record<string, number>;
  languageDistribution: Record<SupportedLanguage, number>;
  outcomeBreakdown: Record<CallOutcome, number>;
  priorityBreakdown: Record<PriorityLevel, number>;
}
