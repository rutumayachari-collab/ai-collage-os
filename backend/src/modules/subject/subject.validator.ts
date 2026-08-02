import { z } from 'zod';
import { objectIdSchema } from '../../shared/validators';

export const syllabusUnitSchema = z.object({
  unitNumber: z.coerce.number().int().min(1),
  title: z.string().trim().min(1, 'Title is required'),
  description: z.string().trim().optional().or(z.literal('')),
  hours: z.coerce.number().int().min(0).max(20),
});

export const textbookSchema = z.object({
  title: z.string().trim().min(1, 'Title is required'),
  authors: z.array(z.string().trim()).min(1, 'At least one author is required'),
  publisher: z.string().trim().min(1, 'Publisher is required'),
  edition: z.string().trim().optional().or(z.literal('')),
  year: z.coerce.number().int().min(1900).max(new Date().getFullYear() + 1),
  isbn: z.string().trim().optional().or(z.literal('')),
});

export const courseOutcomeSchema = z.object({
  id: z.string().trim().regex(/^CO\d+$/, 'Course outcome ID must follow format CO1, CO2, etc.'),
  description: z.string().trim().min(10, 'Description must be at least 10 characters').max(500),
  level: z.coerce.number().int().min(1).max(6),
  syllabusUnits: z.array(z.coerce.number().int().min(1)).min(1, 'At least one syllabus unit is required'),
  weightage: z.coerce.number().int().min(0).max(100),
});

export const programOutcomeSchema = z.object({
  code: z.string().trim().regex(/^PO\d+$/, 'Program outcome code must follow format PO1, PO2, etc.'),
  description: z.string().trim().min(10, 'Description must be at least 10 characters').max(500),
  mappingLevel: z.enum(['DIRECT', 'INDIRECT', 'NONE']),
  relatedCourseOutcomes: z.array(z.string().trim()).min(1, 'At least one related course outcome is required'),
});

export const graduateAttributeSchema = z.object({
  code: z.string().trim().regex(/^GA\d+$/, 'Graduate attribute code must follow format GA1, GA2, etc.'),
  name: z.string().trim().min(2, 'Name must be at least 2 characters').max(100),
  description: z.string().trim().min(10, 'Description must be at least 10 characters').max(500),
  mappedProgramOutcomes: z.array(z.string().trim()).min(1, 'At least one mapped program outcome is required'),
  assessmentMethod: z.enum(['DIRECT', 'INDIRECT']),
});

export const outcomeMappingSchema = z.object({
  courseOutcomes: z.array(courseOutcomeSchema).min(1, 'At least one course outcome is required'),
  programOutcomes: z.array(programOutcomeSchema).min(1, 'At least one program outcome is required'),
  graduateAttributes: z.array(graduateAttributeSchema).min(1, 'At least one graduate attribute is required'),
});

export const subjectVersionSchema = z.object({
  version: z.string().trim().regex(/^\d+\.\d+$/, 'Version must follow semantic versioning (e.g., 1.0)'),
  status: z.enum(['DRAFT', 'PENDING_APPROVAL', 'APPROVED', 'REJECTED', 'SUPERSEDED']),
  changedBy: objectIdSchema,
  changeSummary: z.string().trim().min(1, 'Change summary is required').max(1000),
  snapshot: z.object({
    subjectId: z.string().trim(),
    code: z.string().trim(),
    name: z.string().trim(),
    description: z.string().trim().optional().or(z.literal('')),
    courseId: z.string().trim(),
    departmentId: z.string().trim(),
    semester: z.coerce.number().int().min(1),
    academicYear: z.string().trim(),
    regulationYear: z.coerce.number().int().min(2000),
    subjectType: z.enum(['THEORY', 'LAB', 'PROJECT', 'SEMINAR', 'ELECTIVE', 'MANDATORY', 'VALUE_ADDED']),
    category: z.enum(['CORE', 'ELECTIVE', 'MINOR', 'CERTIFICATION', 'VALUE_ADDED', 'OPEN']),
    credits: z.coerce.number().int().min(1).max(20),
    theoryHours: z.coerce.number().int().min(0).max(10),
    tutorialHours: z.coerce.number().int().min(0).max(10),
    practicalHours: z.coerce.number().int().min(0).max(10),
    totalHours: z.coerce.number().int().min(0),
    deliveryMode: z.enum(['IN_PERSON', 'ONLINE', 'HYBRID', 'SELF_PACED']),
    primaryFacultyId: z.string().trim().optional().or(z.literal('')),
    coFacultyIds: z.array(z.string().trim()).default([]),
    syllabusUnits: z.array(syllabusUnitSchema).default([]),
    courseOutcomes: z.array(z.string().trim()).default([]),
    learningObjectives: z.array(z.string().trim()).default([]),
    textbooks: z.array(textbookSchema).default([]),
    referenceBooks: z.array(textbookSchema).default([]),
    internalMarks: z.coerce.number().int().min(0).max(100),
    externalMarks: z.coerce.number().int().min(0).max(100),
    passingMarks: z.coerce.number().int().min(0).max(100),
    gradingScheme: z.enum(['ABSOLUTE', 'RELATIVE', 'CURVE', 'COMPETENCY']),
    attendanceRequirement: z.coerce.number().int().min(0).max(100),
    prerequisiteSubjectIds: z.array(z.string().trim()).default([]),
    outcomeMapping: outcomeMappingSchema.optional(),
    learningResources: z.array(z.object({
      id: z.string().trim(),
      type: z.enum(['BOOK', 'VIDEO', 'NPTEL', 'COURSERA', 'GITHUB', 'RESEARCH_PAPER', 'LAB_MANUAL']),
      title: z.string().trim(),
      description: z.string().trim().optional().or(z.literal('')),
      url: z.string().trim().url(),
      author: z.string().trim().optional().or(z.literal('')),
      publisher: z.string().trim().optional().or(z.literal('')),
      year: z.coerce.number().int().optional(),
      isbn: z.string().trim().optional().or(z.literal('')),
      duration: z.string().trim().optional().or(z.literal('')),
      language: z.string().trim().default('en'),
      difficultyLevel: z.enum(['EASY', 'MEDIUM', 'HARD', 'EXPERT']).optional(),
      tags: z.array(z.string().trim()).default([]),
      isRecommended: z.boolean().default(false),
      addedBy: z.string().trim(),
      usageCount: z.coerce.number().int().min(0).default(0),
    })).default([]),
    documents: z.array(z.object({
      id: z.string().trim(),
      name: z.string().trim(),
      type: z.enum(['SYLLABUS', 'COURSE_PLAN', 'LAB_MANUAL', 'ASSIGNMENT_SPEC', 'EVALUATION_RUBRIC', 'PREVIOUS_PAPER', 'REFERENCE_MATERIAL', 'OTHER']),
      description: z.string().trim().optional().or(z.literal('')),
      version: z.string().trim(),
      fileUrl: z.string().trim().url(),
      fileSize: z.coerce.number().int().min(0),
      mimeType: z.string().trim(),
      uploadedBy: z.string().trim(),
      uploadedAt: z.coerce.date(),
      previousVersionId: z.string().trim().optional().or(z.literal('')),
      changeDescription: z.string().trim().optional().or(z.literal('')),
      isCurrent: z.boolean().default(true),
      verified: z.boolean().default(false),
      verifiedBy: z.string().trim().optional().or(z.literal('')),
      verifiedAt: z.coerce.date().optional().or(z.literal('')),
      accessLevel: z.enum(['PUBLIC', 'RESTRICTED', 'CONFIDENTIAL']).default('PUBLIC'),
    })).default([]),
    aiMetadata: z.object({
      predictedDifficulty: z.enum(['EASY', 'MEDIUM', 'HARD', 'EXPERT']).optional(),
      predictedPassRate: z.coerce.number().int().min(0).max(100).optional(),
      averagePerformance: z.coerce.number().int().min(0).max(100).optional(),
      recommendationScore: z.coerce.number().int().min(0).max(100).optional(),
      aiInsights: z.string().trim().optional().or(z.literal('')),
      confidenceScore: z.coerce.number().int().min(0).max(100).optional(),
      lastPredictedAt: z.coerce.date().optional().or(z.literal('')),
      historicalPassRate: z.coerce.number().int().min(0).max(100).optional(),
      historicalFailureRate: z.coerce.number().int().min(0).max(100).optional(),
      averageAttendance: z.coerce.number().int().min(0).max(100).optional(),
      averageMarks: z.coerce.number().int().min(0).max(100).optional(),
      difficultyTrend: z.enum(['INCREASING', 'STABLE', 'DECREASING']).optional(),
      semesterPopularity: z.coerce.number().int().min(0).max(100).optional(),
      studentFeedbackScore: z.coerce.number().int().min(0).max(5).optional(),
    }).optional(),
  }),
  isCurrent: z.boolean().default(false),
});

export const createVersionSchema = z.object({
  version: z.string().trim().regex(/^\d+\.\d+$/, 'Version must follow semantic versioning (e.g., 1.0)'),
  changeSummary: z.string().trim().min(1, 'Change summary is required').max(1000),
  snapshot: subjectVersionSchema.shape.snapshot,
});

export const approveVersionSchema = z.object({
  version: z.string().trim().regex(/^\d+\.\d+$/, 'Version must follow semantic versioning (e.g., 1.0)'),
  comment: z.string().trim().max(500).optional().or(z.literal('')),
});

export const rejectVersionSchema = z.object({
  version: z.string().trim().regex(/^\d+\.\d+$/, 'Version must follow semantic versioning (e.g., 1.0)'),
  reason: z.string().trim().min(1, 'Rejection reason is required').max(500),
});

export const subjectDocumentSchema = z.object({
  id: z.string().trim().min(1, 'Document ID is required'),
  name: z.string().trim().min(1, 'Document name is required').max(200),
  type: z.enum(['SYLLABUS', 'COURSE_PLAN', 'LAB_MANUAL', 'ASSIGNMENT_SPEC', 'EVALUATION_RUBRIC', 'PREVIOUS_PAPER', 'REFERENCE_MATERIAL', 'OTHER']),
  description: z.string().trim().max(500).optional().or(z.literal('')),
  version: z.string().trim().regex(/^\d+\.\d+$/, 'Version must follow semantic versioning (e.g., 1.0)'),
  fileUrl: z.string().trim().min(1, 'File URL is required').url(),
  fileSize: z.coerce.number().int().min(0),
  mimeType: z.string().trim().min(1, 'MIME type is required'),
  uploadedBy: objectIdSchema,
  previousVersionId: z.string().trim().optional().or(z.literal('')),
  changeDescription: z.string().trim().max(500).optional().or(z.literal('')),
  isCurrent: z.boolean().default(true),
  verified: z.boolean().default(false),
  verifiedBy: objectIdSchema.optional(),
  verifiedAt: z.coerce.date().optional().or(z.literal('')),
  accessLevel: z.enum(['PUBLIC', 'RESTRICTED', 'CONFIDENTIAL']).default('PUBLIC'),
});

export const uploadDocumentSchema = z.object({
  name: z.string().trim().min(1, 'Document name is required').max(200),
  type: z.enum(['SYLLABUS', 'COURSE_PLAN', 'LAB_MANUAL', 'ASSIGNMENT_SPEC', 'EVALUATION_RUBRIC', 'PREVIOUS_PAPER', 'REFERENCE_MATERIAL', 'OTHER']),
  description: z.string().trim().max(500).optional().or(z.literal('')),
  fileUrl: z.string().trim().min(1, 'File URL is required').url(),
  fileSize: z.coerce.number().int().min(0),
  mimeType: z.string().trim().min(1, 'MIME type is required'),
  accessLevel: z.enum(['PUBLIC', 'RESTRICTED', 'CONFIDENTIAL']).default('PUBLIC'),
});

export const verifyDocumentSchema = z.object({
  verified: z.boolean(),
});

export const learningResourceSchema = z.object({
  id: z.string().trim().min(1, 'Resource ID is required'),
  type: z.enum(['BOOK', 'VIDEO', 'NPTEL', 'COURSERA', 'GITHUB', 'RESEARCH_PAPER', 'LAB_MANUAL']),
  title: z.string().trim().min(1, 'Title is required').max(200),
  description: z.string().trim().max(1000).optional().or(z.literal('')),
  url: z.string().trim().min(1, 'URL is required').url(),
  author: z.string().trim().max(200).optional().or(z.literal('')),
  publisher: z.string().trim().max(200).optional().or(z.literal('')),
  year: z.coerce.number().int().min(1900).max(new Date().getFullYear() + 1).optional(),
  isbn: z.string().trim().max(20).optional().or(z.literal('')),
  duration: z.string().trim().max(20).optional().or(z.literal('')),
  language: z.string().trim().max(10).default('en'),
  difficultyLevel: z.enum(['EASY', 'MEDIUM', 'HARD', 'EXPERT']).optional(),
  tags: z.array(z.string().trim()).default([]),
  isRecommended: z.boolean().default(false),
  addedBy: objectIdSchema,
  usageCount: z.coerce.number().int().min(0).default(0),
});

export const addLearningResourceSchema = z.object({
  type: z.enum(['BOOK', 'VIDEO', 'NPTEL', 'COURSERA', 'GITHUB', 'RESEARCH_PAPER', 'LAB_MANUAL']),
  title: z.string().trim().min(1, 'Title is required').max(200),
  description: z.string().trim().max(1000).optional().or(z.literal('')),
  url: z.string().trim().min(1, 'URL is required').url(),
  author: z.string().trim().max(200).optional().or(z.literal('')),
  publisher: z.string().trim().max(200).optional().or(z.literal('')),
  year: z.coerce.number().int().min(1900).max(new Date().getFullYear() + 1).optional(),
  isbn: z.string().trim().max(20).optional().or(z.literal('')),
  duration: z.string().trim().max(20).optional().or(z.literal('')),
  language: z.string().trim().max(10).optional().or(z.literal('')),
  difficultyLevel: z.enum(['EASY', 'MEDIUM', 'HARD', 'EXPERT']).optional(),
  tags: z.array(z.string().trim()).default([]),
  isRecommended: z.boolean().default(false),
});

export const subjectAiMetadataSchema = z.object({
  predictedDifficulty: z.enum(['EASY', 'MEDIUM', 'HARD', 'EXPERT']).optional(),
  predictedPassRate: z.coerce.number().int().min(0).max(100).optional(),
  averagePerformance: z.coerce.number().int().min(0).max(100).optional(),
  recommendationScore: z.coerce.number().int().min(0).max(100).optional(),
  aiInsights: z.string().trim().max(2000).optional().or(z.literal('')),
  confidenceScore: z.coerce.number().int().min(0).max(100).optional(),
  lastPredictedAt: z.coerce.date().optional().or(z.literal('')),
  historicalPassRate: z.coerce.number().int().min(0).max(100).optional(),
  historicalFailureRate: z.coerce.number().int().min(0).max(100).optional(),
  averageAttendance: z.coerce.number().int().min(0).max(100).optional(),
  averageMarks: z.coerce.number().int().min(0).max(100).optional(),
  difficultyTrend: z.enum(['INCREASING', 'STABLE', 'DECREASING']).optional(),
  semesterPopularity: z.coerce.number().int().min(0).max(100).optional(),
  studentFeedbackScore: z.coerce.number().int().min(0).max(5).optional(),
});

export const subjectStatisticsSchema = z.object({
  averageAttendance: z.coerce.number().int().min(0).max(100),
  averageMarks: z.coerce.number().int().min(0).max(100),
  passRate: z.coerce.number().int().min(0).max(100),
  failureRate: z.coerce.number().int().min(0).max(100),
  backlogRate: z.coerce.number().int().min(0).max(100),
  completionRate: z.coerce.number().int().min(0).max(100),
  studentCount: z.coerce.number().int().min(0),
  lastCalculatedAt: z.coerce.date(),
});

export const createSubjectSchema = z.object({
  subjectId: z.string().trim().regex(/^[A-Z]{2,4}\d{3,6}$/, 'Subject ID must be 2-4 uppercase letters followed by 3-6 digits'),
  code: z.string().trim().regex(/^[A-Z]{2,4}\d{3,6}$/, 'Subject code must be 2-4 uppercase letters followed by 3-6 digits').max(20),
  name: z.string().trim().min(2, 'Name must be at least 2 characters').max(100),
  shortName: z.string().trim().max(20).optional().or(z.literal('')),
  description: z.string().trim().optional().or(z.literal('')),
  courseId: objectIdSchema,
  departmentId: objectIdSchema,
  semester: z.coerce.number().int().min(1).max(12),
  academicYear: z.string().trim().regex(/^\d{4}-\d{4}$/, 'Academic year must be in format YYYY-YYYY'),
  regulationYear: z.coerce.number().int().min(2000).max(new Date().getFullYear() + 1),
  subjectType: z.enum(['THEORY', 'LAB', 'PROJECT', 'SEMINAR', 'ELECTIVE', 'MANDATORY', 'VALUE_ADDED']),
  category: z.enum(['CORE', 'ELECTIVE', 'MINOR', 'CERTIFICATION', 'VALUE_ADDED', 'OPEN']),
  credits: z.coerce.number().int().min(1).max(20),
  theoryHours: z.coerce.number().int().min(0).max(10),
  tutorialHours: z.coerce.number().int().min(0).max(10),
  practicalHours: z.coerce.number().int().min(0).max(10),
  deliveryMode: z.enum(['IN_PERSON', 'ONLINE', 'HYBRID', 'SELF_PACED']),
  primaryFacultyId: objectIdSchema.optional(),
  coFacultyIds: z.array(objectIdSchema).default([]),
  syllabusUnits: z.array(syllabusUnitSchema).default([]),
  courseOutcomes: z.array(z.string().trim()).default([]),
  learningObjectives: z.array(z.string().trim()).default([]),
  textbooks: z.array(textbookSchema).default([]),
  referenceBooks: z.array(textbookSchema).default([]),
  internalMarks: z.coerce.number().int().min(0).max(100),
  externalMarks: z.coerce.number().int().min(0).max(100),
  passingMarks: z.coerce.number().int().min(0).max(100),
  gradingScheme: z.enum(['ABSOLUTE', 'RELATIVE', 'CURVE', 'COMPETENCY']),
  attendanceRequirement: z.coerce.number().int().min(0).max(100),
  prerequisiteSubjectIds: z.array(objectIdSchema).default([]),
  outcomeMapping: outcomeMappingSchema.optional(),
  documents: z.array(subjectDocumentSchema).default([]),
  learningResources: z.array(learningResourceSchema).default([]),
  predictedDifficulty: z.enum(['EASY', 'MEDIUM', 'HARD', 'EXPERT']).optional(),
  predictedPassRate: z.coerce.number().int().min(0).max(100).optional(),
  averagePerformance: z.coerce.number().int().min(0).max(100).optional(),
  recommendationScore: z.coerce.number().int().min(0).max(100).optional(),
  aiInsights: z.string().trim().max(2000).optional().or(z.literal('')),
  confidenceScore: z.coerce.number().int().min(0).max(100).optional(),
  historicalPassRate: z.coerce.number().int().min(0).max(100).optional(),
  historicalFailureRate: z.coerce.number().int().min(0).max(100).optional(),
  averageAttendance: z.coerce.number().int().min(0).max(100).optional(),
  averageMarks: z.coerce.number().int().min(0).max(100).optional(),
  difficultyTrend: z.enum(['INCREASING', 'STABLE', 'DECREASING']).optional(),
  semesterPopularity: z.coerce.number().int().min(0).max(100).optional(),
  studentFeedbackScore: z.coerce.number().int().min(0).max(5).optional(),
  status: z.enum(['ACTIVE', 'INACTIVE', 'ARCHIVED', 'DRAFT']).default('ACTIVE'),
  isActive: z.boolean().default(true),
});

export const updateSubjectSchema = createSubjectSchema.partial().omit({
  subjectId: true,
  code: true,
  courseId: true,
  departmentId: true,
  semester: true,
  documents: true,
  learningResources: true,
});

export const subjectQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  sort: z.string().trim().optional(),
  order: z.enum(['asc', 'desc']).default('desc'),
  search: z.string().trim().optional(),
  courseId: z.string().trim().optional(),
  departmentId: z.string().trim().optional(),
  semester: z.coerce.number().int().min(1).max(12).optional(),
  academicYear: z.string().trim().optional(),
  regulationYear: z.coerce.number().int().min(2000).optional(),
  subjectType: z.enum(['THEORY', 'LAB', 'PROJECT', 'SEMINAR', 'ELECTIVE', 'MANDATORY', 'VALUE_ADDED']).optional(),
  category: z.enum(['CORE', 'ELECTIVE', 'MINOR', 'CERTIFICATION', 'VALUE_ADDED', 'OPEN']).optional(),
  isActive: z.coerce.boolean().optional(),
  status: z.enum(['ACTIVE', 'INACTIVE', 'ARCHIVED', 'DRAFT']).optional(),
  primaryFacultyId: z.string().trim().optional(),
  hasPrerequisites: z.coerce.boolean().optional(),
  outcomeMapped: z.coerce.boolean().optional(),
  hasDocuments: z.coerce.boolean().optional(),
  hasLearningResources: z.coerce.boolean().optional(),
  predictedDifficulty: z.enum(['EASY', 'MEDIUM', 'HARD', 'EXPERT']).optional(),
  difficultyTrend: z.enum(['INCREASING', 'STABLE', 'DECREASING']).optional(),
});

export const bulkImportSchema = z.object({
  subjects: z.array(createSubjectSchema).min(1).max(500),
});

export const bulkUpdateSchema = z.object({
  ids: z.array(objectIdSchema).min(1).max(500),
  updates: updateSubjectSchema,
});

export const assignFacultySchema = z.object({
  facultyId: objectIdSchema,
  role: z.enum(['PRIMARY', 'CO_FACULTY']).default('PRIMARY'),
});

export const assignPrerequisiteSchema = z.object({
  prerequisiteSubjectId: objectIdSchema,
});

export type SyllabusUnitInput = z.infer<typeof syllabusUnitSchema>;
export type TextbookInput = z.infer<typeof textbookSchema>;
export type CourseOutcomeInput = z.infer<typeof courseOutcomeSchema>;
export type ProgramOutcomeInput = z.infer<typeof programOutcomeSchema>;
export type GraduateAttributeInput = z.infer<typeof graduateAttributeSchema>;
export type OutcomeMappingInput = z.infer<typeof outcomeMappingSchema>;
export type SubjectVersionInput = z.infer<typeof subjectVersionSchema>;
export type CreateVersionInput = z.infer<typeof createVersionSchema>;
export type ApproveVersionInput = z.infer<typeof approveVersionSchema>;
export type RejectVersionInput = z.infer<typeof rejectVersionSchema>;
export type SubjectDocumentInput = z.infer<typeof subjectDocumentSchema>;
export type UploadDocumentInput = z.infer<typeof uploadDocumentSchema>;
export type VerifyDocumentInput = z.infer<typeof verifyDocumentSchema>;
export type LearningResourceInput = z.infer<typeof learningResourceSchema>;
export type AddLearningResourceInput = z.infer<typeof addLearningResourceSchema>;
export type SubjectAiMetadataInput = z.infer<typeof subjectAiMetadataSchema>;
export type SubjectStatisticsInput = z.infer<typeof subjectStatisticsSchema>;
export type CreateSubjectInput = z.infer<typeof createSubjectSchema>;
export type UpdateSubjectInput = z.infer<typeof updateSubjectSchema>;
export type SubjectQueryInput = z.infer<typeof subjectQuerySchema>;
export type BulkImportInput = z.infer<typeof bulkImportSchema>;
export type BulkUpdateInput = z.infer<typeof bulkUpdateSchema>;
export type AssignFacultyInput = z.infer<typeof assignFacultySchema>;
export type AssignPrerequisiteInput = z.infer<typeof assignPrerequisiteSchema>;
