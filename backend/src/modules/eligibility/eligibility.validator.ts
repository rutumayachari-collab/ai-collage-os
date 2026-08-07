import { z } from 'zod';
import { objectIdSchema } from '../../shared/validators';

/**
 * Academic rule schema.
 */
export const academicRuleSchema = z.object({
  ruleId: z.string().trim().min(1, 'Rule ID is required'),
  ruleName: z.string().trim().min(1, 'Rule name is required').max(200),
  description: z.string().trim().max(500).optional().or(z.literal('')),
  minimumPercentage: z.coerce.number().int().min(0).max(100).default(0),
  minimumCGPA: z.coerce.number().int().min(0).max(10).default(0),
  allowedQualifications: z.array(z.string().trim()).default([]),
  mandatorySubjects: z.array(z.string().trim()).default([]),
  maxGapYears: z.coerce.number().int().min(0).default(2),
  isActive: z.boolean().default(true),
});

/**
 * Category rule schema.
 */
export const categoryRuleSchema = z.object({
  ruleId: z.string().trim().min(1, 'Rule ID is required'),
  ruleName: z.string().trim().min(1, 'Rule name is required').max(200),
  description: z.string().trim().max(500).optional().or(z.literal('')),
  category: z.string().trim().min(1, 'Category is required').max(50),
  minimumPercentage: z.coerce.number().int().min(0).max(100).default(0),
  reservationPercentage: z.coerce.number().int().min(0).max(100).default(0),
  allowedCourses: z.array(z.string().trim()).default([]),
  isActive: z.boolean().default(true),
});

/**
 * Course rule schema.
 */
export const courseRuleSchema = z.object({
  ruleId: z.string().trim().min(1, 'Rule ID is required'),
  ruleName: z.string().trim().min(1, 'Rule name is required').max(200),
  description: z.string().trim().max(500).optional().or(z.literal('')),
  courseId: z.string().trim().min(1, 'Course ID is required'),
  departmentId: z.string().trim().min(1, 'Department ID is required'),
  minimumPercentage: z.coerce.number().int().min(0).max(100).default(0),
  minimumEntranceScore: z.coerce.number().int().min(0).max(100).default(0),
  maxApplicants: z.coerce.number().int().min(0).default(0),
  isActive: z.boolean().default(true),
});

/**
 * Entrance exam rule schema.
 */
export const entranceExamRuleSchema = z.object({
  ruleId: z.string().trim().min(1, 'Rule ID is required'),
  ruleName: z.string().trim().min(1, 'Rule name is required').max(200),
  description: z.string().trim().max(500).optional().or(z.literal('')),
  examName: z.string().trim().min(1, 'Exam name is required').max(200),
  minimumScore: z.coerce.number().int().min(0).max(100).default(0),
  maximumScore: z.coerce.number().int().min(0).max(100).default(100),
  qualifyingPercentage: z.coerce.number().int().min(0).max(100).default(0),
  isActive: z.boolean().default(true),
});

/**
 * Reservation rule schema.
 */
export const reservationRuleSchema = z.object({
  ruleId: z.string().trim().min(1, 'Rule ID is required'),
  ruleName: z.string().trim().min(1, 'Rule name is required').max(200),
  description: z.string().trim().max(500).optional().or(z.literal('')),
  category: z.string().trim().min(1, 'Category is required').max(50),
  reservationPercentage: z.coerce.number().int().min(0).max(100).default(0),
  applicableCourses: z.array(z.string().trim()).default([]),
  isActive: z.boolean().default(true),
});

/**
 * AI confidence schema.
 */
export const aiConfidenceSchema = z.object({
  level: z.enum(['LOW', 'MEDIUM', 'HIGH', 'VERY_HIGH']).default('MEDIUM'),
  score: z.coerce.number().int().min(0).max(100).default(0),
  factors: z.array(z.string().trim()).default([]),
  generatedAt: z.coerce.date().default(new Date()),
  modelVersion: z.string().trim().max(50).optional().or(z.literal('')),
});

/**
 * Reason generation schema.
 */
export const reasonGenerationSchema = z.object({
  primaryReason: z.string().trim().min(1, 'Primary reason is required').max(500),
  secondaryReasons: z.array(z.string().trim()).default([]),
  ruleViolations: z.array(z.string().trim()).default([]),
  recommendations: z.array(z.string().trim()).default([]),
  generatedAt: z.coerce.date().default(new Date()),
});

/**
 * Recommendation schema.
 */
export const recommendationSchema = z.object({
  recommendedCourseId: z.string().trim().optional().or(z.literal('')),
  recommendedDepartmentId: z.string().trim().optional().or(z.literal('')),
  alternativeCourses: z.array(z.string().trim()).default([]),
  confidence: z.coerce.number().int().min(0).max(100).default(0),
  reasoning: z.string().trim().max(1000).optional().or(z.literal('')),
});

/**
 * Decision history entry schema.
 */
export const decisionHistoryEntrySchema = z.object({
  decisionId: z.string().trim().min(1, 'Decision ID is required'),
  decision: z.enum(['PENDING', 'APPROVED', 'REJECTED', 'CONDITIONAL', 'REVIEW']),
  reviewedBy: z.string().trim().min(1, 'Reviewed by is required'),
  remarks: z.string().trim().max(1000).optional().or(z.literal('')),
});

/**
 * Create eligibility schema.
 */
export const createEligibilitySchema = z.object({
  applicantId: objectIdSchema,
  applicationNumber: z.string().trim().regex(/^APP-\d{4}-\d{6}$/, 'Application number must follow format APP-YYYY-NNNNNN'),
  status: z.enum(['PENDING', 'PROCESSING', 'ELIGIBLE', 'NOT_ELIGIBLE', 'CONDITIONAL', 'MANUAL_REVIEW_REQUIRED']).default('PENDING'),
  academicRules: z.array(academicRuleSchema).default([]),
  categoryRules: z.array(categoryRuleSchema).default([]),
  courseRules: z.array(courseRuleSchema).default([]),
  entranceExamRules: z.array(entranceExamRuleSchema).default([]),
  reservationRules: z.array(reservationRuleSchema).default([]),
  checkResults: z.array(z.object({
    ruleType: z.enum(['ACADEMIC', 'CATEGORY', 'COURSE', 'ENTRANCE_EXAM', 'RESERVATION', 'CUSTOM']),
    ruleId: z.string().trim().min(1, 'Rule ID is required'),
    ruleName: z.string().trim().min(1, 'Rule name is required').max(200),
    passed: z.boolean(),
    actualValue: z.union([z.number(), z.string()]),
    expectedValue: z.union([z.number(), z.string()]),
    operator: z.enum(['EQUALS', 'NOT_EQUALS', 'GREATER_THAN', 'LESS_THAN', 'GREATER_THAN_OR_EQUALS', 'LESS_THAN_OR_EQUALS', 'IN', 'NOT_IN', 'BETWEEN', 'CONTAINS']),
    remarks: z.string().trim().max(500).optional().or(z.literal('')),
  })).default([]),
});

/**
 * Update eligibility schema.
 */
export const updateEligibilitySchema = z.object({
  status: z.enum(['PENDING', 'PROCESSING', 'ELIGIBLE', 'NOT_ELIGIBLE', 'CONDITIONAL', 'MANUAL_REVIEW_REQUIRED']).optional(),
  academicRules: z.array(academicRuleSchema).default([]),
  categoryRules: z.array(categoryRuleSchema).default([]),
  courseRules: z.array(courseRuleSchema).default([]),
  entranceExamRules: z.array(entranceExamRuleSchema).default([]),
  reservationRules: z.array(reservationRuleSchema).default([]),
  checkResults: z.array(z.object({
    ruleType: z.enum(['ACADEMIC', 'CATEGORY', 'COURSE', 'ENTRANCE_EXAM', 'RESERVATION', 'CUSTOM']),
    ruleId: z.string().trim().min(1, 'Rule ID is required'),
    ruleName: z.string().trim().min(1, 'Rule name is required').max(200),
    passed: z.boolean(),
    actualValue: z.union([z.number(), z.string()]),
    expectedValue: z.union([z.number(), z.string()]),
    operator: z.enum(['EQUALS', 'NOT_EQUALS', 'GREATER_THAN', 'LESS_THAN', 'GREATER_THAN_OR_EQUALS', 'LESS_THAN_OR_EQUALS', 'IN', 'NOT_IN', 'BETWEEN', 'CONTAINS']),
    remarks: z.string().trim().max(500).optional().or(z.literal('')),
  })).default([]),
  aiConfidence: aiConfidenceSchema.optional(),
  reasonGeneration: reasonGenerationSchema.optional(),
  recommendation: recommendationSchema.optional(),
});

/**
 * Eligibility query schema.
 */
export const eligibilityQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  sort: z.string().trim().optional(),
  order: z.enum(['asc', 'desc']).default('desc'),
  search: z.string().trim().optional(),
  status: z.enum(['PENDING', 'PROCESSING', 'ELIGIBLE', 'NOT_ELIGIBLE', 'CONDITIONAL', 'MANUAL_REVIEW_REQUIRED']).optional(),
  applicantId: z.string().trim().optional(),
  applicationNumber: z.string().trim().optional(),
  isActive: z.coerce.boolean().optional(),
});

/**
 * Run eligibility check schema.
 */
export const runEligibilityCheckSchema = z.object({
  applicantId: objectIdSchema,
  applicationNumber: z.string().trim().regex(/^APP-\d{4}-\d{6}$/, 'Application number must follow format APP-YYYY-NNNNNN'),
  ruleTypes: z.array(z.enum(['ACADEMIC', 'CATEGORY', 'COURSE', 'ENTRANCE_EXAM', 'RESERVATION', 'CUSTOM'])).default(['ACADEMIC', 'CATEGORY', 'COURSE', 'ENTRANCE_EXAM', 'RESERVATION']),
});

/**
 * Bulk import eligibility schema.
 */
export const bulkImportEligibilitySchema = z.object({
  eligibilities: z.array(createEligibilitySchema).min(1).max(500),
});

export type AcademicRuleInput = z.infer<typeof academicRuleSchema>;
export type CategoryRuleInput = z.infer<typeof categoryRuleSchema>;
export type CourseRuleInput = z.infer<typeof courseRuleSchema>;
export type EntranceExamRuleInput = z.infer<typeof entranceExamRuleSchema>;
export type ReservationRuleInput = z.infer<typeof reservationRuleSchema>;
export type AIConfidenceInput = z.infer<typeof aiConfidenceSchema>;
export type ReasonGenerationInput = z.infer<typeof reasonGenerationSchema>;
export type RecommendationInput = z.infer<typeof recommendationSchema>;
export type DecisionHistoryEntryInput = z.infer<typeof decisionHistoryEntrySchema>;
export type CreateEligibilityInput = z.infer<typeof createEligibilitySchema>;
export type UpdateEligibilityInput = z.infer<typeof updateEligibilitySchema>;
export type EligibilityQueryInput = z.infer<typeof eligibilityQuerySchema>;
export type RunEligibilityCheckInput = z.infer<typeof runEligibilityCheckSchema>;
export type BulkImportEligibilityInput = z.infer<typeof bulkImportEligibilitySchema>;
