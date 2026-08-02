import { Schema, model, type HydratedDocument, type Model } from 'mongoose';
import type { SubjectSchemaType } from './subject.types';

export type SubjectDocument = HydratedDocument<SubjectSchemaType>;
export { SubjectSchemaType };

const subjectSchema = new Schema<SubjectSchemaType>(
  {
    subjectId: { type: String, required: true, unique: true, index: true },
    code: { type: String, required: true, unique: true, uppercase: true, trim: true, index: true },
    name: { type: String, required: true, trim: true, maxlength: 100, index: true },
    shortName: { type: String, trim: true, maxlength: 20 },
    description: { type: String, trim: true, maxlength: 2000 },
    courseId: { type: String, required: true, index: true },
    departmentId: { type: String, required: true, index: true },
    semester: { type: Number, required: true, min: 1, max: 12, index: true },
    academicYear: { type: String, required: true, trim: true, index: true },
    regulationYear: { type: Number, required: true, min: 2000, index: true },
    subjectType: { type: String, required: true, enum: ['THEORY', 'LAB', 'PROJECT', 'SEMINAR', 'ELECTIVE', 'MANDATORY', 'VALUE_ADDED'], index: true },
    category: { type: String, required: true, enum: ['CORE', 'ELECTIVE', 'MINOR', 'CERTIFICATION', 'VALUE_ADDED', 'OPEN'], index: true },
    credits: { type: Number, required: true, min: 1, max: 20 },
    theoryHours: { type: Number, required: true, min: 0, max: 10 },
    tutorialHours: { type: Number, required: true, min: 0, max: 10 },
    practicalHours: { type: Number, required: true, min: 0, max: 10 },
    totalHours: { type: Number, required: true, min: 0 },
    deliveryMode: { type: String, required: true, enum: ['IN_PERSON', 'ONLINE', 'HYBRID', 'SELF_PACED'] },
    primaryFacultyId: { type: String, index: true },
    coFacultyIds: [{ type: String, index: true }],
    syllabusUnits: [
      {
        unitNumber: { type: Number, required: true, min: 1 },
        title: { type: String, required: true, trim: true },
        description: { type: String, trim: true },
        hours: { type: Number, required: true, min: 0, max: 20 },
      },
    ],
    courseOutcomes: [{ type: String, trim: true, index: true }],
    learningObjectives: [{ type: String, trim: true }],
    textbooks: [
      {
        title: { type: String, required: true, trim: true },
        authors: [{ type: String, required: true, trim: true }],
        publisher: { type: String, required: true, trim: true },
        edition: { type: String, trim: true },
        year: { type: Number, required: true, min: 1900 },
        isbn: { type: String, trim: true },
      },
    ],
    referenceBooks: [
      {
        title: { type: String, required: true, trim: true },
        authors: [{ type: String, required: true, trim: true }],
        publisher: { type: String, required: true, trim: true },
        edition: { type: String, trim: true },
        year: { type: Number, required: true, min: 1900 },
        isbn: { type: String, trim: true },
      },
    ],
    internalMarks: { type: Number, required: true, min: 0, max: 100 },
    externalMarks: { type: Number, required: true, min: 0, max: 100 },
    passingMarks: { type: Number, required: true, min: 0, max: 100 },
    gradingScheme: { type: String, required: true, enum: ['ABSOLUTE', 'RELATIVE', 'CURVE', 'COMPETENCY'] },
    attendanceRequirement: { type: Number, required: true, min: 0, max: 100 },
    prerequisiteSubjectIds: [{ type: String, index: true }],
    outcomeMapping: {
      courseOutcomes: [
        {
          id: { type: String, required: true, trim: true },
          description: { type: String, required: true, trim: true },
          level: { type: Number, required: true, min: 1, max: 6 },
          syllabusUnits: [{ type: Number, min: 1 }],
          weightage: { type: Number, required: true, min: 0, max: 100 },
        },
      ],
      programOutcomes: [
        {
          code: { type: String, required: true, trim: true },
          description: { type: String, required: true, trim: true },
          mappingLevel: { type: String, required: true, enum: ['DIRECT', 'INDIRECT', 'NONE'] },
          relatedCourseOutcomes: [{ type: String, required: true, trim: true }],
        },
      ],
      graduateAttributes: [
        {
          code: { type: String, required: true, trim: true },
          name: { type: String, required: true, trim: true },
          description: { type: String, required: true, trim: true },
          mappedProgramOutcomes: [{ type: String, required: true, trim: true }],
          assessmentMethod: { type: String, required: true, enum: ['DIRECT', 'INDIRECT'] },
        },
      ],
    },
    currentVersion: { type: String, trim: true },
    versionHistory: [
      {
        version: { type: String, required: true, trim: true },
        status: { type: String, required: true, enum: ['DRAFT', 'PENDING_APPROVAL', 'APPROVED', 'REJECTED', 'SUPERSEDED'], default: 'DRAFT' },
        changedBy: { type: String, required: true },
        changedAt: { type: Date, required: true },
        approvedBy: { type: String },
        approvedAt: { type: Date },
        rejectedBy: { type: String },
        rejectedAt: { type: Date },
        rejectionReason: { type: String, trim: true, maxlength: 500 },
        changeSummary: { type: String, required: true, trim: true, maxlength: 1000 },
        snapshot: {
          subjectId: { type: String, required: true },
          code: { type: String, required: true },
          name: { type: String, required: true },
          description: { type: String, trim: true },
          courseId: { type: String, required: true },
          departmentId: { type: String, required: true },
          semester: { type: Number, required: true, min: 1 },
          academicYear: { type: String, required: true },
          regulationYear: { type: Number, required: true, min: 2000 },
          subjectType: { type: String, required: true },
          category: { type: String, required: true },
          credits: { type: Number, required: true, min: 1, max: 20 },
          theoryHours: { type: Number, required: true, min: 0, max: 10 },
          tutorialHours: { type: Number, required: true, min: 0, max: 10 },
          practicalHours: { type: Number, required: true, min: 0, max: 10 },
          totalHours: { type: Number, required: true, min: 0 },
          deliveryMode: { type: String, required: true },
          primaryFacultyId: { type: String },
          coFacultyIds: [{ type: String }],
          syllabusUnits: [
            {
              unitNumber: { type: Number, required: true, min: 1 },
              title: { type: String, required: true, trim: true },
              description: { type: String, trim: true },
              hours: { type: Number, required: true, min: 0, max: 20 },
            },
          ],
          courseOutcomes: [{ type: String, trim: true }],
          learningObjectives: [{ type: String, trim: true }],
          textbooks: [
            {
              title: { type: String, required: true, trim: true },
              authors: [{ type: String, required: true, trim: true }],
              publisher: { type: String, required: true, trim: true },
              edition: { type: String, trim: true },
              year: { type: Number, required: true, min: 1900 },
              isbn: { type: String, trim: true },
            },
          ],
          referenceBooks: [
            {
              title: { type: String, required: true, trim: true },
              authors: [{ type: String, required: true, trim: true }],
              publisher: { type: String, required: true, trim: true },
              edition: { type: String, trim: true },
              year: { type: Number, required: true, min: 1900 },
              isbn: { type: String, trim: true },
            },
          ],
          internalMarks: { type: Number, required: true, min: 0, max: 100 },
          externalMarks: { type: Number, required: true, min: 0, max: 100 },
          passingMarks: { type: Number, required: true, min: 0, max: 100 },
          gradingScheme: { type: String, required: true },
          attendanceRequirement: { type: Number, required: true, min: 0, max: 100 },
          prerequisiteSubjectIds: [{ type: String }],
          outcomeMapping: {
            courseOutcomes: [
              {
                id: { type: String, required: true },
                description: { type: String, required: true },
                level: { type: Number, required: true, min: 1, max: 6 },
                syllabusUnits: [{ type: Number, min: 1 }],
                weightage: { type: Number, required: true, min: 0, max: 100 },
              },
            ],
            programOutcomes: [
              {
                code: { type: String, required: true },
                description: { type: String, required: true },
                mappingLevel: { type: String, required: true, enum: ['DIRECT', 'INDIRECT', 'NONE'] },
                relatedCourseOutcomes: [{ type: String, required: true }],
              },
            ],
            graduateAttributes: [
              {
                code: { type: String, required: true },
                name: { type: String, required: true },
                description: { type: String, required: true },
                mappedProgramOutcomes: [{ type: String, required: true }],
                assessmentMethod: { type: String, required: true, enum: ['DIRECT', 'INDIRECT'] },
              },
            ],
          },
          learningResources: [
            {
              id: { type: String, required: true },
              type: { type: String, required: true, enum: ['BOOK', 'VIDEO', 'NPTEL', 'COURSERA', 'GITHUB', 'RESEARCH_PAPER', 'LAB_MANUAL'] },
              title: { type: String, required: true },
              description: { type: String, trim: true },
              url: { type: String, required: true, trim: true },
              author: { type: String, trim: true },
              publisher: { type: String, trim: true },
              year: { type: Number, min: 1900 },
              isbn: { type: String, trim: true },
              duration: { type: String, trim: true },
              language: { type: String, default: 'en' },
              difficultyLevel: { type: String, enum: ['EASY', 'MEDIUM', 'HARD', 'EXPERT'] },
              tags: [{ type: String, trim: true }],
              isRecommended: { type: Boolean, default: false },
              addedBy: { type: String, required: true },
              usageCount: { type: Number, min: 0, default: 0 },
            },
          ],
          documents: [
            {
              id: { type: String, required: true },
              name: { type: String, required: true },
              type: { type: String, required: true, enum: ['SYLLABUS', 'COURSE_PLAN', 'LAB_MANUAL', 'ASSIGNMENT_SPEC', 'EVALUATION_RUBRIC', 'PREVIOUS_PAPER', 'REFERENCE_MATERIAL', 'OTHER'] },
              description: { type: String, trim: true },
              version: { type: String, required: true },
              fileUrl: { type: String, required: true, trim: true },
              fileSize: { type: Number, required: true, min: 0 },
              mimeType: { type: String, required: true },
              uploadedBy: { type: String, required: true },
              uploadedAt: { type: Date, required: true },
              previousVersionId: { type: String, trim: true },
              changeDescription: { type: String, trim: true },
              isCurrent: { type: Boolean, default: true },
              verified: { type: Boolean, default: false },
              verifiedBy: { type: String, trim: true },
              verifiedAt: { type: Date },
              accessLevel: { type: String, enum: ['PUBLIC', 'RESTRICTED', 'CONFIDENTIAL'], default: 'PUBLIC' },
            },
          ],
          aiMetadata: {
            predictedDifficulty: { type: String, enum: ['EASY', 'MEDIUM', 'HARD', 'EXPERT'] },
            predictedPassRate: { type: Number, min: 0, max: 100 },
            averagePerformance: { type: Number, min: 0, max: 100 },
            recommendationScore: { type: Number, min: 0, max: 100 },
            aiInsights: { type: String, trim: true },
            confidenceScore: { type: Number, min: 0, max: 100 },
            lastPredictedAt: { type: Date },
            historicalPassRate: { type: Number, min: 0, max: 100 },
            historicalFailureRate: { type: Number, min: 0, max: 100 },
            averageAttendance: { type: Number, min: 0, max: 100 },
            averageMarks: { type: Number, min: 0, max: 100 },
            difficultyTrend: { type: String, enum: ['INCREASING', 'STABLE', 'DECREASING'] },
            semesterPopularity: { type: Number, min: 0, max: 100 },
            studentFeedbackScore: { type: Number, min: 0, max: 5 },
          },
        },
        isCurrent: { type: Boolean, default: false },
      },
    ],
    documents: [
      {
        id: { type: String, required: true, trim: true },
        name: { type: String, required: true, trim: true, maxlength: 200 },
        type: { type: String, required: true, enum: ['SYLLABUS', 'COURSE_PLAN', 'LAB_MANUAL', 'ASSIGNMENT_SPEC', 'EVALUATION_RUBRIC', 'PREVIOUS_PAPER', 'REFERENCE_MATERIAL', 'OTHER'] },
        description: { type: String, trim: true, maxlength: 500 },
        version: { type: String, required: true, trim: true },
        fileUrl: { type: String, required: true, trim: true },
        fileSize: { type: Number, required: true, min: 0 },
        mimeType: { type: String, required: true, trim: true },
        uploadedBy: { type: String, required: true },
        uploadedAt: { type: Date, required: true },
        previousVersionId: { type: String, trim: true },
        changeDescription: { type: String, trim: true, maxlength: 500 },
        isCurrent: { type: Boolean, required: true, default: true },
        verified: { type: Boolean, required: true, default: false },
        verifiedBy: { type: String, trim: true },
        verifiedAt: { type: Date },
        accessLevel: { type: String, required: true, enum: ['PUBLIC', 'RESTRICTED', 'CONFIDENTIAL'], default: 'PUBLIC' },
      },
    ],
    learningResources: [
      {
        id: { type: String, required: true, trim: true },
        type: { type: String, required: true, enum: ['BOOK', 'VIDEO', 'NPTEL', 'COURSERA', 'GITHUB', 'RESEARCH_PAPER', 'LAB_MANUAL'] },
        title: { type: String, required: true, trim: true, maxlength: 200 },
        description: { type: String, trim: true, maxlength: 1000 },
        url: { type: String, required: true, trim: true },
        author: { type: String, trim: true, maxlength: 200 },
        publisher: { type: String, trim: true, maxlength: 200 },
        year: { type: Number, min: 1900 },
        isbn: { type: String, trim: true, maxlength: 20 },
        duration: { type: String, trim: true, maxlength: 20 },
        language: { type: String, default: 'en', trim: true, maxlength: 10 },
        difficultyLevel: { type: String, enum: ['EASY', 'MEDIUM', 'HARD', 'EXPERT'] },
        tags: [{ type: String, trim: true }],
        isRecommended: { type: Boolean, default: false },
        addedBy: { type: String, required: true },
        addedAt: { type: Date, required: true },
        lastVerifiedAt: { type: Date },
        usageCount: { type: Number, min: 0, default: 0 },
      },
    ],
    predictedDifficulty: { type: String, enum: ['EASY', 'MEDIUM', 'HARD', 'EXPERT'] },
    predictedPassRate: { type: Number, min: 0, max: 100 },
    averagePerformance: { type: Number, min: 0, max: 100 },
    recommendationScore: { type: Number, min: 0, max: 100 },
    aiInsights: { type: String, trim: true, maxlength: 2000 },
    lastPredictedAt: { type: Date },
    confidenceScore: { type: Number, min: 0, max: 100 },
    historicalPassRate: { type: Number, min: 0, max: 100 },
    historicalFailureRate: { type: Number, min: 0, max: 100 },
    averageAttendance: { type: Number, min: 0, max: 100 },
    averageMarks: { type: Number, min: 0, max: 100 },
    difficultyTrend: { type: String, enum: ['INCREASING', 'STABLE', 'DECREASING'] },
    semesterPopularity: { type: Number, min: 0, max: 100 },
    studentFeedbackScore: { type: Number, min: 0, max: 5 },
    subjectStatistics: {
      averageAttendance: { type: Number, min: 0, max: 100 },
      averageMarks: { type: Number, min: 0, max: 100 },
      passRate: { type: Number, min: 0, max: 100 },
      failureRate: { type: Number, min: 0, max: 100 },
      backlogRate: { type: Number, min: 0, max: 100 },
      completionRate: { type: Number, min: 0, max: 100 },
      studentCount: { type: Number, min: 0 },
      lastCalculatedAt: { type: Date },
    },
    status: { type: String, required: true, enum: ['ACTIVE', 'INACTIVE', 'ARCHIVED', 'DRAFT'], default: 'ACTIVE', index: true },
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

subjectSchema.index({ courseId: 1, code: 1 }, { unique: true });
subjectSchema.index({ courseId: 1, name: 1, semester: 1 }, { unique: true });
subjectSchema.index({ departmentId: 1, isActive: 1 });
subjectSchema.index({ courseId: 1, semester: 1 });
subjectSchema.index({ primaryFacultyId: 1, isActive: 1 });
subjectSchema.index({ coFacultyIds: 1, isActive: 1 });
subjectSchema.index({ regulationYear: 1, isActive: 1 });
subjectSchema.index({ subjectType: 1, category: 1 });
subjectSchema.index({ status: 1, isActive: 1 });
subjectSchema.index({ academicYear: 1, semester: 1 });
subjectSchema.index({ courseId: 1, subjectType: 1 });
subjectSchema.index({ 'versionHistory.version': 1 });
subjectSchema.index({ 'versionHistory.status': 1 });
subjectSchema.index({ 'documents.type': 1, 'documents.isCurrent': 1 });
subjectSchema.index({ 'learningResources.type': 1 });
subjectSchema.index({ 'outcomeMapping.courseOutcomes.id': 1 });
subjectSchema.index({ 'outcomeMapping.programOutcomes.code': 1 });
subjectSchema.index({ 'outcomeMapping.graduateAttributes.code': 1 });
subjectSchema.index({ 'learningResources.tags': 1 });
subjectSchema.index({ 'subjectStatistics.lastCalculatedAt': 1 });
subjectSchema.index({ createdAt: -1 });
subjectSchema.index({ deletedAt: 1 });
subjectSchema.index({ isActive: 1, status: 1 });

subjectSchema.index({
  name: 'text',
  description: 'text',
  'syllabusUnits.title': 'text',
  courseOutcomes: 'text',
  learningObjectives: 'text',
  'outcomeMapping.courseOutcomes.description': 'text',
  'outcomeMapping.programOutcomes.description': 'text',
  'outcomeMapping.graduateAttributes.description': 'text',
  'learningResources.title': 'text',
  'learningResources.description': 'text',
  'learningResources.tags': 'text',
  'documents.name': 'text',
  aiInsights: 'text',
});

export const SubjectModel: Model<SubjectSchemaType> = model<SubjectSchemaType>('Subject', subjectSchema);
