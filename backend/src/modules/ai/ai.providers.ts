import type {
  AISummaryInput,
  AISummaryOutput,
  AIEligibilityInput,
  AIEligibilityOutput,
  AIRiskAnalysisInput,
  AIRiskAnalysisOutput,
  AIScholarshipInput,
  AIScholarshipOutput,
  AICounselingNotesInput,
  AICounselingNotesOutput,
  AIAdmissionEmailInput,
  AIAdmissionEmailOutput,
  AIWhatsAppDraftInput,
  AIWhatsAppDraftOutput,
  AINextActionInput,
  AINextActionOutput,
} from './ai.types';

export type AIProviderName = 'OPENAI' | 'ANTHROPIC' | 'AZURE_OPENAI' | 'MOCK';

export interface AIProviderConfig {
  provider: AIProviderName;
  model: string;
  apiKey: string;
  baseURL?: string;
  timeoutMs: number;
  maxRetries: number;
}

export interface AIProvider {
  readonly name: string;
  readonly isAvailable: boolean;
  generateSummary(input: AISummaryInput, context?: Record<string, unknown>): Promise<AISummaryOutput>;
  checkEligibility(input: AIEligibilityInput, context?: Record<string, unknown>): Promise<AIEligibilityOutput>;
  analyzeRisk(input: AIRiskAnalysisInput, context?: Record<string, unknown>): Promise<AIRiskAnalysisOutput>;
  recommendScholarships(input: AIScholarshipInput, context?: Record<string, unknown>): Promise<AIScholarshipOutput>;
  generateCounselingNotes(input: AICounselingNotesInput, context?: Record<string, unknown>): Promise<AICounselingNotesOutput>;
  generateAdmissionEmail(input: AIAdmissionEmailInput, context?: Record<string, unknown>): Promise<AIAdmissionEmailOutput>;
  generateWhatsAppDraft(input: AIWhatsAppDraftInput, context?: Record<string, unknown>): Promise<AIWhatsAppDraftOutput>;
  recommendNextAction(input: AINextActionInput, context?: Record<string, unknown>): Promise<AINextActionOutput>;
}
