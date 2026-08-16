import type { Request, Response } from "express";
import { HttpStatus } from "../../shared/constants";
import { asyncHandler, sendSuccess } from "../../shared/utils";
import { orchestratorService } from "./orchestrator.service";
import {
  createWorkflowSchema,
  executeActionSchema,
  type CreateWorkflowInput,
  type ExecuteActionInput,
} from "./orchestrator.validator";
import type { AuthenticatedRequest } from "../../shared/types";
import { NotFoundError, UnauthorizedError } from "../../shared/utils/api-error.util";

export class OrchestratorController {
  constructor(private readonly service: typeof orchestratorService) {}

  public listWorkflows = asyncHandler(async (_req: Request, res: Response) => {
    const workflows = await this.service.listWorkflows();
    sendSuccess(res, { message: "Workflows fetched", data: workflows });
  });

  public getWorkflow = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const workflow = await this.service.getWorkflow(id);
    if (!workflow) throw new NotFoundError("Workflow not found");
    sendSuccess(res, { message: "Workflow fetched", data: workflow });
  });

  public createWorkflow = asyncHandler(async (req: Request, res: Response) => {
    const input = createWorkflowSchema.parse(req.body) as CreateWorkflowInput;
    const user = (req as AuthenticatedRequest).user;
    if (!user) throw new UnauthorizedError("Authentication required");
    const workflow = await this.service.createWorkflow(input);
    sendSuccess(res, { message: "Workflow created", data: workflow, statusCode: HttpStatus.CREATED });
  });

  public executeAction = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const input = executeActionSchema.parse(req.body) as ExecuteActionInput;
    const workflow = await this.service.executeAction(id, input.actionId);
    sendSuccess(res, { message: "Action executed", data: workflow });
  });

  public getHistory = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const history = await this.service.getHistory(id);
    sendSuccess(res, { message: "History fetched", data: history });
  });

  public escalate = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const workflow = await this.service.escalate(id);
    sendSuccess(res, { message: "Workflow escalated", data: workflow });
  });
}

export const orchestratorController = new OrchestratorController(orchestratorService);
