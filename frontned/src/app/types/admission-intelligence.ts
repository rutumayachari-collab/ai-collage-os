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
export type SupportedLanguage =
  | "English"
  | "Hindi"
  | "Marathi"
  | "Gujarati"
  | "Bengali"
  | "Tamil"
  | "Telugu"
  | "Kannada"
  | "Malayalam"
  | "Punjabi";

export interface AdmissionIntelligenceOverview {
  totalProspects: number;
  contacted: number;
  interested: number;
  highIntent: number;
  callbacks: number;
  counselorRequests: number;
  campusVisits: number;
  applicationInterest: number;
  notInterested: number;
  dnc: number;
  contactRate: number;
  interestRate: number;
  highIntentRate: number;
  callbackRate: number;
  counselorEscalationRate: number;
}

export interface AdmissionIntelligenceLead {
  callId: string;
  studentId: string;
  studentName: string;
  maskedPhone: string;
  courseInterest: string;
  admissionInterest: AdmissionInterestLevel;
  intent: CallIntent;
  sentiment: CallSentiment;
  outcome: CallOutcome;
  lastCall: string;
  attemptCount: number;
  nextAction: RecommendedActionType;
  callbackTime?: string;
  priority: PriorityLevel;
  primaryConcern?: string;
  recommendedAction: RecommendedActionType;
  rankScore: number;
}

export interface FollowUpItem {
  studentId: string;
  studentName: string;
  maskedPhone: string;
  courseInterest: string;
  priority: PriorityLevel;
  reason: string;
  callbackTime?: string;
  leadStage: LeadStage;
  lastCall?: string;
  attemptCount: number;
  outcome?: CallOutcome;
  recommendedAction: RecommendedActionType;
}

export interface StudentIntelligence {
  studentId: string;
  studentName: string;
  phone: string;
  email?: string;
  courseInterest: string;
  preferredLanguage: SupportedLanguage;
  leadSource?: string;
  academicQualification?: string;
  academicScore?: number;
  callHistory: Array<{
    callId: string;
    campaignId: string;
    timestamp: string;
    durationSeconds: number;
    outcome: CallOutcome;
    sentiment: CallSentiment;
    intent: CallIntent;
    admissionInterest: AdmissionInterestLevel;
    primaryConcern?: string;
    recommendedAction: RecommendedActionType;
    actionApprovalStatus: ActionApprovalStatus;
    transcript: Array<{
      speaker: "agent" | "student";
      text: string;
      timestamp: string;
      language: SupportedLanguage;
      sentiment?: CallSentiment;
      intent?: CallIntent;
    }>;
  }>;
  latestCall?: {
    callId: string;
    campaignId: string;
    timestamp: string;
    durationSeconds: number;
    sentiment: CallSentiment;
    intent: CallIntent;
    admissionInterest: AdmissionInterestLevel;
    outcome: CallOutcome;
    primaryConcern?: string;
    recommendedAction: RecommendedActionType;
    actionApprovalStatus: ActionApprovalStatus;
    notes?: string;
    transcript: Array<{
      speaker: "agent" | "student";
      text: string;
      timestamp: string;
      language: SupportedLanguage;
      sentiment?: CallSentiment;
      intent?: CallIntent;
    }>;
  };
  aiSummary?: string;
  nextAction?: string;
  timeline: Array<{
    stage: string;
    timestamp?: string;
    details: string;
  }>;
}

export interface CampaignInsights {
  campaignId: string;
  campaignName: string;
  students: number;
  calls: number;
  successfulCalls: number;
  noAnswer: number;
  interested: number;
  highIntent: number;
  callbacks: number;
  counselorRequests: number;
  campusVisits: number;
  applicationsInterest: number;
  notInterested: number;
  dnc: number;
  contactRate: number;
  interestRate: number;
  highIntentRate: number;
  callbackRate: number;
  counselorEscalationRate: number;
}

export interface CourseDemandStat {
  course: string;
  interested: number;
  highIntent: number;
  percentage: number;
}

export interface CommonQuestion {
  topic: string;
  count: number;
  percentage: number;
}

export interface CommonObjection {
  objection: string;
  count: number;
}

export interface AICampaignSummary {
  summary: string;
  generatedAt: string;
  available: boolean;
}

export interface ActionRecommendation {
  priority: "HIGH" | "MEDIUM" | "LOW";
  insight: string;
  suggestedAction: string;
}

export interface AdmissionFunnelStage {
  stage: string;
  count: number;
  percentage: number;
  color: string;
}

export interface GlobalSearchResult {
  studentId: string;
  studentName: string;
  maskedPhone: string;
  courseInterest: string;
  intent: CallIntent;
  outcome: CallOutcome;
  admissionInterest: AdmissionInterestLevel;
  priority: PriorityLevel;
  campaignId: string;
  campaignName: string;
}

export interface AdmissionIntelligenceFilters {
  campaignId?: string;
  course?: string;
  interest?: AdmissionInterestLevel;
  intent?: CallIntent;
  priority?: PriorityLevel;
  language?: SupportedLanguage;
  outcome?: CallOutcome;
  callback?: boolean;
  dateFrom?: string;
  dateTo?: string;
  search?: string;
}
