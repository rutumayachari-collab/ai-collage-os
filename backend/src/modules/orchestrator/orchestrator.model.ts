import { Schema, model, type HydratedDocument, type Model } from 'mongoose';
import type { OrchestratorWorkflow, WorkflowAction } from './orchestrator.types';

export type OrchestratorWorkflowSchemaType = OrchestratorWorkflow;
export type OrchestratorWorkflowDocument = HydratedDocument<OrchestratorWorkflowSchemaType>;

const workflowActionSchema = new Schema<WorkflowAction>(
  {
    id: { type: String, required: true, trim: true },
    type: {
      type: String,
      required: true,
      enum: ['DOCUMENT_UPLOAD', 'PAYMENT', 'ADMISSION_REVIEW', 'VERIFICATION', 'FOLLOW_UP', 'ESCALATION'],
    },
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    status: {
      type: String,
      required: true,
      enum: ['PENDING', 'IN_PROGRESS', 'COMPLETED', 'FAILED'],
      default: 'PENDING',
    },
    assignedTo: { type: String, trim: true },
    dueDate: { type: Date },
    completedAt: { type: Date },
  },
  { _id: false },
);

const orchestratorWorkflowSchema = new Schema<OrchestratorWorkflowSchemaType>(
  {
    id: { type: String, required: true, unique: true, index: true },
    studentId: { type: String, required: true, index: true },
    studentName: { type: String, required: true, trim: true },
    actions: { type: [workflowActionSchema], required: true, default: [] },
    currentStep: { type: Number, required: true, default: 0 },
    status: {
      type: String,
      required: true,
      enum: ['ACTIVE', 'PAUSED', 'COMPLETED', 'FAILED'],
      default: 'ACTIVE',
      index: true,
    },
    createdAt: { type: Date, required: true, default: Date.now },
    updatedAt: { type: Date, required: true, default: Date.now },
  },
  {
    timestamps: false,
    versionKey: false,
    toJSON: {
      transform: (_doc, ret: Record<string, unknown>) => {
        delete ret._id;
        return ret;
      },
    },
  },
);

orchestratorWorkflowSchema.index({ studentId: 1, createdAt: -1 });

export const OrchestratorWorkflowModel: Model<OrchestratorWorkflowSchemaType> =
  model<OrchestratorWorkflowSchemaType>('OrchestratorWorkflow', orchestratorWorkflowSchema);
