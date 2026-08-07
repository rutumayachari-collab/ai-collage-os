import { AiModel } from './ai.model';
import type { AISummaryInput, AISummaryOutput, AIEligibilityInput, AIEligibilityOutput, AIRiskAnalysisInput, AIRiskAnalysisOutput, AIScholarshipInput, AIScholarshipOutput, AICounselingNotesInput, AICounselingNotesOutput, AIAdmissionEmailInput, AIAdmissionEmailOutput, AIWhatsAppDraftInput, AIWhatsAppDraftOutput, AINextActionInput, AINextActionOutput } from './ai.types';

export class AIService {
  public async generateSummary(input: AISummaryInput): Promise<AISummaryOutput> {
    const summary = await AiModel.generateSummary(input);
    return {
      summary,
      confidence: 0.85,
      generatedAt: new Date(),
    };
  }

  public async checkEligibility(input: AIEligibilityInput): Promise<AIEligibilityOutput> {
    const result = await AiModel.checkEligibility(input);
    return {
      ...result,
      generatedAt: new Date(),
    };
  }

  public async analyzeRisk(input: AIRiskAnalysisInput): Promise<AIRiskAnalysisOutput> {
    const result = await AiModel.analyzeRisk(input);
    return {
      ...result,
      generatedAt: new Date(),
    };
  }

  public async recommendScholarships(input: AIScholarshipInput): Promise<AIScholarshipOutput> {
    const recommendedScholarships = await AiModel.recommendScholarships(input);
    return {
      recommendedScholarships,
      generatedAt: new Date(),
    };
  }

  public async generateCounselingNotes(input: AICounselingNotesInput): Promise<AICounselingNotesOutput> {
    const result = await AiModel.generateCounselingNotes(input);
    return {
      ...result,
      generatedAt: new Date(),
    };
  }

  public async generateAdmissionEmail(input: AIAdmissionEmailInput): Promise<AIAdmissionEmailOutput> {
    const result = await AiModel.generateAdmissionEmail(input);
    return {
      ...result,
      generatedAt: new Date(),
    };
  }

  public async generateWhatsAppDraft(input: AIWhatsAppDraftInput): Promise<AIWhatsAppDraftOutput> {
    const { draft } = await AiModel.generateWhatsAppDraft(input);
    return {
      draft,
      characterCount: draft.length,
      generatedAt: new Date(),
    };
  }

  public async recommendNextAction(input: AINextActionInput): Promise<AINextActionOutput> {
    const result = await AiModel.recommendNextAction(input);
    return {
      ...result,
      generatedAt: new Date(),
    };
  }
}

export const aiService = new AIService();
