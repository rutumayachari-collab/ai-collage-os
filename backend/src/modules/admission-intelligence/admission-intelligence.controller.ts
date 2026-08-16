import type { Request, Response } from 'express';
import { asyncHandler, sendSuccess } from '../../shared/utils';
import { admissionIntelligenceService, AdmissionIntelligenceService } from './admission-intelligence.service';
import { BadRequestError } from '../../shared/utils/api-error.util';
import type { AdmissionIntelligenceFilters } from './admission-intelligence.types';

export class AdmissionIntelligenceController {
  constructor(private readonly service: AdmissionIntelligenceService) {}

  public getOverview = asyncHandler(async (req: Request, res: Response) => {
    const campaignId = req.query.campaignId as string | undefined;
    const overview = await this.service.getOverview(campaignId);
    sendSuccess(res, {
      message: 'Admission intelligence overview fetched',
      data: overview,
    });
  });

  public getTopLeads = asyncHandler(async (req: Request, res: Response) => {
    const campaignId = req.query.campaignId as string | undefined;
    const limit = parseInt(req.query.limit as string, 10) || 20;
    const leads = await this.service.getTopLeads(campaignId, limit);
    sendSuccess(res, {
      message: 'Top admission leads fetched',
      data: leads,
    });
  });

  public getFollowUpQueue = asyncHandler(async (req: Request, res: Response) => {
    const campaignId = req.query.campaignId as string | undefined;
    const queue = await this.service.getFollowUpQueue(campaignId);
    sendSuccess(res, {
      message: 'Follow-up priority queue fetched',
      data: queue,
    });
  });

  public getStudentIntelligence = asyncHandler(async (req: Request, res: Response) => {
    const { studentId } = req.params;
    if (!studentId) throw new BadRequestError('studentId is required');
    const intelligence = await this.service.getStudentIntelligence(studentId);
    sendSuccess(res, {
      message: 'Student intelligence fetched',
      data: intelligence,
    });
  });

  public getCampaignInsights = asyncHandler(async (req: Request, res: Response) => {
    const { campaignId } = req.params;
    if (!campaignId) throw new BadRequestError('campaignId is required');
    const insights = await this.service.getCampaignInsights(campaignId);
    sendSuccess(res, {
      message: 'Campaign insights fetched',
      data: insights,
    });
  });

  public getCourseDemand = asyncHandler(async (req: Request, res: Response) => {
    const campaignId = req.query.campaignId as string | undefined;
    const demand = await this.service.getCourseDemand(campaignId);
    sendSuccess(res, {
      message: 'Course demand analysis fetched',
      data: demand,
    });
  });

  public getCommonQuestions = asyncHandler(async (req: Request, res: Response) => {
    const campaignId = req.query.campaignId as string | undefined;
    const questions = await this.service.getCommonQuestions(campaignId);
    sendSuccess(res, {
      message: 'Common questions analysis fetched',
      data: questions,
    });
  });

  public getCommonObjections = asyncHandler(async (req: Request, res: Response) => {
    const campaignId = req.query.campaignId as string | undefined;
    const objections = await this.service.getCommonObjections(campaignId);
    sendSuccess(res, {
      message: 'Common objections analysis fetched',
      data: objections,
    });
  });

  public getAICampaignSummary = asyncHandler(async (req: Request, res: Response) => {
    const campaignId = req.query.campaignId as string | undefined;
    const summary = await this.service.getAICampaignSummary(campaignId);
    if (!summary.available) {
      sendSuccess(res, {
        message: 'AI campaign analysis unavailable.',
        data: summary,
      });
      return;
    }
    sendSuccess(res, {
      message: 'AI campaign summary generated',
      data: summary,
    });
  });

  public getActionRecommendations = asyncHandler(async (req: Request, res: Response) => {
    const campaignId = req.query.campaignId as string | undefined;
    const recommendations = await this.service.getActionRecommendations(campaignId);
    sendSuccess(res, {
      message: 'Action recommendations fetched',
      data: recommendations,
    });
  });

  public getAdmissionFunnel = asyncHandler(async (req: Request, res: Response) => {
    const campaignId = req.query.campaignId as string | undefined;
    const funnel = await this.service.getAdmissionFunnel(campaignId);
    sendSuccess(res, {
      message: 'Admission funnel fetched',
      data: funnel,
    });
  });

  public globalSearch = asyncHandler(async (req: Request, res: Response) => {
    const { q } = req.query;
    if (!q || typeof q !== 'string') throw new BadRequestError('Search query is required');
    const filters: AdmissionIntelligenceFilters = {};
    const body = req.body as Record<string, unknown> | undefined;
    if (body?.campaignId) filters.campaignId = body.campaignId as string;
    if (body?.course) filters.course = body.course as string;
    if (body?.interest) filters.interest = body.interest as AdmissionIntelligenceFilters['interest'];
    if (body?.intent) filters.intent = body.intent as AdmissionIntelligenceFilters['intent'];
    if (body?.priority) filters.priority = body.priority as AdmissionIntelligenceFilters['priority'];
    if (body?.language) filters.language = body.language as AdmissionIntelligenceFilters['language'];
    if (body?.outcome) filters.outcome = body.outcome as AdmissionIntelligenceFilters['outcome'];
    if (body?.callback) filters.callback = body.callback as boolean;
    if (body?.dateFrom) filters.dateFrom = body.dateFrom as string;
    if (body?.dateTo) filters.dateTo = body.dateTo as string;
    const results = await this.service.globalSearch(q, filters);
    sendSuccess(res, {
      message: 'Global search completed',
      data: results,
    });
  });
}

export const admissionIntelligenceController = new AdmissionIntelligenceController(admissionIntelligenceService);
