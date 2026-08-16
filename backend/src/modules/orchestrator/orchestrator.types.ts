export interface OrchestratorWorkflow {
  id: string;
  studentId: string;
  studentName: string;
  actions: WorkflowAction[];
  currentStep: number;
  status: "ACTIVE" | "PAUSED" | "COMPLETED" | "FAILED";
  createdAt: Date;
  updatedAt: Date;
}

export interface WorkflowAction {
  id: string;
  type: ActionType;
  title: string;
  description: string;
  status: ActionStatus;
  assignedTo?: string;
  dueDate?: Date;
  completedAt?: Date;
}

export type ActionType =
  | "DOCUMENT_UPLOAD"
  | "PAYMENT"
  | "ADMISSION_REVIEW"
  | "VERIFICATION"
  | "FOLLOW_UP"
  | "ESCALATION";

export type ActionStatus = "PENDING" | "IN_PROGRESS" | "COMPLETED" | "FAILED";

export interface CreateWorkflowInput {
  studentId: string;
  studentName: string;
  actions: { type: ActionType; title: string; description: string }[];
}

export interface ExecuteActionInput {
  actionId: string;
  result?: unknown;
}
