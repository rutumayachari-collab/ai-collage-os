import { z } from 'zod';

export const AISummarySchema = z.object({
  applicantId: z.string().min(1, 'Applicant ID is required'),
  applicantName: z.string().min(1, 'Applicant name is required'),
  courseInterest: z.string().min(1, 'Course interest is required'),
  academicScore: z.number().min(0).max(100),
  documentsVerified: z.boolean(),
});

export const AIEligibilitySchema = z.object({
  applicantId: z.string().min(1, 'Applicant ID is required'),
  courseId: z.string().min(1, 'Course ID is required'),
  academicScore: z.number().min(0).max(100),
  documentsVerified: z.boolean(),
});

export const AIRiskAnalysisSchema = z.object({
  applicantId: z.string().min(1, 'Applicant ID is required'),
  academicScore: z.number().min(0).max(100),
  attendancePercentage: z.number().min(0).max(100),
  previousDefaults: z.boolean(),
});

export const AIScholarshipSchema = z.object({
  applicantId: z.string().min(1, 'Applicant ID is required'),
  academicScore: z.number().min(0).max(100),
  familyIncome: z.number().min(0),
  category: z.string().min(1, 'Category is required'),
});

export const AICounselingNotesSchema = z.object({
  applicantId: z.string().min(1, 'Applicant ID is required'),
  counselingNotes: z.string().min(1, 'Counseling notes are required'),
  previousInteractions: z.array(z.string()).optional(),
});

export const AIAdmissionEmailSchema = z.object({
  applicantId: z.string().min(1, 'Applicant ID is required'),
  applicantName: z.string().min(1, 'Applicant name is required'),
  courseName: z.string().min(1, 'Course name is required'),
  status: z.string().min(1, 'Status is required'),
});

export const AIWhatsAppDraftSchema = z.object({
  applicantId: z.string().min(1, 'Applicant ID is required'),
  applicantName: z.string().min(1, 'Applicant name is required'),
  message: z.string().min(1, 'Message is required'),
});

export const AINextActionSchema = z.object({
  applicantId: z.string().min(1, 'Applicant ID is required'),
  currentStage: z.string().min(1, 'Current stage is required'),
  pendingActions: z.array(z.string()),
});
