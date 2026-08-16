import type {
  SupportedLanguage,
  CallIntent,
  CallSentiment,
  AdmissionInterestLevel,
  RecommendedActionType,
  CallOutcome,
} from './calling-agent.types';

export type CallingProviderType = 'DEMO' | 'REAL_TELEPHONY';

export type CallState =
  | 'IDLE'
  | 'CONNECTING'
  | 'RINGING'
  | 'CONNECTED'
  | 'LISTENING'
  | 'THINKING'
  | 'SPEAKING'
  | 'COMPLETED'
  | 'FAILED';

export interface CallSessionInit {
  callId: string;
  campaignId: string;
  queueItemId: string;
  studentId: string;
  studentName: string;
  phone: string;
  courseInterest: string;
  academicScore?: number;
  academicQualification?: string;
  leadStage?: string;
  collegeName: string;
  campaignPurpose: string;
  preferredLanguage?: SupportedLanguage;
  previousNotes?: string;
}

export interface TranscriptTurn {
  id: string;
  speaker: 'agent' | 'student';
  text: string;
  timestamp: Date;
  language: SupportedLanguage;
  sentiment?: CallSentiment;
  intent?: CallIntent;
}

export interface CallTurnResult {
  agentResponse: string;
  language: SupportedLanguage;
  detectedLanguage?: SupportedLanguage;
  languageChanged: boolean;
  sentiment: CallSentiment;
  intent: CallIntent;
  admissionInterest: AdmissionInterestLevel;
  primaryConcern?: string;
  recommendedAction: RecommendedActionType;
  actionReasoning: string;
  suggestedOutcome: CallOutcome;
  shouldEndCall: boolean;
  confidence: number;
}

export interface CallingProvider {
  readonly providerType: CallingProviderType;
  readonly isSimulated: boolean;
  initiateCall(init: CallSessionInit): Promise<{
    sessionId: string;
    initialAgentGreeting: string;
    language: SupportedLanguage;
    callState: CallState;
    isSimulated: boolean;
    disclaimer: string;
  }>;
  processStudentTurn(
    session: CallSessionInit,
    transcriptHistory: TranscriptTurn[],
    studentUtterance: string,
    currentLanguage: SupportedLanguage,
  ): Promise<CallTurnResult>;
}
