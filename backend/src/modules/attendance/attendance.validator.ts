import { z } from 'zod';
import { objectIdSchema } from '../../shared/validators';

export const createAttendanceRecordSchema = z.object({
  studentId: objectIdSchema,
  subjectId: objectIdSchema,
  facultyId: objectIdSchema,
  date: z.string().trim().datetime(),
  status: z.enum(['PRESENT', 'ABSENT', 'LATE', 'EXCUSED']),
  remarks: z.string().trim().max(500).optional().or(z.literal('')),
  sessionType: z.string().trim().max(50).optional().or(z.literal('')),
  periodNumber: z.coerce.number().int().min(1).max(10).optional(),
  topicCovered: z.string().trim().max(500).optional().or(z.literal('')),
  isCompensated: z.boolean().default(false),
  compensationDate: z.string().trim().datetime().optional().or(z.literal('')),
});

export const updateAttendanceRecordSchema = z.object({
  status: z.enum(['PRESENT', 'ABSENT', 'LATE', 'EXCUSED']).optional(),
  remarks: z.string().trim().max(500).optional().or(z.literal('')),
  sessionType: z.string().trim().max(50).optional().or(z.literal('')),
  periodNumber: z.coerce.number().int().min(1).max(10).optional(),
  topicCovered: z.string().trim().max(500).optional().or(z.literal('')),
  isCompensated: z.boolean().optional(),
  compensationDate: z.string().trim().datetime().optional().or(z.literal('')),
});

export const attendanceQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  search: z.string().trim().optional().or(z.literal('')),
  sort: z.string().trim().default('date'),
  order: z.enum(['asc', 'desc']).default('desc'),
  studentId: z.string().trim().optional().or(z.literal('')),
  subjectId: z.string().trim().optional().or(z.literal('')),
  facultyId: z.string().trim().optional().or(z.literal('')),
  status: z.enum(['PRESENT', 'ABSENT', 'LATE', 'EXCUSED']).optional(),
  dateFrom: z.string().trim().datetime().optional().or(z.literal('')),
  dateTo: z.string().trim().datetime().optional().or(z.literal('')),
  isActive: z.coerce.boolean().optional(),
});

export const bulkMarkAttendanceSchema = z.object({
  subjectId: objectIdSchema,
  facultyId: objectIdSchema,
  date: z.string().trim().datetime(),
  sessionType: z.string().trim().max(50).optional().or(z.literal('')),
  periodNumber: z.coerce.number().int().min(1).max(10).optional(),
  topicCovered: z.string().trim().max(500).optional().or(z.literal('')),
  records: z.array(
    z.object({
      studentId: objectIdSchema,
      status: z.enum(['PRESENT', 'ABSENT', 'LATE', 'EXCUSED']),
      remarks: z.string().trim().max(500).optional().or(z.literal('')),
    })
  ).min(1, 'At least one attendance record is required').max(200, 'Cannot mark more than 200 records at once'),
});

export const attendanceStatisticsQuerySchema = z.object({
  studentId: z.string().trim().optional().or(z.literal('')),
  subjectId: z.string().trim().optional().or(z.literal('')),
  month: z.coerce.number().int().min(1).max(12).optional(),
  year: z.coerce.number().int().min(2000).max(2100).optional(),
  period: z.enum(['DAILY', 'WEEKLY', 'MONTHLY', 'SEMESTER']).default('MONTHLY'),
});

export type CreateAttendanceRecordInput = z.infer<typeof createAttendanceRecordSchema>;
export type UpdateAttendanceRecordInput = z.infer<typeof updateAttendanceRecordSchema>;
export type AttendanceQueryInput = z.infer<typeof attendanceQuerySchema>;
export type BulkMarkAttendanceInput = z.infer<typeof bulkMarkAttendanceSchema>;
export type AttendanceStatisticsQueryInput = z.infer<typeof attendanceStatisticsQuerySchema>;
