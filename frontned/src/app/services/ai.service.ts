import { BaseService } from "./base.service";
import { API_ENDPOINTS } from "../constants";

export type AISummaryInput = {
  applicantId: string;
  applicantName: string;
  courseInterest: string;
  academicScore: number;
  documentsVerified: boolean;
};

export type AISummaryOutput = {
  summary: string;
  confidence: number;
  generatedAt: string;
};

export type AIEligibilityInput = {
  applicantId: string;
  courseId: string;
  academicScore: number;
  documentsVerified: boolean;
};

export type AIEligibilityOutput = {
  isEligible: boolean;
  score: number;
  reasons: string[];
  generatedAt: string;
};

export type AIRiskAnalysisInput = {
  applicantId: string;
  academicScore: number;
  attendancePercentage: number;
  previousDefaults: boolean;
};

export type AIRiskAnalysisOutput = {
  riskScore: number;
  riskLevel: "LOW" | "MEDIUM" | "HIGH";
  factors: string[];
  generatedAt: string;
};

export type AIScholarshipInput = {
  applicantId: string;
  academicScore: number;
  familyIncome: number;
  category: string;
};

export type AIScholarshipOutput = {
  recommendedScholarships: Array<{
    name: string;
    amount: number;
    eligibility: boolean;
  }>;
  generatedAt: string;
};

export type AICounselingNotesInput = {
  applicantId: string;
  counselingNotes: string;
  previousInteractions: string[];
};

export type AICounselingNotesOutput = {
  structuredNotes: string;
  keyPoints: string[];
  nextSteps: string[];
  generatedAt: string;
};

export type AIAdmissionEmailInput = {
  applicantId: string;
  applicantName: string;
  courseName: string;
  status: string;
};

export type AIAdmissionEmailOutput = {
  subject: string;
  body: string;
  generatedAt: string;
};

export type AIWhatsAppDraftInput = {
  applicantId: string;
  applicantName: string;
  message: string;
};

export type AIWhatsAppDraftOutput = {
  draft: string;
  characterCount: number;
  generatedAt: string;
};

export type AINextActionInput = {
  applicantId: string;
  currentStage: string;
  pendingActions: string[];
};

export type AINextActionOutput = {
  recommendedAction: string;
  priority: "HIGH" | "MEDIUM" | "LOW";
  reasoning: string;
  generatedAt: string;
};

export class AIService extends BaseService {
  async generateSummary(input: AISummaryInput): Promise<AISummaryOutput> {
    return this.post<AISummaryOutput>(`${API_ENDPOINTS.AI}/summary`, input);
  }

  async checkEligibility(input: AIEligibilityInput): Promise<AIEligibilityOutput> {
    return this.post<AIEligibilityOutput>(`${API_ENDPOINTS.AI}/eligibility`, input);
  }

  async analyzeRisk(input: AIRiskAnalysisInput): Promise<AIRiskAnalysisOutput> {
    return this.post<AIRiskAnalysisOutput>(`${API_ENDPOINTS.AI}/risk-analysis`, input);
  }

  async recommendScholarships(input: AIScholarshipInput): Promise<AIScholarshipOutput> {
    return this.post<AIScholarshipOutput>(`${API_ENDPOINTS.AI}/scholarship-recommendation`, input);
  }

  async generateCounselingNotes(input: AICounselingNotesInput): Promise<AICounselingNotesOutput> {
    return this.post<AICounselingNotesOutput>(`${API_ENDPOINTS.AI}/counseling-notes`, input);
  }

  async generateAdmissionEmail(input: AIAdmissionEmailInput): Promise<AIAdmissionEmailOutput> {
    return this.post<AIAdmissionEmailOutput>(`${API_ENDPOINTS.AI}/admission-email`, input);
  }

  async generateWhatsAppDraft(input: AIWhatsAppDraftInput): Promise<AIWhatsAppDraftOutput> {
    return this.post<AIWhatsAppDraftOutput>(`${API_ENDPOINTS.AI}/whatsapp-draft`, input);
  }

  async recommendNextAction(input: AINextActionInput): Promise<AINextActionOutput> {
    return this.post<AINextActionOutput>(`${API_ENDPOINTS.AI}/next-action`, input);
  }
}

export const aiService = new AIService();
