import type {
  PriorityLevel,
  LeadStage,
  CallOutcome,
  CallIntent,
  CallSentiment,
  AdmissionInterestLevel,
  RecommendedActionType,
  ActionApprovalStatus,
  SupportedLanguage,
} from '../calling-agent/calling-agent.types';

export type { PriorityLevel } from '../calling-agent/calling-agent.types';

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
      speaker: 'agent' | 'student';
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
      speaker: 'agent' | 'student';
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
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
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
