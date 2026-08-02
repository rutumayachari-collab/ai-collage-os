import { z } from 'zod';
import { emailSchema, phoneSchema, objectIdSchema } from '../../shared/validators';

export const departmentAchievementSchema = z.object({
  year: z.coerce.number().int().min(1900).max(new Date().getFullYear()),
  title: z.string().trim().min(1, 'Title is required').max(200),
  description: z.string().trim().min(1, 'Description is required').max(1000),
  category: z.enum(['RESEARCH', 'AWARD', 'RANKING', 'INFRASTRUCTURE', 'OTHER']),
});

export const createDepartmentSchema = z.object({
  code: z.string().trim().regex(/^[A-Z]{2,10}$/, 'Department code must be 2-10 uppercase letters'),
  name: z.string().trim().min(3, 'Department name must be at least 3 characters').max(100),
  shortName: z.string().trim().min(2, 'Short name must be at least 2 characters').max(20),
  description: z.string().trim().optional().or(z.literal('')),
  hodId: objectIdSchema.optional(),
  email: emailSchema,
  phone: phoneSchema,
  officeLocation: z.string().trim().optional().or(z.literal('')),
  building: z.string().trim().optional().or(z.literal('')),
  establishedYear: z.coerce.number().int().min(1900).max(new Date().getFullYear()),
  intakeCapacity: z.coerce.number().int().min(1).max(1000),
  accreditation: z.string().trim().optional().or(z.literal('')),
  website: z.string().trim().url('Invalid URL format').optional().or(z.literal('')),
  vision: z.string().trim().optional().or(z.literal('')),
  mission: z.string().trim().optional().or(z.literal('')),
  achievements: z.array(departmentAchievementSchema).optional(),
  logo: z.string().trim().optional().or(z.literal('')),
  tags: z.array(z.string().trim()).optional(),
  status: z.enum(['ACTIVE', 'INACTIVE', 'ARCHIVED']).default('ACTIVE'),
  isActive: z.boolean().default(true),
});

export const updateDepartmentSchema = createDepartmentSchema.partial().omit({
  code: true,
  name: true,
});

export const departmentQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  sort: z.string().trim().optional(),
  order: z.enum(['asc', 'desc']).default('desc'),
  search: z.string().trim().optional(),
  status: z.enum(['ACTIVE', 'INACTIVE', 'ARCHIVED']).optional(),
  isActive: z.coerce.boolean().optional(),
  hodId: z.string().trim().optional(),
  establishedYear: z.coerce.number().int().optional(),
  building: z.string().trim().optional(),
  accreditation: z.string().trim().optional(),
});

export const bulkImportSchema = z.object({
  departments: z.array(createDepartmentSchema).min(1).max(500),
});

export const bulkUpdateSchema = z.object({
  ids: z.array(objectIdSchema).min(1).max(500),
  updates: updateDepartmentSchema,
});

export const assignHodSchema = z.object({
  hodId: objectIdSchema,
});

export type CreateDepartmentInput = z.infer<typeof createDepartmentSchema>;
export type UpdateDepartmentInput = z.infer<typeof updateDepartmentSchema>;
export type DepartmentQueryInput = z.infer<typeof departmentQuerySchema>;
export type BulkImportInput = z.infer<typeof bulkImportSchema>;
export type BulkUpdateInput = z.infer<typeof bulkUpdateSchema>;
export type AssignHodInput = z.infer<typeof assignHodSchema>;
