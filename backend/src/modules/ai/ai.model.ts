import { AISummaryInput, AISummaryOutput, AIEligibilityInput, AIEligibilityOutput, AIRiskAnalysisInput, AIRiskAnalysisOutput, AIScholarshipInput, AIScholarshipOutput, AICounselingNotesInput, AICounselingNotesOutput, AIAdmissionEmailInput, AIAdmissionEmailOutput, AIWhatsAppDraftInput, AIWhatsAppDraftOutput, AINextActionInput, AINextActionOutput } from './ai.types';

export class AiModel {
  public static async generateSummary(input: AISummaryInput): Promise<AISummaryOutput['summary']> {
    return `Applicant ${input.applicantName} has applied for ${input.courseInterest} with an academic score of ${input.academicScore}. Documents verified: ${input.documentsVerified ? 'Yes' : 'No'}.`;
  }

  public static async checkEligibility(input: AIEligibilityInput): Promise<Pick<AIEligibilityOutput, 'isEligible' | 'score' | 'reasons'>> {
    const score = input.academicScore >= 60 ? 85 : 45;
    const isEligible = input.documentsVerified && input.academicScore >= 60;
    const reasons = isEligible ? ['Academic score meets requirement', 'Documents verified'] : ['Academic score below threshold', 'Documents not verified'];
    return { isEligible, score, reasons };
  }

  public static async analyzeRisk(input: AIRiskAnalysisInput): Promise<Pick<AIRiskAnalysisOutput, 'riskScore' | 'riskLevel' | 'factors'>> {
    let riskScore = 0;
    const factors: string[] = [];

    if (input.academicScore < 60) {
      riskScore += 30;
      factors.push('Low academic score');
    }
    if (input.attendancePercentage < 75) {
      riskScore += 30;
      factors.push('Low attendance');
    }
    if (input.previousDefaults) {
      riskScore += 40;
      factors.push('Previous defaults');
    }

    const riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' = riskScore <= 30 ? 'LOW' : riskScore <= 60 ? 'MEDIUM' : 'HIGH';
    return { riskScore, riskLevel, factors };
  }

  public static async recommendScholarships(input: AIScholarshipInput): Promise<AIScholarshipOutput['recommendedScholarships']> {
    const scholarships = [
      { name: 'Merit Scholarship', amount: 50000, eligibility: input.academicScore >= 80 },
      { name: 'Need-based Scholarship', amount: 30000, eligibility: input.familyIncome < 500000 },
      { name: 'Sports Scholarship', amount: 25000, eligibility: false },
    ];
    return scholarships.filter(s => s.eligibility);
  }

  public static async generateCounselingNotes(input: AICounselingNotesInput): Promise<Pick<AICounselingNotesOutput, 'structuredNotes' | 'keyPoints' | 'nextSteps'>> {
    const keyPoints = input.counselingNotes.split('\n').filter((note) => note.trim().length > 0);
    return {
      structuredNotes: input.counselingNotes,
      keyPoints,
      nextSteps: ['Schedule follow-up', 'Send course details', 'Verify documents'],
    };
  }

  public static async generateAdmissionEmail(input: AIAdmissionEmailInput): Promise<Pick<AIAdmissionEmailOutput, 'subject' | 'body'>> {
    const subject = `Admission ${input.status} - ${input.courseName}`;
    const body = `Dear ${input.applicantName},\n\nYour admission status for ${input.courseName} is: ${input.status}.\n\nPlease contact us for more information.\n\nBest regards,\nAdmissions Team`;
    return { subject, body };
  }

  public static async generateWhatsAppDraft(input: AIWhatsAppDraftInput): Promise<Pick<AIWhatsAppDraftOutput, 'draft'>> {
    return { draft: `Hi ${input.applicantName}, ${input.message}` };
  }

  public static async recommendNextAction(input: AINextActionInput): Promise<Pick<AINextActionOutput, 'recommendedAction' | 'priority' | 'reasoning'>> {
    const actionMap: Record<string, { action: string; priority: 'HIGH' | 'MEDIUM' | 'LOW'; reasoning: string }> = {
      'NEW': { action: 'Contact applicant', priority: 'HIGH', reasoning: 'New inquiry requires immediate contact' },
      'CONTACTED': { action: 'Schedule counseling', priority: 'MEDIUM', reasoning: 'Initial contact made, next step is counseling' },
      'QUALIFIED': { action: 'Convert to applicant', priority: 'HIGH', reasoning: 'Applicant is qualified, ready for conversion' },
      'UNDER_REVIEW': { action: 'Review documents', priority: 'HIGH', reasoning: 'Application is under review, documents need verification' },
      'APPROVED': { action: 'Send admission letter', priority: 'HIGH', reasoning: 'Admission approved, notify applicant' },
    };

    const defaultAction = { action: 'Follow up', priority: 'MEDIUM' as const, reasoning: 'Regular follow-up required' };
    const selected = actionMap[input.currentStage] || defaultAction;
    return { recommendedAction: selected.action, priority: selected.priority, reasoning: selected.reasoning };
  }
}
