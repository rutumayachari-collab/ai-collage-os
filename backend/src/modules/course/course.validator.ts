import { z } from 'zod';
import { emailSchema, phoneSchema, objectIdSchema } from '../../shared/validators';

export const assessmentMethodSchema = z.enum(['EXAM', 'PROJECT', 'ASSIGNMENT', 'LAB', 'QUIZ', 'PRESENTATION', 'INTERNAL']);

export const outcomeSchema = z.object({
  code: z.string().trim().min(1, 'Outcome code is required').max(20),
  title: z.string().trim().min(1, 'Title is required').max(200),
  description: z.string().trim().min(1, 'Description is required').max(1000),
  attainmentTarget: z.coerce.number().int().min(0).max(100),
  assessmentMethods: z.array(assessmentMethodSchema).min(1, 'At least one assessment method is required'),
});

export const semesterSubjectSchema = z.object({
  subjectId: objectIdSchema,
  isElective: z.boolean().default(false),
});

export const semesterSchema = z.object({
  semesterNumber: z.coerce.number().int().min(1).max(20),
  credits: z.coerce.number().int().min(0).max(500),
  electiveCredits: z.coerce.number().int().min(0).max(500),
  mandatoryCredits: z.coerce.number().int().min(0).max(500),
  theoryCredits: z.coerce.number().int().min(0).max(500),
  practicalCredits: z.coerce.number().int().min(0).max(500),
  labCredits: z.coerce.number().int().min(0).max(500),
  projectCredits: z.coerce.number().int().min(0).max(500),
  internshipCredits: z.coerce.number().int().min(0).max(500),
  subjects: z.array(semesterSubjectSchema).default([]),
  isActive: z.boolean().default(true),
});

export const curriculumStatusSchema = z.enum(['DRAFT', 'REVIEW', 'APPROVED', 'ACTIVE', 'RETIRED']);

export const curriculumHistoryItemSchema = z.object({
  version: z.string().trim().min(1, 'Version is required'),
  status: curriculumStatusSchema.default('DRAFT'),
  effectiveFrom: z.coerce.date(),
  effectiveTo: z.coerce.date().nullable(),
  changedBy: objectIdSchema,
  changeReason: z.string().trim().min(1, 'Change reason is required').max(500),
  approvedBy: objectIdSchema,
  approvedAt: z.coerce.date(),
  publishedAt: z.coerce.date().nullable(),
});

export const prerequisiteSchema = z.object({
  prerequisiteCourseId: objectIdSchema,
  minimumGrade: z.string().trim().min(1, 'Minimum grade is required').max(5),
  mandatory: z.boolean().default(true),
  remarks: z.string().trim().default(''),
});

export const aiMetadataSchema = z.object({
  predictedDifficulty: z.enum(['EASY', 'MEDIUM', 'HARD']).nullable().default(null),
  predictedDropoutRisk: z.coerce.number().int().min(0).max(100).nullable().default(null),
  predictedPlacementRate: z.coerce.number().int().min(0).max(100).nullable().default(null),
  averagePassRate: z.coerce.number().int().min(0).max(100).nullable().default(null),
  historicalDifficultyTrend: z.string().trim().nullable().default(null),
  recommendedLearningPath: z.string().trim().nullable().default(null),
  recommendedPrerequisites: z.array(z.string().trim()).default([]),
  prerequisiteGraphVersion: z.string().trim().nullable().default(null),
  aiGeneratedInsights: z.string().trim().nullable().default(null),
  lastPredictionDate: z.coerce.date().nullable().default(null),
  lastAIModelVersion: z.string().trim().nullable().default(null),
  confidenceScore: z.coerce.number().int().min(0).max(100).nullable().default(null),
});

export const createCourseSchema = z.object({
  courseId: z.string().trim().regex(/^[A-Z]{2,4}\d{3,6}$/, 'Course ID must be 2-4 uppercase letters followed by 3-6 digits'),
  code: z.string().trim().regex(/^[A-Z]{2,6}\d{0,4}$/, 'Course code must be 2-6 uppercase letters optionally followed by digits'),
  shortCode: z.string().trim().min(1, 'Short code is required').max(10),
  name: z.string().trim().min(3, 'Course name must be at least 3 characters').max(150),
  shortName: z.string().trim().min(2, 'Short name must be at least 2 characters').max(50),
  description: z.string().trim().optional().or(z.literal('')),
  primaryDepartmentId: objectIdSchema,
  supportingDepartmentIds: z.array(objectIdSchema).default([]),
  programType: z.enum(['UG', 'PG', 'DIPLOMA', 'CERTIFICATE', 'PHD']),
  degree: z.enum(['BACHELOR', 'MASTER', 'DOCTORATE', 'DIPLOMA', 'CERTIFICATE']),
  durationYears: z.coerce.number().int().min(1).max(10),
  totalSemesters: z.coerce.number().int().min(1).max(20),
  totalCredits: z.coerce.number().int().min(1).max(500),
  semesters: z.array(semesterSchema).min(1, 'At least one semester is required'),
  curriculumVersion: z.string().trim().regex(/^\d{4}-V\d+$/, 'Curriculum version must be in format YYYY-V#'),
  curriculumHistory: z.array(curriculumHistoryItemSchema).default([]),
  syllabusVersion: z.string().trim().regex(/^\d{4}-V\d+$/, 'Syllabus version must be in format YYYY-V#'),
  intakeCapacity: z.coerce.number().int().min(1).max(5000),
  eligibilityCriteria: z.string().trim().optional().or(z.literal('')),
  admissionProcess: z.string().trim().optional().or(z.literal('')),
  primaryCoordinatorId: objectIdSchema,
  coCoordinatorIds: z.array(objectIdSchema).default([]),
  officeLocation: z.string().trim().optional().or(z.literal('')),
  email: emailSchema,
  phone: phoneSchema,
  status: z.enum(['ACTIVE', 'INACTIVE', 'ARCHIVED']).default('ACTIVE'),
  isActive: z.boolean().default(true),
  tags: z.array(z.string().trim()).optional(),
  remarks: z.string().trim().optional().or(z.literal('')),
  courseOutcomes: z.array(outcomeSchema).default([]),
  programOutcomes: z.array(outcomeSchema).default([]),
  programSpecificOutcomes: z.array(outcomeSchema).default([]),
  graduateAttributes: z.array(outcomeSchema).default([]),
  aiMetadata: aiMetadataSchema.optional(),
  prerequisites: z.array(prerequisiteSchema).default([]),
});

export const updateCourseSchema = createCourseSchema.partial().omit({
  courseId: true,
  code: true,
  primaryDepartmentId: true,
  totalSemesters: true,
  totalCredits: true,
  curriculumVersion: true,
  curriculumHistory: true,
  semesters: true,
  prerequisites: true,
});

export const courseQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  sort: z.string().trim().optional(),
  order: z.enum(['asc', 'desc']).default('desc'),
  search: z.string().trim().optional(),
  departmentId: z.string().trim().optional(),
  programType: z.enum(['UG', 'PG', 'DIPLOMA', 'CERTIFICATE', 'PHD']).optional(),
  degree: z.enum(['BACHELOR', 'MASTER', 'DOCTORATE', 'DIPLOMA', 'CERTIFICATE']).optional(),
  status: z.enum(['ACTIVE', 'INACTIVE', 'ARCHIVED']).optional(),
  isActive: z.coerce.boolean().optional(),
  coordinatorId: z.string().trim().optional(),
  intakeCapacityFrom: z.coerce.number().int().min(1).optional(),
  intakeCapacityTo: z.coerce.number().int().min(1).optional(),
  durationYears: z.coerce.number().int().min(1).optional(),
});

export const bulkImportSchema = z.object({
  courses: z.array(createCourseSchema).min(1).max(500),
});

export const bulkUpdateSchema = z.object({
  ids: z.array(objectIdSchema).min(1).max(500),
  updates: updateCourseSchema,
});

export const assignCoordinatorSchema = z.object({
  primaryCoordinatorId: objectIdSchema,
  coCoordinatorIds: z.array(objectIdSchema).default([]),
});

export const assignPrimaryCoordinatorSchema = z.object({
  primaryCoordinatorId: objectIdSchema,
});

export const addCoCoordinatorSchema = z.object({
  coordinatorId: objectIdSchema,
});

export const updateCurriculumSchema = z.object({
  newVersion: z.string().trim().regex(/^\d{4}-V\d+$/, 'Curriculum version must be in format YYYY-V#'),
  changeReason: z.string().trim().min(1, 'Change reason is required').max(500),
  approvedBy: objectIdSchema,
});

export const updateSemesterSchema = z.object({
  semesters: z.array(semesterSchema).min(1, 'At least one semester is required'),
});

export type CreateCourseInput = z.infer<typeof createCourseSchema>;
export type UpdateCourseInput = z.infer<typeof updateCourseSchema>;
export type CourseQueryInput = z.infer<typeof courseQuerySchema>;
export type BulkImportInput = z.infer<typeof bulkImportSchema>;
export type BulkUpdateInput = z.infer<typeof bulkUpdateSchema>;
export type AssignCoordinatorInput = z.infer<typeof assignCoordinatorSchema>;
export type AssignPrimaryCoordinatorInput = z.infer<typeof assignPrimaryCoordinatorSchema>;
export type AddCoCoordinatorInput = z.infer<typeof addCoCoordinatorSchema>;
export type UpdateCurriculumInput = z.infer<typeof updateCurriculumSchema>;
export type UpdateSemesterInput = z.infer<typeof updateSemesterSchema>;
