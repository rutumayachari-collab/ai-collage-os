import { BadRequestError, NotFoundError } from '../../shared/utils/api-error.util';
import { OrchestratorWorkflowModel } from './orchestrator.model';
import type { CreateWorkflowInput, OrchestratorWorkflow, WorkflowAction } from './orchestrator.types';

const generateId = (prefix: string) => `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;

class OrchestratorService {
  public async createWorkflow(input: CreateWorkflowInput): Promise<OrchestratorWorkflow> {
    const workflow: OrchestratorWorkflow = {
      id: generateId('WF'),
      studentId: input.studentId,
      studentName: input.studentName,
      actions: input.actions.map((action, index) => ({
        id: generateId('ACT'),
        type: action.type,
        title: action.title,
        description: action.description,
        status: index === 0 ? 'PENDING' : 'PENDING',
      })),
      currentStep: 0,
      status: 'ACTIVE',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const saved = await OrchestratorWorkflowModel.create(workflow);
    return saved.toObject() as OrchestratorWorkflow;
  }

  public async listWorkflows(): Promise<OrchestratorWorkflow[]> {
    const workflows = await OrchestratorWorkflowModel.find({}).sort({ createdAt: -1 }).lean<OrchestratorWorkflow[]>();
    return workflows;
  }

  public async getWorkflow(id: string): Promise<OrchestratorWorkflow | null> {
    const workflow = await OrchestratorWorkflowModel.findOne({ id }).lean<OrchestratorWorkflow | null>();
    return workflow ?? null;
  }

  public async executeAction(workflowId: string, actionId: string): Promise<OrchestratorWorkflow> {
    const workflow = await OrchestratorWorkflowModel.findOne({ id: workflowId }).lean<OrchestratorWorkflow | null>();
    if (!workflow) throw new NotFoundError('Workflow not found');

    const actionIndex = workflow.actions.findIndex((action) => action.id === actionId);
    if (actionIndex === -1) throw new NotFoundError('Action not found');
    if (actionIndex !== workflow.currentStep) throw new BadRequestError('Invalid action sequence');

    const updatedActions = [...workflow.actions];
    updatedActions[actionIndex] = {
      ...updatedActions[actionIndex],
      status: 'COMPLETED',
      completedAt: new Date(),
    };

    const nextStep = actionIndex + 1 < workflow.actions.length ? actionIndex + 1 : actionIndex;
    const updated = {
      ...workflow,
      actions: updatedActions,
      currentStep: nextStep,
      status: nextStep >= workflow.actions.length - 1 ? 'COMPLETED' : 'ACTIVE',
      updatedAt: new Date(),
    };

    const saved = await OrchestratorWorkflowModel.findOneAndUpdate({ id: workflowId }, { $set: updated }, { new: true, runValidators: true });
    if (!saved) throw new NotFoundError('Workflow not found');
    return saved.toObject() as OrchestratorWorkflow;
  }

  public async getHistory(workflowId: string): Promise<WorkflowAction[]> {
    const workflow = await OrchestratorWorkflowModel.findOne({ id: workflowId }).lean<OrchestratorWorkflow | null>();
    if (!workflow) throw new NotFoundError('Workflow not found');
    return workflow.actions.filter((action) => action.status === 'COMPLETED');
  }

  public async escalate(workflowId: string): Promise<OrchestratorWorkflow> {
    const updated = await OrchestratorWorkflowModel.findOneAndUpdate(
      { id: workflowId },
      { $set: { status: 'FAILED', updatedAt: new Date() } },
      { new: true, runValidators: true },
    );

    if (!updated) throw new NotFoundError('Workflow not found');
    return updated.toObject() as OrchestratorWorkflow;
  }
}

export const orchestratorService = new OrchestratorService();
