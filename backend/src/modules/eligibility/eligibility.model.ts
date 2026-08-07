import { Schema, model, type HydratedDocument, type Model } from 'mongoose';
import type { EligibilitySchemaType } from './eligibility.types';

export type EligibilityDocument = HydratedDocument<EligibilitySchemaType>;
export { EligibilitySchemaType };

/**
 * Mongoose schema for the Eligibility collection.
 *
 * Includes:
 * - Soft delete via `deletedAt` and `isActive`
 * - Audit fields (`createdBy`, `updatedBy`, `deletedBy`, `createdAt`, `updatedAt`)
 * - Enterprise indexes for query performance
 * - Text search on eligibility and applicant fields
 */
const eligibilitySchema = new Schema<EligibilitySchemaType>(
  {
    eligibilityId: { type: String, required: true, unique: true, index: true },
    applicantId: { type: String, required: true, index: true },
    applicationNumber: { type: String, required: true, uppercase: true, trim: true, index: true },
    status: { type: String, required: true, enum: ['PENDING', 'PROCESSING', 'ELIGIBLE', 'NOT_ELIGIBLE', 'CONDITIONAL', 'MANUAL_REVIEW_REQUIRED'], default: 'PENDING', index: true },
    academicRules: [
      {
        ruleId: { type: String, required: true, trim: true },
        ruleName: { type: String, required: true, trim: true, maxlength: 200 },
        description: { type: String, trim: true, maxlength: 500 },
        minimumPercentage: { type: Number, min: 0, max: 100, default: 0 },
        minimumCGPA: { type: Number, min: 0, max: 10, default: 0 },
        allowedQualifications: [{ type: String, trim: true }],
        mandatorySubjects: [{ type: String, trim: true }],
        maxGapYears: { type: Number, min: 0, default: 2 },
        isActive: { type: Boolean, default: true },
      },
    ],
    categoryRules: [
      {
        ruleId: { type: String, required: true, trim: true },
        ruleName: { type: String, required: true, trim: true, maxlength: 200 },
        description: { type: String, trim: true, maxlength: 500 },
        category: { type: String, required: true, trim: true, maxlength: 50 },
        minimumPercentage: { type: Number, min: 0, max: 100, default: 0 },
        reservationPercentage: { type: Number, min: 0, max: 100, default: 0 },
        allowedCourses: [{ type: String, trim: true }],
        isActive: { type: Boolean, default: true },
      },
    ],
    courseRules: [
      {
        ruleId: { type: String, required: true, trim: true },
        ruleName: { type: String, required: true, trim: true, maxlength: 200 },
        description: { type: String, trim: true, maxlength: 500 },
        courseId: { type: String, required: true, trim: true },
        departmentId: { type: String, required: true, trim: true },
        minimumPercentage: { type: Number, min: 0, max: 100, default: 0 },
        minimumEntranceScore: { type: Number, min: 0, max: 100, default: 0 },
        maxApplicants: { type: Number, min: 0, default: 0 },
        isActive: { type: Boolean, default: true },
      },
    ],
    entranceExamRules: [
      {
        ruleId: { type: String, required: true, trim: true },
        ruleName: { type: String, required: true, trim: true, maxlength: 200 },
        description: { type: String, trim: true, maxlength: 500 },
        examName: { type: String, required: true, trim: true, maxlength: 200 },
        minimumScore: { type: Number, min: 0, max: 100, default: 0 },
        maximumScore: { type: Number, min: 0, max: 100, default: 100 },
        qualifyingPercentage: { type: Number, min: 0, max: 100, default: 0 },
        isActive: { type: Boolean, default: true },
      },
    ],
    reservationRules: [
      {
        ruleId: { type: String, required: true, trim: true },
        ruleName: { type: String, required: true, trim: true, maxlength: 200 },
        description: { type: String, trim: true, maxlength: 500 },
        category: { type: String, required: true, trim: true, maxlength: 50 },
        reservationPercentage: { type: Number, min: 0, max: 100, default: 0 },
        applicableCourses: [{ type: String, trim: true }],
        isActive: { type: Boolean, default: true },
      },
    ],
    checkResults: [
      {
        ruleType: { type: String, required: true, enum: ['ACADEMIC', 'CATEGORY', 'COURSE', 'ENTRANCE_EXAM', 'RESERVATION', 'CUSTOM'] },
        ruleId: { type: String, required: true, trim: true },
        ruleName: { type: String, required: true, trim: true, maxlength: 200 },
        passed: { type: Boolean, required: true, default: false },
        actualValue: { type: Schema.Types.Mixed, required: true },
        expectedValue: { type: Schema.Types.Mixed, required: true },
        operator: { type: String, required: true, enum: ['EQUALS', 'NOT_EQUALS', 'GREATER_THAN', 'LESS_THAN', 'GREATER_THAN_OR_EQUALS', 'LESS_THAN_OR_EQUALS', 'IN', 'NOT_IN', 'BETWEEN', 'CONTAINS'] },
        remarks: { type: String, trim: true, maxlength: 500 },
      },
    ],
    aiConfidence: {
      level: { type: String, enum: ['LOW', 'MEDIUM', 'HIGH', 'VERY_HIGH'], default: 'MEDIUM' },
      score: { type: Number, min: 0, max: 100, default: 0 },
      factors: [{ type: String, trim: true }],
      generatedAt: { type: Date },
      modelVersion: { type: String, trim: true, maxlength: 50 },
    },
    reasonGeneration: {
      primaryReason: { type: String, trim: true, maxlength: 500 },
      secondaryReasons: [{ type: String, trim: true }],
      ruleViolations: [{ type: String, trim: true }],
      recommendations: [{ type: String, trim: true }],
      generatedAt: { type: Date },
    },
    recommendation: {
      recommendedCourseId: { type: String, trim: true },
      recommendedDepartmentId: { type: String, trim: true },
      alternativeCourses: [{ type: String, trim: true }],
      confidence: { type: Number, min: 0, max: 100, default: 0 },
      reasoning: { type: String, trim: true, maxlength: 1000 },
    },
    decisionHistory: [
      {
        decisionId: { type: String, required: true, trim: true },
        decision: { type: String, required: true, enum: ['PENDING', 'APPROVED', 'REJECTED', 'CONDITIONAL', 'REVIEW'] },
        reviewedBy: { type: String, required: true, trim: true },
        remarks: { type: String, trim: true, maxlength: 1000 },
        createdAt: { type: Date, required: true },
      },
    ],
    isActive: { type: Boolean, required: true, default: true, index: true },
    archivedAt: { type: Date },
    archivedBy: { type: String, trim: true },
    createdBy: { type: String, required: true },
    updatedBy: { type: String, required: true },
    deletedBy: { type: String },
    deletedAt: { type: Date, index: true },
  },
  {
    timestamps: true,
    versionKey: false,
    toJSON: {
      transform: (_doc, ret: Record<string, unknown>) => {
        ret.id = ret._id;
        delete ret._id;
        return ret;
      },
    },
  },
);

/**
 * Compound and performance indexes.
 */
eligibilitySchema.index({ applicantId: 1, status: 1 });
eligibilitySchema.index({ applicationNumber: 1, status: 1 });
eligibilitySchema.index({ status: 1, createdAt: -1 });
eligibilitySchema.index({ createdAt: -1 });
eligibilitySchema.index({ deletedAt: 1 });
eligibilitySchema.index({ isActive: 1, status: 1 });

/**
 * Text index for global search across eligibility and applicant fields.
 */
eligibilitySchema.index(
  {
    applicationNumber: 'text',
    'reasonGeneration.primaryReason': 'text',
    'reasonGeneration.recommendations': 'text',
  },
  {
    weights: {
      applicationNumber: 10,
      'reasonGeneration.primaryReason': 5,
      'reasonGeneration.recommendations': 5,
    },
  },
);

export const EligibilityModel: Model<EligibilitySchemaType> = model<EligibilitySchemaType>('Eligibility', eligibilitySchema);
