import { Schema, model, type HydratedDocument, type Model } from 'mongoose';
import type {
  CourseStatus,
  ProgramType,
  Degree,
  CourseOutcome,
  ProgramOutcome,
  ProgramSpecificOutcome,
  GraduateAttribute,
  Semester,
  CurriculumHistoryItem,
  Prerequisite,
  AiMetadata,
} from './course.types';

export interface CourseSchemaType {
  courseId: string;
  code: string;
  shortCode: string;
  name: string;
  shortName: string;
  description?: string;
  primaryDepartmentId: string;
  supportingDepartmentIds: string[];
  programType: ProgramType;
  degree: Degree;
  durationYears: number;
  totalSemesters: number;
  totalCredits: number;
  semesters: Semester[];
  curriculumVersion: string;
  curriculumHistory: CurriculumHistoryItem[];
  syllabusVersion: string;
  intakeCapacity: number;
  currentStrength?: number;
  eligibilityCriteria?: string;
  admissionProcess?: string;
  primaryCoordinatorId: string;
  coCoordinatorIds: string[];
  officeLocation?: string;
  email: string;
  phone: string;
  status: CourseStatus;
  isActive: boolean;
  tags?: string[];
  remarks?: string;
  courseOutcomes: CourseOutcome[];
  programOutcomes: ProgramOutcome[];
  programSpecificOutcomes: ProgramSpecificOutcome[];
  graduateAttributes: GraduateAttribute[];
  aiMetadata?: AiMetadata;
  prerequisites: Prerequisite[];
  createdBy: string;
  updatedBy: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
  deletedBy?: string;
}

export type CourseDocument = HydratedDocument<CourseSchemaType>;

const courseSchema = new Schema<CourseSchemaType>(
  {
    courseId: { type: String, required: true, unique: true, index: true },
    code: { type: String, required: true, unique: true, uppercase: true, trim: true, index: true },
    shortCode: { type: String, required: true, trim: true, maxlength: 10 },
    name: { type: String, required: true, trim: true, maxlength: 150 },
    shortName: { type: String, required: true, trim: true, maxlength: 50 },
    description: { type: String, trim: true },
    primaryDepartmentId: { type: String, required: true, index: true },
    supportingDepartmentIds: [{ type: String, index: true }],
    programType: { type: String, required: true, enum: ['UG', 'PG', 'DIPLOMA', 'CERTIFICATE', 'PHD'], index: true },
    degree: { type: String, required: true, enum: ['BACHELOR', 'MASTER', 'DOCTORATE', 'DIPLOMA', 'CERTIFICATE'], index: true },
    durationYears: { type: Number, required: true, min: 1, max: 10 },
    totalSemesters: { type: Number, required: true, min: 1, max: 20 },
    totalCredits: { type: Number, required: true, min: 1, max: 500 },
    semesters: [
      {
        semesterNumber: { type: Number, required: true, min: 1, max: 20 },
        credits: { type: Number, required: true, min: 0, max: 500 },
        electiveCredits: { type: Number, required: true, min: 0, max: 500 },
        mandatoryCredits: { type: Number, required: true, min: 0, max: 500 },
        theoryCredits: { type: Number, required: true, min: 0, max: 500 },
        practicalCredits: { type: Number, required: true, min: 0, max: 500 },
        labCredits: { type: Number, required: true, min: 0, max: 500 },
        projectCredits: { type: Number, required: true, min: 0, max: 500 },
        internshipCredits: { type: Number, required: true, min: 0, max: 500 },
        subjects: [
          {
            subjectId: { type: String, required: true },
            isElective: { type: Boolean, required: true, default: false },
          },
        ],
        isActive: { type: Boolean, required: true, default: true },
      },
    ],
    curriculumVersion: { type: String, required: true, trim: true, index: true },
    curriculumHistory: [
      {
        version: { type: String, required: true, trim: true },
        status: { type: String, required: true, enum: ['DRAFT', 'REVIEW', 'APPROVED', 'ACTIVE', 'RETIRED'], default: 'DRAFT' },
        effectiveFrom: { type: Date, required: true },
        effectiveTo: { type: Date },
        changedBy: { type: String, required: true },
        changeReason: { type: String, required: true, trim: true, maxlength: 500 },
        approvedBy: { type: String, required: true },
        approvedAt: { type: Date, required: true },
        publishedAt: { type: Date },
      },
    ],
    syllabusVersion: { type: String, required: true, trim: true },
    intakeCapacity: { type: Number, required: true, min: 1, max: 5000 },
    currentStrength: { type: Number, min: 0 },
    eligibilityCriteria: { type: String, trim: true },
    admissionProcess: { type: String, trim: true },
    primaryCoordinatorId: { type: String, required: true, index: true },
    coCoordinatorIds: [{ type: String, index: true }],
    officeLocation: { type: String, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
    phone: { type: String, required: true, unique: true, trim: true, index: true },
    status: { type: String, required: true, enum: ['ACTIVE', 'INACTIVE', 'ARCHIVED'], default: 'ACTIVE', index: true },
    isActive: { type: Boolean, required: true, default: true, index: true },
    tags: [{ type: String, trim: true, index: true }],
    remarks: { type: String, trim: true },
    courseOutcomes: [
      {
        code: { type: String, required: true, trim: true, maxlength: 20 },
        title: { type: String, required: true, trim: true, maxlength: 200 },
        description: { type: String, required: true, trim: true, maxlength: 1000 },
        attainmentTarget: { type: Number, required: true, min: 0, max: 100 },
        assessmentMethods: [{ type: String, required: true, enum: ['EXAM', 'PROJECT', 'ASSIGNMENT', 'LAB', 'QUIZ', 'PRESENTATION', 'INTERNAL'] }],
      },
    ],
    programOutcomes: [
      {
        code: { type: String, required: true, trim: true, maxlength: 20 },
        title: { type: String, required: true, trim: true, maxlength: 200 },
        description: { type: String, required: true, trim: true, maxlength: 1000 },
        attainmentTarget: { type: Number, required: true, min: 0, max: 100 },
        assessmentMethods: [{ type: String, required: true, enum: ['EXAM', 'PROJECT', 'ASSIGNMENT', 'LAB', 'QUIZ', 'PRESENTATION', 'INTERNAL'] }],
      },
    ],
    programSpecificOutcomes: [
      {
        code: { type: String, required: true, trim: true, maxlength: 20 },
        title: { type: String, required: true, trim: true, maxlength: 200 },
        description: { type: String, required: true, trim: true, maxlength: 1000 },
        attainmentTarget: { type: Number, required: true, min: 0, max: 100 },
        assessmentMethods: [{ type: String, required: true, enum: ['EXAM', 'PROJECT', 'ASSIGNMENT', 'LAB', 'QUIZ', 'PRESENTATION', 'INTERNAL'] }],
      },
    ],
    graduateAttributes: [
      {
        code: { type: String, required: true, trim: true, maxlength: 20 },
        title: { type: String, required: true, trim: true, maxlength: 200 },
        description: { type: String, required: true, trim: true, maxlength: 1000 },
        attainmentTarget: { type: Number, required: true, min: 0, max: 100 },
        assessmentMethods: [{ type: String, required: true, enum: ['EXAM', 'PROJECT', 'ASSIGNMENT', 'LAB', 'QUIZ', 'PRESENTATION', 'INTERNAL'] }],
      },
    ],
    aiMetadata: {
      predictedDifficulty: { type: String, enum: ['EASY', 'MEDIUM', 'HARD'] },
      predictedDropoutRisk: { type: Number, min: 0, max: 100 },
      predictedPlacementRate: { type: Number, min: 0, max: 100 },
      averagePassRate: { type: Number, min: 0, max: 100 },
      historicalDifficultyTrend: { type: String, trim: true },
      recommendedLearningPath: { type: String, trim: true },
      recommendedPrerequisites: [{ type: String, trim: true }],
      prerequisiteGraphVersion: { type: String, trim: true },
      aiGeneratedInsights: { type: String, trim: true },
      lastPredictionDate: { type: Date },
      lastAIModelVersion: { type: String, trim: true },
      confidenceScore: { type: Number, min: 0, max: 100 },
    },
    prerequisites: [
      {
        prerequisiteCourseId: { type: String, required: true },
        minimumGrade: { type: String, required: true, trim: true, maxlength: 5 },
        mandatory: { type: Boolean, required: true, default: true },
        remarks: { type: String, trim: true },
      },
    ],
    createdBy: { type: String, required: true },
    updatedBy: { type: String, required: true },
    deletedAt: { type: Date, index: true },
    deletedBy: { type: String },
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

courseSchema.index({ primaryDepartmentId: 1, code: 1 }, { unique: true });
courseSchema.index({ primaryDepartmentId: 1, programType: 1, degree: 1 });
courseSchema.index({ primaryDepartmentId: 1, isActive: 1, status: 1 });
courseSchema.index({ primaryCoordinatorId: 1, isActive: 1 });
courseSchema.index({ status: 1, deletedAt: 1 });
courseSchema.index({ 'curriculumHistory.version': 1 });
courseSchema.index({ 'semesters.semesterNumber': 1 });
courseSchema.index({ name: 'text', code: 'text', description: 'text', shortName: 'text' });
courseSchema.index({ createdAt: -1 });

export const CourseModel: Model<CourseSchemaType> = model<CourseSchemaType>('Course', courseSchema);
