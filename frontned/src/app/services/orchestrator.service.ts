import { BaseService } from "./base.service";
import { API_ENDPOINTS } from "../constants";
import type {
  OrchestratorWorkflow,
  CreateWorkflowInput,
  ExecuteActionInput,
  WorkflowAction,
} from "../types/orchestrator";

export class OrchestratorService extends BaseService {
  async listWorkflows(): Promise<OrchestratorWorkflow[]> {
    return this.get<OrchestratorWorkflow[]>(API_ENDPOINTS.ORCHESTRATOR.WORKFLOWS);
  }

  async getWorkflow(id: string): Promise<OrchestratorWorkflow> {
    return this.get<OrchestratorWorkflow>(`${API_ENDPOINTS.ORCHESTRATOR.WORKFLOWS}/${id}`);
  }

  async createWorkflow(data: CreateWorkflowInput): Promise<OrchestratorWorkflow> {
    return this.post<OrchestratorWorkflow>(API_ENDPOINTS.ORCHESTRATOR.WORKFLOWS, data);
  }

  async executeAction(workflowId: string, actionId: string): Promise<OrchestratorWorkflow> {
    return this.post<OrchestratorWorkflow>(
      `${API_ENDPOINTS.ORCHESTRATOR.WORKFLOWS}/${workflowId}/actions/${actionId}/execute`,
      {},
    );
  }

  async getHistory(workflowId: string) {
    return this.get<WorkflowAction[]>(
      `${API_ENDPOINTS.ORCHESTRATOR.WORKFLOWS}/${workflowId}/history`,
    );
  }

  async escalate(workflowId: string): Promise<OrchestratorWorkflow> {
    return this.post<OrchestratorWorkflow>(
      `${API_ENDPOINTS.ORCHESTRATOR.WORKFLOWS}/${workflowId}/escalate`,
      {},
    );
  }
}

export const orchestratorService = new OrchestratorService();
