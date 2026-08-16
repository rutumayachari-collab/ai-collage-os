import { z } from 'zod';
import {
  SupportedLanguages,
  CallIntents,
  CallSentiments,
  AdmissionInterestLevels,
  CallOutcomes,
  RecommendedActionTypes,
  LeadStages,
} from './calling-agent.types';

export const studentLeadSchema = z.object({
  studentId: z.string().optional(),
  name: z.string().min(1, 'Student name is required'),
  phone: z.string().min(10, 'Valid 10-digit phone number is required'),
  email: z.string().email().optional().or(z.literal('')),
  courseInterest: z.string().min(1, 'Course interest is required'),
  academicQualification: z.string().optional(),
  academicScore: z.coerce.number().min(0).max(100).optional(),
  admissionStage: z.enum(LeadStages).optional(),
  leadSource: z.string().optional(),
  preferredLanguage: z.enum(SupportedLanguages).optional(),
  previousInteraction: z.string().optional(),
  callbackPreference: z.string().optional(),
  notes: z.string().optional(),
});

export const createCampaignSchema = z.object({
  name: z.string().min(1, 'Campaign name is required'),
  collegeName: z.string().min(1, 'College name is required'),
  purpose: z.string().min(1, 'Purpose is required'),
  targetCourse: z.string().optional(),
  defaultLanguage: z.enum(SupportedLanguages).default('English'),
  maxAttempts: z.number().int().min(1).max(10).default(3),
  callingHours: z
    .object({
      start: z.string().default('09:00'),
      end: z.string().default('19:00'),
    })
    .optional(),
  retryIntervalHours: z.number().int().min(1).default(24),
  studentLeads: z.array(studentLeadSchema).optional(),
});

export const validateCsvSchema = z.object({
  rows: z.array(z.record(z.string())),
  campaignId: z.string().optional(),
});

export const importStudentsSchema = z.object({
  students: z.array(studentLeadSchema).min(1, 'At least one student lead is required'),
});

export const startCallSessionSchema = z.object({
  campaignId: z.string().min(1, 'Campaign ID is required'),
  queueItemId: z.string().min(1, 'Queue Item ID is required'),
  language: z.enum(SupportedLanguages).optional(),
});

export const transcriptTurnSchema = z.object({
  id: z.string(),
  speaker: z.enum(['agent', 'student']),
  text: z.string(),
  timestamp: z.coerce.date(),
  language: z.enum(SupportedLanguages),
  sentiment: z.enum(CallSentiments).optional(),
  intent: z.enum(CallIntents).optional(),
});

export const interactTurnSchema = z.object({
  sessionId: z.string().min(1),
  queueItemId: z.string().min(1),
  campaignId: z.string().min(1),
  studentUtterance: z.string().min(1, 'Student message cannot be empty'),
  currentLanguage: z.enum(SupportedLanguages).default('English'),
  transcriptHistory: z.array(transcriptTurnSchema).default([]),
});

export const recordOutcomeSchema = z.object({
  queueItemId: z.string().min(1),
  outcome: z.enum(CallOutcomes),
  sentiment: z.enum(CallSentiments),
  intent: z.enum(CallIntents),
  admissionInterest: z.enum(AdmissionInterestLevels),
  primaryConcern: z.string().optional(),
  notes: z.string().optional().default(''),
  recommendedAction: z.enum(RecommendedActionTypes),
  actionReasoning: z.string().optional().default(''),
  callbackTime: z.coerce.date().optional(),
  campusVisitSlot: z
    .object({
      date: z.coerce.date(),
      timeSlot: z.string(),
      notes: z.string().optional(),
    })
    .optional(),
  counselorHandoff: z
    .object({
      counselorId: z.string().optional(),
      counselorRole: z.string().optional(),
      escalationReason: z.string(),
    })
    .optional(),
  durationSeconds: z.number().min(0).default(0),
  transcript: z.array(transcriptTurnSchema).default([]),
  preferredLanguage: z.enum(SupportedLanguages).optional(),
  detectedLanguage: z.enum(SupportedLanguages).optional(),
});

export const approveActionSchema = z.object({
  action: z.enum(RecommendedActionTypes),
  approvalStatus: z.enum(['APPROVED', 'REJECTED']),
  counselorId: z.string().optional(),
  scheduledTime: z.coerce.date().optional(),
  campusVisitDetails: z
    .object({
      date: z.coerce.date(),
      timeSlot: z.string(),
      notes: z.string().optional(),
    })
    .optional(),
  overrideNotes: z.string().optional(),
});

export const createDncSchema = z.object({
  phone: z.string().min(10, 'Valid phone number is required'),
  studentId: z.string().optional(),
  studentName: z.string().optional(),
  reason: z.string().optional(),
  campaignId: z.string().optional(),
});

export type CreateCampaignInput = z.infer<typeof createCampaignSchema>;
export type ValidateCsvInput = z.infer<typeof validateCsvSchema>;
export type ImportStudentsInput = z.infer<typeof importStudentsSchema>;
export type StartCallSessionInput = z.infer<typeof startCallSessionSchema>;
export type InteractTurnInput = z.infer<typeof interactTurnSchema>;
export type RecordOutcomeInput = z.infer<typeof recordOutcomeSchema>;
export type ApproveActionInput = z.infer<typeof approveActionSchema>;
export type CreateDncInput = z.infer<typeof createDncSchema>;
