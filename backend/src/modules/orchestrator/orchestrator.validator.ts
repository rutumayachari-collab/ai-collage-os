import { z } from "zod";

export const createWorkflowSchema = z.object({
  studentId: z.string().min(1),
  studentName: z.string().min(1),
  actions: z.array(
    z.object({
      type: z.enum(["DOCUMENT_UPLOAD", "PAYMENT", "ADMISSION_REVIEW", "VERIFICATION", "FOLLOW_UP", "ESCALATION"]),
      title: z.string().min(1),
      description: z.string().min(1),
    }),
  ),
});

export const executeActionSchema = z.object({
  actionId: z.string().min(1),
  result: z.any().optional(),
});

export type CreateWorkflowInput = z.infer<typeof createWorkflowSchema>;
export type ExecuteActionInput = z.infer<typeof executeActionSchema>;
