import { z } from 'zod';
import { objectIdSchema } from '../../shared/validators';

export const companyStatusSchema = z.enum(['ACTIVE', 'INACTIVE']);
export const driveTypeSchema = z.enum(['ON_CAMPUS', 'OFF_CAMPUS']);
export const driveStatusSchema = z.enum(['SCHEDULED', 'REGISTRATION_OPEN', 'REGISTRATION_CLOSED', 'COMPLETED', 'CANCELLED']);
export const applicationStatusSchema = z.enum(['APPLIED', 'SHORTLISTED', 'INTERVIEW_SCHEDULED', 'INTERVIEWED', 'SELECTED', 'REJECTED', 'WITHDRAWN']);
export const interviewResultSchema = z.enum(['PASSED', 'FAILED', 'PENDING']);
export const offerStatusSchema = z.enum(['OFFERED', 'ACCEPTED', 'REJECTED', 'EXPIRED']);
export const placementStatusSchema = z.enum(['PLACED', 'NOT_PLACED', 'IN_PROGRESS']);

export const createCompanySchema = z.object({
  companyId: z.string().trim().regex(/^[A-Z]{2,4}\d{3,6}$/, 'Company ID must be 2-4 uppercase letters followed by 3-6 digits'),
  name: z.string().trim().min(2, 'Name must be at least 2 characters').max(100),
  industry: z.string().trim().min(2, 'Industry must be at least 2 characters').max(100),
  website: z.string().trim().url().optional().or(z.literal('')),
  hrName: z.string().trim().max(100).optional().or(z.literal('')),
  hrEmail: z.string().trim().email().optional().or(z.literal('')),
  hrPhone: z.string().trim().max(20).optional().or(z.literal('')),
  address: z.string().trim().max(500).optional().or(z.literal('')),
  isActive: z.boolean().default(true),
  status: companyStatusSchema.default('ACTIVE'),
});

export const updateCompanySchema = createCompanySchema.partial().omit({
  companyId: true,
});

export const companyQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  sort: z.string().trim().optional(),
  order: z.enum(['asc', 'desc']).default('desc'),
  search: z.string().trim().optional(),
  industry: z.string().trim().optional(),
  isActive: z.coerce.boolean().optional(),
  status: companyStatusSchema.optional(),
});

export const createDriveSchema = z.object({
  driveId: z.string().trim().regex(/^[A-Z]{2,4}\d{3,6}$/, 'Drive ID must be 2-4 uppercase letters followed by 3-6 digits'),
  companyId: objectIdSchema,
  driveName: z.string().trim().min(2, 'Drive name must be at least 2 characters').max(100),
  driveDate: z.coerce.date(),
  registrationDeadline: z.coerce.date(),
  eligibleCourses: z.array(z.string().trim()).min(1, 'At least one eligible course is required'),
  eligibleBranches: z.array(z.string().trim()).min(1, 'At least one eligible branch is required'),
  minPercentage: z.coerce.number().min(0).max(100),
  maxBacklogs: z.coerce.number().int().min(0).max(10),
  packageDetails: z.string().trim().min(1, 'Package details are required').max(500),
  driveType: driveTypeSchema,
  status: driveStatusSchema.default('SCHEDULED'),
});

export const updateDriveSchema = createDriveSchema.partial().omit({
  driveId: true,
  companyId: true,
});

export const driveQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  sort: z.string().trim().optional(),
  order: z.enum(['asc', 'desc']).default('desc'),
  search: z.string().trim().optional(),
  companyId: z.string().trim().optional(),
  driveType: driveTypeSchema.optional(),
  status: driveStatusSchema.optional(),
  isActive: z.coerce.boolean().optional(),
});

export const createApplicationSchema = z.object({
  applicationId: z.string().trim().regex(/^[A-Z]{2,4}\d{3,6}$/, 'Application ID must be 2-4 uppercase letters followed by 3-6 digits'),
  studentId: objectIdSchema,
  driveId: objectIdSchema,
  appliedDate: z.coerce.date(),
  status: applicationStatusSchema.default('APPLIED'),
});

export const updateApplicationSchema = createApplicationSchema.partial().omit({
  applicationId: true,
  studentId: true,
  driveId: true,
  appliedDate: true,
});

export const applicationQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  sort: z.string().trim().optional(),
  order: z.enum(['asc', 'desc']).default('desc'),
  search: z.string().trim().optional(),
  studentId: z.string().trim().optional(),
  driveId: z.string().trim().optional(),
  status: applicationStatusSchema.optional(),
});

export const createInterviewSchema = z.object({
  interviewId: z.string().trim().regex(/^[A-Z]{2,4}\d{3,6}$/, 'Interview ID must be 2-4 uppercase letters followed by 3-6 digits'),
  applicationId: objectIdSchema,
  roundName: z.string().trim().min(1, 'Round name is required').max(100),
  roundNumber: z.coerce.number().int().min(1).max(10),
  scheduledAt: z.coerce.date(),
  completedAt: z.coerce.date().optional().or(z.literal('')),
  result: interviewResultSchema.optional(),
  feedback: z.string().trim().max(1000).optional().or(z.literal('')),
  interviewerName: z.string().trim().max(100).optional().or(z.literal('')),
});

export const updateInterviewSchema = createInterviewSchema.partial().omit({
  interviewId: true,
  applicationId: true,
});

export const interviewQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  sort: z.string().trim().optional(),
  order: z.enum(['asc', 'desc']).default('desc'),
  search: z.string().trim().optional(),
  applicationId: z.string().trim().optional(),
  result: interviewResultSchema.optional(),
});

export const createOfferSchema = z.object({
  offerId: z.string().trim().regex(/^[A-Z]{2,4}\d{3,6}$/, 'Offer ID must be 2-4 uppercase letters followed by 3-6 digits'),
  applicationId: objectIdSchema,
  offerLetterUrl: z.string().trim().url().optional().or(z.literal('')),
  packageAmount: z.coerce.number().min(0).optional(),
  joiningDate: z.coerce.date().optional().or(z.literal('')),
  location: z.string().trim().max(200).optional().or(z.literal('')),
  status: offerStatusSchema.default('OFFERED'),
});

export const updateOfferSchema = createOfferSchema.partial().omit({
  offerId: true,
  applicationId: true,
});

export const offerQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  sort: z.string().trim().optional(),
  order: z.enum(['asc', 'desc']).default('desc'),
  search: z.string().trim().optional(),
  applicationId: z.string().trim().optional(),
  status: offerStatusSchema.optional(),
});

export const createPlacementSchema = z.object({
  placementId: z.string().trim().regex(/^[A-Z]{2,4}\d{3,6}$/, 'Placement ID must be 2-4 uppercase letters followed by 3-6 digits'),
  studentId: objectIdSchema,
  applicationId: objectIdSchema,
  companyId: objectIdSchema,
  driveId: objectIdSchema,
  offerId: objectIdSchema,
  packageAmount: z.coerce.number().min(0),
  joiningDate: z.coerce.date(),
  location: z.string().trim().max(200),
  status: placementStatusSchema.default('PLACED'),
});

export const updatePlacementSchema = createPlacementSchema.partial().omit({
  placementId: true,
  studentId: true,
  applicationId: true,
  companyId: true,
  driveId: true,
  offerId: true,
});

export const placementQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  sort: z.string().trim().optional(),
  order: z.enum(['asc', 'desc']).default('desc'),
  search: z.string().trim().optional(),
  studentId: z.string().trim().optional(),
  companyId: z.string().trim().optional(),
  driveId: z.string().trim().optional(),
  status: placementStatusSchema.optional(),
});

export const statisticsQuerySchema = z.object({
  companyId: z.string().trim().optional(),
  driveId: z.string().trim().optional(),
  fromDate: z.coerce.date().optional(),
  toDate: z.coerce.date().optional(),
});

export type CreateCompanyInput = z.infer<typeof createCompanySchema>;
export type UpdateCompanyInput = z.infer<typeof updateCompanySchema>;
export type CompanyQueryInput = z.infer<typeof companyQuerySchema>;
export type CreateDriveInput = z.infer<typeof createDriveSchema>;
export type UpdateDriveInput = z.infer<typeof updateDriveSchema>;
export type DriveQueryInput = z.infer<typeof driveQuerySchema>;
export type CreateApplicationInput = z.infer<typeof createApplicationSchema>;
export type UpdateApplicationInput = z.infer<typeof updateApplicationSchema>;
export type ApplicationQueryInput = z.infer<typeof applicationQuerySchema>;
export type CreateInterviewInput = z.infer<typeof createInterviewSchema>;
export type UpdateInterviewInput = z.infer<typeof updateInterviewSchema>;
export type InterviewQueryInput = z.infer<typeof interviewQuerySchema>;
export type CreateOfferInput = z.infer<typeof createOfferSchema>;
export type UpdateOfferInput = z.infer<typeof updateOfferSchema>;
export type OfferQueryInput = z.infer<typeof offerQuerySchema>;
export type CreatePlacementInput = z.infer<typeof createPlacementSchema>;
export type UpdatePlacementInput = z.infer<typeof updatePlacementSchema>;
export type PlacementQueryInput = z.infer<typeof placementQuerySchema>;
export type StatisticsQueryInput = z.infer<typeof statisticsQuerySchema>;
