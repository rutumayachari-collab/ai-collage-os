import type { AIProvider } from './ai.providers';
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
import { AIProviderFactory } from './ai.providers.impl';
import { env } from '../../config/env.config';
import { logger } from '../../shared/utils/logger.util';

export type ContextEnricher = (applicantId: string) => Promise<Record<string, unknown> | undefined>;

function createUnavailableProvider(originalError: unknown): AIProvider {
  return {
    name: 'UNAVAILABLE',
    isAvailable: false,
    async generateSummary() { throw originalError; },
    async checkEligibility() { throw originalError; },
    async analyzeRisk() { throw originalError; },
    async recommendScholarships() { throw originalError; },
    async generateCounselingNotes() { throw originalError; },
    async generateAdmissionEmail() { throw originalError; },
    async generateWhatsAppDraft() { throw originalError; },
    async recommendNextAction() { throw originalError; },
  };
}

let provider: AIProvider;
try {
  provider = AIProviderFactory.create({
    provider: env.AI_PROVIDER,
    model: env.AI_MODEL,
    apiKey: env.AI_API_KEY ?? '',
    baseURL: env.AI_BASE_URL,
    timeoutMs: env.AI_TIMEOUT_MS,
    maxRetries: env.AI_MAX_RETRIES,
  });
} catch (error) {
  const err = error instanceof Error ? error : new Error(String(error));
  logger.error('Failed to initialize AI provider', err);
  provider = createUnavailableProvider(err);
}

export class AIService {
  constructor(
    private readonly provider: AIProvider,
    private readonly enricher?: ContextEnricher,
  ) {}

  public async generateSummary(input: AISummaryInput): Promise<AISummaryOutput> {
    const context = await this.enrichContext(input.applicantId);
    return this.provider.generateSummary(input, context);
  }

  public async checkEligibility(input: AIEligibilityInput): Promise<AIEligibilityOutput> {
    const context = await this.enrichContext(input.applicantId);
    return this.provider.checkEligibility(input, context);
  }

  public async analyzeRisk(input: AIRiskAnalysisInput): Promise<AIRiskAnalysisOutput> {
    const context = await this.enrichContext(input.applicantId);
    return this.provider.analyzeRisk(input, context);
  }

  public async recommendScholarships(input: AIScholarshipInput): Promise<AIScholarshipOutput> {
    const context = await this.enrichContext(input.applicantId);
    return this.provider.recommendScholarships(input, context);
  }

  public async generateCounselingNotes(input: AICounselingNotesInput): Promise<AICounselingNotesOutput> {
    const context = await this.enrichContext(input.applicantId);
    return this.provider.generateCounselingNotes(input, context);
  }

  public async generateAdmissionEmail(input: AIAdmissionEmailInput): Promise<AIAdmissionEmailOutput> {
    const context = await this.enrichContext(input.applicantId);
    return this.provider.generateAdmissionEmail(input, context);
  }

  public async generateWhatsAppDraft(input: AIWhatsAppDraftInput): Promise<AIWhatsAppDraftOutput> {
    const context = await this.enrichContext(input.applicantId);
    return this.provider.generateWhatsAppDraft(input, context);
  }

  public async recommendNextAction(input: AINextActionInput): Promise<AINextActionOutput> {
    const context = await this.enrichContext(input.applicantId);
    return this.provider.recommendNextAction(input, context);
  }

  private async enrichContext(applicantId?: string): Promise<Record<string, unknown> | undefined> {
    if (!applicantId || !this.enricher) {
      return undefined;
    }
    try {
      return await this.enricher(applicantId);
    } catch (error) {
      logger.warn('Failed to enrich AI context', { applicantId, error });
      return undefined;
    }
  }
}

export const aiService = new AIService(provider);

export function createAIService(enricher?: ContextEnricher): AIService {
  return new AIService(provider, enricher);
}
