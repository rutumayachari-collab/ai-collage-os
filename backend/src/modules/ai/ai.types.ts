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
  generatedAt: Date;
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
  generatedAt: Date;
};

export type AIRiskAnalysisInput = {
  applicantId: string;
  academicScore: number;
  attendancePercentage: number;
  previousDefaults: boolean;
};

export type AIRiskAnalysisOutput = {
  riskScore: number;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
  factors: string[];
  generatedAt: Date;
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
  generatedAt: Date;
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
  generatedAt: Date;
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
  generatedAt: Date;
};

export type AIWhatsAppDraftInput = {
  applicantId: string;
  applicantName: string;
  message: string;
};

export type AIWhatsAppDraftOutput = {
  draft: string;
  characterCount: number;
  generatedAt: Date;
};

export type AINextActionInput = {
  applicantId: string;
  currentStage: string;
  pendingActions: string[];
};

export type AINextActionOutput = {
  recommendedAction: string;
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  reasoning: string;
  generatedAt: Date;
};
