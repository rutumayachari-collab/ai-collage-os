import { z } from 'zod';
import { emailSchema, phoneSchema, objectIdSchema } from '../../shared/validators';

export const studentAddressSchema = z.object({
  street: z.string().trim().min(1, 'Street is required'),
  city: z.string().trim().min(1, 'City is required'),
  state: z.string().trim().min(1, 'State is required'),
  country: z.string().trim().min(1, 'Country is required'),
  postalCode: z.string().trim().min(1, 'Postal code is required'),
});

export const studentCurrentAddressSchema = studentAddressSchema.extend({
  type: z.enum(['HOSTEL', 'PG', 'RENTED', 'FAMILY']),
});

export const studentEmergencyContactSchema = z.object({
  name: z.string().trim().min(1, 'Emergency contact name is required'),
  relation: z.string().trim().min(1, 'Relation is required'),
  phone: phoneSchema,
  email: z.string().trim().email('A valid email is required').optional().or(z.literal('')),
});

export const studentPreviousQualificationSchema = z.object({
  institution: z.string().trim().min(1, 'Institution is required'),
  board: z.string().trim().min(1, 'Board is required'),
  year: z.coerce.number().int().min(1950).max(new Date().getFullYear()),
  percentage: z.coerce.number().min(0).max(100),
  marksObtained: z.coerce.number().int().min(0).optional(),
  totalMarks: z.coerce.number().int().min(0).optional(),
});

export const studentDocumentSchema = z.object({
  name: z.string().trim().min(1, 'Document name is required'),
  type: z.enum(['AADHAR', 'MARKSHEET', 'PHOTO', 'SIGNATURE', 'OTHER']),
  url: z.string().trim().min(1, 'Document URL is required'),
  fileSize: z.coerce.number().int().min(0),
});

export const createStudentSchema = z.object({
  userId: objectIdSchema,
  studentId: z.string().trim().regex(/^\d{4}[A-Z]{2,4}\d{3}$/, 'Student ID must be in format YYYYXX###'),
  rollNumber: z.string().trim().min(1, 'Roll number is required').max(20),
  firstName: z.string().trim().min(2, 'First name must be at least 2 characters').max(50),
  lastName: z.string().trim().min(2, 'Last name must be at least 2 characters').max(50),
  dateOfBirth: z.coerce.date(),
  gender: z.enum(['MALE', 'FEMALE', 'OTHER', 'PREFER_NOT_TO_SAY']),
  bloodGroup: z.enum(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']).optional(),
  nationality: z.string().trim().min(1, 'Nationality is required'),
  religion: z.string().trim().optional().or(z.literal('')),
  category: z.enum(['GENERAL', 'OBC', 'SC', 'ST', 'EWS', 'OTHER']).optional(),
  aadharNumber: z.string().trim().regex(/^\d{12}$/, 'Aadhar number must be 12 digits').optional().or(z.literal('')),
  photo: z.string().trim().optional().or(z.literal('')),
  signature: z.string().trim().optional().or(z.literal('')),
  email: emailSchema,
  phone: phoneSchema,
  alternatePhone: phoneSchema.optional().or(z.literal('')),
  address: studentAddressSchema,
  currentAddress: studentCurrentAddressSchema.optional(),
  emergencyContact: studentEmergencyContactSchema,
  departmentId: objectIdSchema,
  courseId: objectIdSchema,
  batch: z.string().trim().regex(/^\d{4}-\d{4}$/, 'Batch must be in format YYYY-YYYY'),
  academicYear: z.string().trim().regex(/^\d{4}-\d{4}$/, 'Academic year must be in format YYYY-YYYY'),
  semester: z.coerce.number().int().min(1).max(8),
  section: z.string().trim().max(5).optional().or(z.literal('')),
  admissionNumber: z.string().trim().min(1, 'Admission number is required'),
  admissionDate: z.coerce.date(),
  admissionType: z.enum(['MERIT', 'MANAGEMENT', 'NRI', 'MANAGEMENT_QUOTA', 'OTHER']),
  quota: z.enum(['GENERAL', 'OBC', 'SC', 'ST', 'EWS', 'OTHER']).optional(),
  previousQualification: studentPreviousQualificationSchema.optional(),
  parentId: objectIdSchema.optional(),
  guardianName: z.string().trim().min(1, 'Guardian name is required'),
  guardianRelation: z.enum(['FATHER', 'MOTHER', 'GUARDIAN', 'OTHER']),
  guardianPhone: phoneSchema,
  guardianEmail: z.string().trim().email('A valid email is required').optional().or(z.literal('')),
  guardianOccupation: z.string().trim().optional().or(z.literal('')),
  guardianIncome: z.coerce.number().min(0).optional(),
  status: z.enum(['ACTIVE', 'ALUMNI', 'SUSPENDED', 'WITHDRAWN', 'GRADUATED']).default('ACTIVE'),
  isActive: z.boolean().default(true),
  isVerified: z.boolean().default(false),
  remarks: z.string().trim().optional().or(z.literal('')),
  tags: z.array(z.string().trim()).optional(),
  documents: z.array(studentDocumentSchema).default([]),
});

export const updateStudentSchema = createStudentSchema.partial().omit({
  userId: true,
  studentId: true,
  admissionNumber: true,
  departmentId: true,
});

export const studentQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  sort: z.string().trim().optional(),
  order: z.enum(['asc', 'desc']).default('desc'),
  search: z.string().trim().optional(),
  departmentId: z.string().trim().optional(),
  courseId: z.string().trim().optional(),
  batch: z.string().trim().optional(),
  academicYear: z.string().trim().optional(),
  semester: z.coerce.number().int().min(1).max(8).optional(),
  section: z.string().trim().optional(),
  status: z.enum(['ACTIVE', 'ALUMNI', 'SUSPENDED', 'WITHDRAWN', 'GRADUATED']).optional(),
  gender: z.enum(['MALE', 'FEMALE', 'OTHER', 'PREFER_NOT_TO_SAY']).optional(),
  isActive: z.coerce.boolean().optional(),
  isVerified: z.coerce.boolean().optional(),
});

export const bulkDeleteSchema = z.object({
  ids: z.array(objectIdSchema).min(1).max(500),
});

export const bulkImportSchema = z.object({
  students: z.array(createStudentSchema).min(1).max(500),
});

export const bulkUpdateSchema = z.object({
  ids: z.array(objectIdSchema).min(1).max(500),
  updates: updateStudentSchema,
});

export const linkParentSchema = z.object({
  parentId: objectIdSchema,
});

export type CreateStudentInput = z.infer<typeof createStudentSchema>;
export type UpdateStudentInput = z.infer<typeof updateStudentSchema>;
export type StudentQueryInput = z.infer<typeof studentQuerySchema>;
export type BulkImportInput = z.infer<typeof bulkImportSchema>;
export type BulkUpdateInput = z.infer<typeof bulkUpdateSchema>;
export type BulkDeleteInput = z.infer<typeof bulkDeleteSchema>;
export type LinkParentInput = z.infer<typeof linkParentSchema>;
