import type { Request, Response } from 'express';
import { asyncHandler, sendSuccess } from '../../shared/utils';
import { aiService } from './ai.service';
import type { AISummaryInput, AIEligibilityInput, AIRiskAnalysisInput, AIScholarshipInput, AICounselingNotesInput, AIAdmissionEmailInput, AIWhatsAppDraftInput, AINextActionInput } from './ai.types';

export class AIController {
  public generateSummary = asyncHandler(async (req: Request, res: Response) => {
    const input = req.body as AISummaryInput;
    const result = await aiService.generateSummary(input);
    sendSuccess(res, { message: 'AI summary generated', data: result });
  });

  public checkEligibility = asyncHandler(async (req: Request, res: Response) => {
    const input = req.body as AIEligibilityInput;
    const result = await aiService.checkEligibility(input);
    sendSuccess(res, { message: 'Eligibility checked', data: result });
  });

  public analyzeRisk = asyncHandler(async (req: Request, res: Response) => {
    const input = req.body as AIRiskAnalysisInput;
    const result = await aiService.analyzeRisk(input);
    sendSuccess(res, { message: 'Risk analysis completed', data: result });
  });

  public recommendScholarships = asyncHandler(async (req: Request, res: Response) => {
    const input = req.body as AIScholarshipInput;
    const result = await aiService.recommendScholarships(input);
    sendSuccess(res, { message: 'Scholarship recommendations generated', data: result });
  });

  public generateCounselingNotes = asyncHandler(async (req: Request, res: Response) => {
    const input = req.body as AICounselingNotesInput;
    const result = await aiService.generateCounselingNotes(input);
    sendSuccess(res, { message: 'Counseling notes generated', data: result });
  });

  public generateAdmissionEmail = asyncHandler(async (req: Request, res: Response) => {
    const input = req.body as AIAdmissionEmailInput;
    const result = await aiService.generateAdmissionEmail(input);
    sendSuccess(res, { message: 'Admission email generated', data: result });
  });

  public generateWhatsAppDraft = asyncHandler(async (req: Request, res: Response) => {
    const input = req.body as AIWhatsAppDraftInput;
    const result = await aiService.generateWhatsAppDraft(input);
    sendSuccess(res, { message: 'WhatsApp draft generated', data: result });
  });

  public recommendNextAction = asyncHandler(async (req: Request, res: Response) => {
    const input = req.body as AINextActionInput;
    const result = await aiService.recommendNextAction(input);
    sendSuccess(res, { message: 'Next action recommended', data: result });
  });
}

export const aiController = new AIController();
