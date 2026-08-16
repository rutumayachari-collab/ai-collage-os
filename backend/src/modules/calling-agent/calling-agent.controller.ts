import type { Request, Response } from 'express';
import { HttpStatus } from '../../shared/constants';
import { asyncHandler, sendSuccess } from '../../shared/utils';
import { CallingAgentService, callingAgentService } from './calling-agent.service';
import {
  createCampaignSchema,
  validateCsvSchema,
  importStudentsSchema,
  startCallSessionSchema,
  interactTurnSchema,
  recordOutcomeSchema,
  approveActionSchema,
  createDncSchema,
  type CreateCampaignInput,
  type ValidateCsvInput,
  type ImportStudentsInput,
  type StartCallSessionInput,
  type InteractTurnInput,
  type RecordOutcomeInput,
  type ApproveActionInput,
  type CreateDncInput,
} from './calling-agent.validator';
import type { AuthenticatedRequest } from '../../shared/types';
import { NotFoundError, BadRequestError } from '../../shared/utils/api-error.util';

export class CallingAgentController {
  constructor(private readonly service: CallingAgentService) {}

  public validateCSV = asyncHandler(async (req: Request, res: Response) => {
    const input = validateCsvSchema.parse(req.body) as ValidateCsvInput;
    const report = await this.service.validateStudentCSV(input.rows, input.campaignId);
    sendSuccess(res, {
      message: 'Student CSV validated successfully',
      data: report,
    });
  });

  public createCampaign = asyncHandler(async (req: Request, res: Response) => {
    const input = createCampaignSchema.parse(req.body) as CreateCampaignInput;
    const user = (req as AuthenticatedRequest).user;
    const userId = user?.id || 'admin-user';
    const campaign = await this.service.createCampaign(input, userId);
    sendSuccess(res, {
      message: 'Admission outreach campaign created successfully',
      data: campaign,
      statusCode: HttpStatus.CREATED,
    });
  });

  public listCampaigns = asyncHandler(async (_req: Request, res: Response) => {
    const campaigns = await this.service.listCampaigns();
    sendSuccess(res, {
      message: 'Admission campaigns fetched',
      data: campaigns,
    });
  });

  public getCampaign = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const campaign = await this.service.getCampaign(id);
    if (!campaign) throw new NotFoundError('Campaign not found');
    sendSuccess(res, {
      message: 'Campaign details fetched',
      data: campaign,
    });
  });

  public startCampaign = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const campaign = await this.service.startCampaign(id);
    sendSuccess(res, {
      message: 'Campaign activated and outreach queue started',
      data: campaign,
    });
  });

  public pauseCampaign = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const campaign = await this.service.pauseCampaign(id);
    sendSuccess(res, {
      message: 'Campaign paused',
      data: campaign,
    });
  });

  public importStudents = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const input = importStudentsSchema.parse(req.body) as ImportStudentsInput;
    const result = await this.service.importStudents(id, input.students);
    sendSuccess(res, {
      message: `Successfully imported ${result.importedCount} student leads into the priority queue`,
      data: result,
      statusCode: HttpStatus.CREATED,
    });
  });

  public getQueue = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const status = req.query.status as string | undefined;
    const page = parseInt(req.query.page as string, 10) || 1;
    const limit = parseInt(req.query.limit as string, 10) || 50;

    const queue = await this.service.getQueue(id, status, page, limit);
    sendSuccess(res, {
      message: 'Smart priority queue fetched',
      data: queue,
    });
  });

  public getNextCall = asyncHandler(async (req: Request, res: Response) => {
    const { campaignId } = req.body as { campaignId?: string };
    if (!campaignId) throw new BadRequestError('campaignId is required');

    const item = await this.service.getNextCall(campaignId);
    if (!item) {
      sendSuccess(res, {
        message: 'No eligible pending calls currently in the priority queue',
        data: null,
      });
      return;
    }
    sendSuccess(res, {
      message: 'Next priority call locked for calling studio',
      data: item,
    });
  });

  public startCallSession = asyncHandler(async (req: Request, res: Response) => {
    const input = startCallSessionSchema.parse(req.body) as StartCallSessionInput;
    const session = await this.service.startCallSession(input);
    sendSuccess(res, {
      message: 'AI call session initialized (Simulation Demo Mode)',
      data: session,
      statusCode: HttpStatus.CREATED,
    });
  });

  public interactTurn = asyncHandler(async (req: Request, res: Response) => {
    const input = interactTurnSchema.parse(req.body) as InteractTurnInput;
    const result = await this.service.interactTurn(input);
    sendSuccess(res, {
      message: 'AI turn response generated',
      data: result,
    });
  });

  public recordOutcome = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const input = recordOutcomeSchema.parse(req.body) as RecordOutcomeInput;
    const user = (req as AuthenticatedRequest).user;
    const userId = user?.id || 'admin-user';

    const outcome = await this.service.recordOutcome(id, input, userId);
    sendSuccess(res, {
      message: 'Call outcome and conversation intelligence saved',
      data: outcome,
      statusCode: HttpStatus.CREATED,
    });
  });

  public approveAction = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const input = approveActionSchema.parse(req.body) as ApproveActionInput;
    const user = (req as AuthenticatedRequest).user;
    const userId = user?.id || 'admin-user';

    const record = await this.service.approveAction(id, input, userId);
    sendSuccess(res, {
      message: `Action ${input.action} has been ${input.approvalStatus.toLowerCase()}`,
      data: record,
    });
  });

  public getCallHistory = asyncHandler(async (req: Request, res: Response) => {
    const { campaignId } = req.query as { campaignId?: string };
    const page = parseInt(req.query.page as string, 10) || 1;
    const limit = parseInt(req.query.limit as string, 10) || 50;

    const history = await this.service.getCallHistory(campaignId, page, limit);
    sendSuccess(res, {
      message: 'Call history fetched',
      data: history,
    });
  });

  public getAnalytics = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const analytics = await this.service.getCampaignAnalytics(id);
    sendSuccess(res, {
      message: 'Campaign analytics fetched',
      data: analytics,
    });
  });

  public getCampaignAIInsights = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const insights = await this.service.getCampaignAIInsights(id);
    sendSuccess(res, {
      message: 'Campaign AI intelligence & top leads analysis fetched',
      data: insights,
    });
  });

  public getDncList = asyncHandler(async (req: Request, res: Response) => {
    const page = parseInt(req.query.page as string, 10) || 1;
    const limit = parseInt(req.query.limit as string, 10) || 50;
    const result = await this.service.getDncRegistry(page, limit);
    sendSuccess(res, {
      message: 'Do Not Call registry fetched',
      data: result,
    });
  });

  public addDnc = asyncHandler(async (req: Request, res: Response) => {
    const input = createDncSchema.parse(req.body) as CreateDncInput;
    const user = (req as AuthenticatedRequest).user;
    const userId = user?.id || 'admin-user';
    const dnc = await this.service.addToDnc(input.phone, input.reason, userId);
    sendSuccess(res, {
      message: 'Number added to Do Not Call registry',
      data: dnc,
      statusCode: HttpStatus.CREATED,
    });
  });
}

export const callingAgentController = new CallingAgentController(callingAgentService);
