export const SupportedLanguages = [
  "English",
  "Hindi",
  "Marathi",
  "Gujarati",
  "Bengali",
  "Tamil",
  "Telugu",
  "Kannada",
  "Malayalam",
  "Punjabi",
] as const;
export type SupportedLanguage = (typeof SupportedLanguages)[number];

export const LanguageNativeNames: Record<SupportedLanguage, string> = {
  English: "English",
  Hindi: "हिन्दी (Hindi)",
  Marathi: "मराठी (Marathi)",
  Gujarati: "ગુજરાતી (Gujarati)",
  Bengali: "বাংলা (Bengali)",
  Tamil: "தமிழ் (Tamil)",
  Telugu: "తెలుగు (Telugu)",
  Kannada: "ಕನ್ನಡ (Kannada)",
  Malayalam: "മലയാളം (Malayalam)",
  Punjabi: "ਪੰਜਾਬੀ (Punjabi)",
};

export type CallingCampaignStatus = "DRAFT" | "ACTIVE" | "PAUSED" | "COMPLETED" | "CANCELLED";

export type CallState =
  | "IDLE"
  | "CONNECTING"
  | "RINGING"
  | "CONNECTED"
  | "LISTENING"
  | "THINKING"
  | "SPEAKING"
  | "COMPLETED"
  | "FAILED";

export type PriorityLevel = "URGENT" | "HIGH" | "MEDIUM" | "LOW";

export type LeadStage =
  | "NEW"
  | "CONTACTED"
  | "INTERESTED"
  | "HIGH_INTENT"
  | "COUNSELLING_REQUIRED"
  | "CAMPUS_VISIT_REQUESTED"
  | "APPLICATION_STARTED"
  | "APPLICATION_PENDING"
  | "FOLLOW_UP_REQUIRED"
  | "NOT_INTERESTED"
  | "DNC"
  | "UNREACHABLE";

export type CallIntent =
  | "ADMISSION_INTEREST"
  | "COURSE_ENQUIRY"
  | "FEE_QUERY"
  | "SCHOLARSHIP_QUERY"
  | "ELIGIBILITY_QUERY"
  | "HOSTEL_QUERY"
  | "PLACEMENT_QUERY"
  | "CAMPUS_VISIT"
  | "APPLICATION_ASSISTANCE"
  | "DOCUMENT_ASSISTANCE"
  | "COUNSELOR_REQUEST"
  | "CALLBACK_REQUEST"
  | "CALL_LATER"
  | "ALREADY_APPLIED"
  | "NOT_INTERESTED"
  | "OPT_OUT_DNC"
  | "WRONG_NUMBER"
  | "OTHER";

export type CallSentiment =
  "POSITIVE" | "NEUTRAL" | "CONCERNED" | "CONFUSED" | "FRUSTRATED" | "URGENT";

export type AdmissionInterestLevel = "LOW" | "MEDIUM" | "HIGH";

export type CallOutcome =
  | "INTERESTED"
  | "NOT_INTERESTED"
  | "CALLBACK_REQUESTED"
  | "CAMPUS_VISIT_SCHEDULED"
  | "COUNSELOR_ESCALATED"
  | "APPLICATION_INITIATED"
  | "NO_ANSWER"
  | "BUSY"
  | "FAILED"
  | "WRONG_NUMBER"
  | "LANGUAGE_BARRIER"
  | "OPTED_OUT_DNC";

export type RecommendedActionType =
  | "SCHEDULE_COUNSELOR_CALLBACK"
  | "SCHEDULE_CAMPUS_VISIT"
  | "SEND_COURSE_INFORMATION"
  | "SEND_FEE_INFORMATION"
  | "SEND_SCHOLARSHIP_INFORMATION"
  | "SEND_APPLICATION_INFORMATION"
  | "DOCUMENT_FOLLOWUP"
  | "CALL_BACK_LATER"
  | "ESCALATE_COUNSELOR"
  | "MARK_NOT_INTERESTED"
  | "MARK_DNC"
  | "NO_ACTION";

export type ActionApprovalStatus = "PENDING_APPROVAL" | "APPROVED" | "REJECTED" | "EXECUTED";

export interface CallingCampaign {
  id: string;
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
  callingHours?: {
    start: string;
    end: string;
  };
  retryIntervalHours?: number;
  createdAt: Date | string;
  updatedAt?: Date | string;
}

export interface CallQueueItem {
  id: string;
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
    | "PENDING"
    | "IN_PROGRESS"
    | "COMPLETED"
    | "CALLBACK_SCHEDULED"
    | "ESCALATED"
    | "CAMPUS_VISIT"
    | "DNC"
    | "UNREACHABLE"
    | "FAILED";
  attempts: number;
  maxAttempts: number;
  lastCalledAt?: Date | string;
  nextCallbackAt?: Date | string;
  notes?: string;
  assignedCounselorId?: string;
  createdAt: Date | string;
}

export interface CallTranscript {
  id: string;
  speaker: "agent" | "student";
  text: string;
  timestamp: Date | string;
  language: SupportedLanguage;
  sentiment?: CallSentiment;
  intent?: CallIntent;
}

export interface CallOutcomeRecord {
  id: string;
  callId: string;
  campaignId: string;
  queueItemId: string;
  studentId: string;
  studentName: string;
  phone: string;
  courseInterest: string;
  preferredLanguage: SupportedLanguage;
  detectedLanguage?: SupportedLanguage;
  durationSeconds: number;
  status: "COMPLETED" | "FAILED" | "ABANDONED";
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
    approvedAt?: Date | string;
    scheduledCallback?: Date | string;
    assignedCounselorId?: string;
    campusVisitSlot?: {
      date: Date | string;
      timeSlot: string;
      notes?: string;
    };
    overrideNotes?: string;
  };
  transcript: CallTranscript[];
  notes?: string;
  isSimulated: boolean;
  recordedBy: string;
  createdAt: Date | string;
}

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

export interface TopAdmissionLead {
  callId: string;
  studentId: string;
  studentName: string;
  maskedPhone: string;
  courseInterest: string;
  admissionInterest: AdmissionInterestLevel;
  intent: CallIntent;
  outcome: CallOutcome;
  sentiment: CallSentiment;
  primaryConcern: string;
  recommendedAction: RecommendedActionType;
  rankScore: number;
  callDuration: number;
  timestamp: Date | string;
}

export interface CourseDemandStat {
  course: string;
  totalInquiries: number;
  percentage: number;
  highIntentCount: number;
  feeInquiries: number;
}

export interface CampaignAIInsights {
  campaignId: string;
  campaignName: string;
  totalLeads: number;
  completedCalls: number;
  topLeads: TopAdmissionLead[];
  courseDemand: CourseDemandStat[];
  topQuestions: Array<{ topic: string; count: number; percentage: number }>;
  topObjections: Array<{ objection: string; count: number }>;
  recommendations: Array<{
    priority: "HIGH" | "MEDIUM" | "LOW";
    insight: string;
    suggestedAction: string;
  }>;
  followUpPriorities: {
    URGENT: number;
    HIGH: number;
    MEDIUM: number;
    NORMAL: number;
  };
}

export interface DoNotCallItem {
  id?: string;
  phone: string;
  studentId?: string;
  studentName?: string;
  reason?: string;
  requestedAt: Date | string;
  campaignId?: string;
  recordedBy: string;
}
