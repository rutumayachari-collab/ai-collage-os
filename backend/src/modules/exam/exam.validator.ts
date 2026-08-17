import { z } from 'zod';
import { objectIdSchema } from '../../shared/validators';

export const examScheduleSchema = z.object({
  id: z.string().trim().min(1, 'Schedule ID is required'),
  date: z.string().trim().min(1, 'Date is required'),
  startTime: z.string().trim().min(1, 'Start time is required'),
  endTime: z.string().trim().min(1, 'End time is required'),
  room: z.string().trim().min(1, 'Room is required'),
  invigilatorId: objectIdSchema,
});

export const examRegistrationSchema = z.object({
  id: z.string().trim().min(1, 'Registration ID is required'),
  studentId: objectIdSchema,
  status: z.enum(['REGISTERED', 'ATTENDED', 'ABSENT', 'WITHDRAWN']),
  registeredAt: z.coerce.date(),
});

export const examResultSchema = z.object({
  id: z.string().trim().min(1, 'Result ID is required'),
  studentId: objectIdSchema,
  marksObtained: z.coerce.number().min(0),
  grade: z.string().trim().min(1, 'Grade is required'),
  isPassed: z.boolean(),
  remarks: z.string().trim().optional().or(z.literal('')),
  publishedAt: z.coerce.date(),
});

export const createExamSchema = z.object({
  examId: z.string().trim().regex(/^[A-Z]{2,4}\d{3,6}$/, 'Exam ID must be 2-4 uppercase letters followed by 3-6 digits'),
  code: z.string().trim().regex(/^[A-Z]{2,4}\d{3,6}$/, 'Exam code must be 2-4 uppercase letters followed by 3-6 digits').max(20),
  name: z.string().trim().min(2, 'Name must be at least 2 characters').max(100),
  courseId: objectIdSchema,
  subjectId: objectIdSchema,
  semester: z.coerce.number().int().min(1).max(12),
  academicYear: z.string().trim().regex(/^\d{4}-\d{4}$/, 'Academic year must be in format YYYY-YYYY'),
  examType: z.enum(['THEORY', 'LAB', 'PRACTICAL', 'PROJECT', 'SEMINAR', 'VIVA']),
  maxMarks: z.coerce.number().int().min(1).max(1000),
  passingMarks: z.coerce.number().int().min(0).max(1000),
  durationMinutes: z.coerce.number().int().min(1).max(720),
  schedule: z.array(examScheduleSchema).default([]),
  registrations: z.array(examRegistrationSchema).default([]),
  results: z.array(examResultSchema).default([]),
  status: z.enum(['SCHEDULED', 'ONGOING', 'COMPLETED', 'CANCELLED', 'RESULTS_PUBLISHED']).default('SCHEDULED'),
  isActive: z.boolean().default(true),
});

export const updateExamSchema = createExamSchema.partial().omit({
  examId: true,
  code: true,
  courseId: true,
  subjectId: true,
  semester: true,
});

export const examQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  sort: z.string().trim().optional(),
  order: z.enum(['asc', 'desc']).default('desc'),
  search: z.string().trim().optional(),
  courseId: z.string().trim().optional(),
  subjectId: z.string().trim().optional(),
  semester: z.coerce.number().int().min(1).max(12).optional(),
  academicYear: z.string().trim().optional(),
  examType: z.enum(['THEORY', 'LAB', 'PRACTICAL', 'PROJECT', 'SEMINAR', 'VIVA']).optional(),
  status: z.enum(['SCHEDULED', 'ONGOING', 'COMPLETED', 'CANCELLED', 'RESULTS_PUBLISHED']).optional(),
  isActive: z.coerce.boolean().optional(),
});

export const registerExamSchema = z.object({
  examId: objectIdSchema,
});

export const bulkImportSchema = z.object({
  exams: z.array(createExamSchema).min(1).max(500),
});

export const bulkUpdateSchema = z.object({
  ids: z.array(objectIdSchema).min(1).max(500),
  updates: updateExamSchema,
});

export const publishResultSchema = z.object({
  studentId: objectIdSchema,
  marksObtained: z.coerce.number().min(0),
  grade: z.string().trim().min(1, 'Grade is required'),
  remarks: z.string().trim().optional().or(z.literal('')),
});

export const bulkPublishResultSchema = z.object({
  results: z.array(publishResultSchema).min(1).max(500),
});

export type CreateExamInput = z.infer<typeof createExamSchema>;
export type UpdateExamInput = z.infer<typeof updateExamSchema>;
export type ExamQueryInput = z.infer<typeof examQuerySchema>;
export type RegisterExamInput = z.infer<typeof registerExamSchema>;
export type PublishResultInput = z.infer<typeof publishResultSchema>;
export type BulkPublishResultInput = z.infer<typeof bulkPublishResultSchema>;
