import { z } from 'zod';

export const feeComponentSchema = z.object({
  type: z.enum(['TUITION', 'ADMISSION', 'EXAM', 'LIBRARY', 'HOSTEL', 'TRANSPORT', 'SCHOLARSHIP', 'OTHER']),
  name: z.string().trim().min(1, 'Component name is required').max(100),
  amount: z.coerce.number().int().min(0),
  mandatory: z.boolean().default(true),
  description: z.string().trim().max(500).optional().or(z.literal('')),
});

export const createFeeStructureSchema = z.object({
  feeStructureId: z.string().trim().min(1, 'Fee structure ID is required'),
  courseId: z.string().trim().min(1, 'Course ID is required'),
  courseName: z.string().trim().max(100).optional().or(z.literal('')),
  departmentId: z.string().trim().min(1, 'Department ID is required'),
  academicYear: z.string().trim().min(1, 'Academic year is required'),
  semester: z.coerce.number().int().min(1).max(12),
  components: z.array(feeComponentSchema).min(1, 'At least one fee component is required'),
  totalAmount: z.coerce.number().int().min(0),
  dueDate: z.coerce.date(),
  lateFeeAmount: z.coerce.number().int().min(0).default(0),
  lateFeeGraceDays: z.coerce.number().int().min(0).default(0),
  scholarshipPercentage: z.coerce.number().int().min(0).max(100).default(0),
  isActive: z.boolean().default(true),
});

export const updateFeeStructureSchema = createFeeStructureSchema.partial().refine(
  (data) => Object.keys(data).length > 0,
  'At least one field must be provided'
);

export const feeQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
  search: z.string().trim().optional().or(z.literal('')),
  courseId: z.string().trim().optional().or(z.literal('')),
  departmentId: z.string().trim().optional().or(z.literal('')),
  academicYear: z.string().trim().optional().or(z.literal('')),
  semester: z.coerce.number().int().min(1).max(12).optional(),
  status: z.enum(['PENDING', 'PARTIAL', 'PAID', 'OVERDUE', 'WAIVED', 'CANCELLED']).optional(),
  sortBy: z.string().trim().optional().or(z.literal('')),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

export const createStudentFeeAccountSchema = z.object({
  studentId: z.string().trim().min(1, 'Student ID is required'),
  studentName: z.string().trim().min(1, 'Student name is required'),
  courseId: z.string().trim().min(1, 'Course ID is required'),
  courseName: z.string().trim().max(100).optional().or(z.literal('')),
  departmentId: z.string().trim().min(1, 'Department ID is required'),
  academicYear: z.string().trim().min(1, 'Academic year is required'),
  semester: z.coerce.number().int().min(1).max(12),
  feeStructureId: z.string().trim().min(1, 'Fee structure ID is required'),
  totalFee: z.coerce.number().int().min(0),
  scholarshipAmount: z.coerce.number().int().min(0).default(0),
  dueDate: z.coerce.date(),
});

export const updateStudentFeeAccountSchema = z.object({
  scholarshipAmount: z.coerce.number().int().min(0).optional(),
  status: z.enum(['PENDING', 'PARTIAL', 'PAID', 'OVERDUE', 'WAIVED', 'CANCELLED']).optional(),
  dueDate: z.coerce.date().optional(),
  remarks: z.string().trim().max(500).optional().or(z.literal('')),
});

export const feePaymentSchema = z.object({
  amount: z.coerce.number().int().min(1, 'Payment amount must be at least 1'),
  paymentMode: z.enum(['CASH', 'CARD', 'UPI', 'NET_BANKING', 'CHEQUE', 'OTHER']),
  provider: z.enum(['RAZORPAY', 'STRIPE', 'PAYU', 'MANUAL']).optional(),
  providerTransactionId: z.string().trim().optional().or(z.literal('')),
  remarks: z.string().trim().max(500).optional().or(z.literal('')),
});

export const generateInvoiceSchema = z.object({
  studentId: z.string().trim().min(1, 'Student ID is required'),
  academicYear: z.string().trim().min(1, 'Academic year is required'),
  semester: z.coerce.number().int().min(1).max(12),
});

export const bulkFeeUpdateSchema = z.object({
  studentIds: z.array(z.string().trim().min(1)).min(1, 'At least one student ID is required'),
  action: z.enum(['UPDATE_DUE_DATE', 'APPLY_SCHOLARSHIP', 'WAIVE_FEE', 'MARK_OVERDUE']),
  value: z.union([z.coerce.date(), z.coerce.number(), z.string().trim()]),
  remarks: z.string().trim().max(500).optional().or(z.literal('')),
});
