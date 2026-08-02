export type SubjectStatus = 'ACTIVE' | 'INACTIVE' | 'ARCHIVED' | 'DRAFT';
export type SubjectType = 'THEORY' | 'LAB' | 'PROJECT' | 'SEMINAR' | 'ELECTIVE' | 'MANDATORY' | 'VALUE_ADDED';
export type SubjectCategory = 'CORE' | 'ELECTIVE' | 'MINOR' | 'CERTIFICATION' | 'VALUE_ADDED' | 'OPEN';
export type DeliveryMode = 'IN_PERSON' | 'ONLINE' | 'HYBRID' | 'SELF_PACED';
export type GradingScheme = 'ABSOLUTE' | 'RELATIVE' | 'CURVE' | 'COMPETENCY';
export type DifficultyLevel = 'EASY' | 'MEDIUM' | 'HARD' | 'EXPERT';
export type VersionStatus = 'DRAFT' | 'PENDING_APPROVAL' | 'APPROVED' | 'REJECTED' | 'SUPERSEDED';
export type DocumentType = 'SYLLABUS' | 'COURSE_PLAN' | 'LAB_MANUAL' | 'ASSIGNMENT_SPEC' | 'EVALUATION_RUBRIC' | 'PREVIOUS_PAPER' | 'REFERENCE_MATERIAL' | 'OTHER';
export type ResourceType = 'BOOK' | 'VIDEO' | 'NPTEL' | 'COURSERA' | 'GITHUB' | 'RESEARCH_PAPER' | 'LAB_MANUAL';
export type AccessLevel = 'PUBLIC' | 'RESTRICTED' | 'CONFIDENTIAL';
export type TrendDirection = 'INCREASING' | 'STABLE' | 'DECREASING';

export interface SyllabusUnit {
  unitNumber: number;
  title: string;
  description?: string;
  hours: number;
}

export interface Textbook {
  title: string;
  authors: string[];
  publisher: string;
  edition?: string;
  year: number;
  isbn?: string;
}

export interface CourseOutcome {
  id: string;
  description: string;
  level: number;
  syllabusUnits: number[];
  weightage: number;
}

export interface ProgramOutcome {
  code: string;
  description: string;
  mappingLevel: 'DIRECT' | 'INDIRECT' | 'NONE';
  relatedCourseOutcomes: string[];
}

export interface GraduateAttribute {
  code: string;
  name: string;
  description: string;
  mappedProgramOutcomes: string[];
  assessmentMethod: 'DIRECT' | 'INDIRECT';
}

export interface OutcomeMapping {
  courseOutcomes: CourseOutcome[];
  programOutcomes: ProgramOutcome[];
  graduateAttributes: GraduateAttribute[];
}

export interface SubjectVersion {
  version: string;
  status: VersionStatus;
  changedBy: string;
  changedAt: Date;
  approvedBy?: string;
  approvedAt?: Date;
  rejectedBy?: string;
  rejectedAt?: Date;
  rejectionReason?: string;
  changeSummary: string;
  snapshot: SubjectSnapshot;
  isCurrent: boolean;
}

export interface SubjectSnapshot {
  subjectId: string;
  code: string;
  name: string;
  description?: string;
  courseId: string;
  departmentId: string;
  semester: number;
  academicYear: string;
  regulationYear: number;
  subjectType: SubjectType;
  category: SubjectCategory;
  credits: number;
  theoryHours: number;
  tutorialHours: number;
  practicalHours: number;
  totalHours: number;
  deliveryMode: DeliveryMode;
  primaryFacultyId?: string;
  coFacultyIds: string[];
  syllabusUnits: SyllabusUnit[];
  courseOutcomes: string[];
  learningObjectives: string[];
  textbooks: Textbook[];
  referenceBooks: Textbook[];
  internalMarks: number;
  externalMarks: number;
  passingMarks: number;
  gradingScheme: GradingScheme;
  attendanceRequirement: number;
  prerequisiteSubjectIds: string[];
  outcomeMapping?: OutcomeMapping;
  learningResources: LearningResource[];
  documents: SubjectDocument[];
  aiMetadata: AiMetadataSnapshot;
}

export interface SubjectDocument {
  id: string;
  name: string;
  type: DocumentType;
  description?: string;
  version: string;
  fileUrl: string;
  fileSize: number;
  mimeType: string;
  uploadedBy: string;
  uploadedAt: Date;
  previousVersionId?: string;
  changeDescription?: string;
  isCurrent: boolean;
  verified: boolean;
  verifiedBy?: string;
  verifiedAt?: Date;
  accessLevel: AccessLevel;
}

export interface LearningResource {
  id: string;
  type: ResourceType;
  title: string;
  description?: string;
  url: string;
  author?: string;
  publisher?: string;
  year?: number;
  isbn?: string;
  duration?: string;
  language: string;
  difficultyLevel?: DifficultyLevel;
  tags: string[];
  isRecommended: boolean;
  addedBy: string;
  addedAt: Date;
  lastVerifiedAt?: Date;
  usageCount: number;
}

export interface AiMetadataSnapshot {
  predictedDifficulty?: DifficultyLevel;
  predictedPassRate?: number;
  averagePerformance?: number;
  recommendationScore?: number;
  aiInsights?: string;
  confidenceScore?: number;
  lastPredictedAt?: Date;
  historicalPassRate?: number;
  historicalFailureRate?: number;
  averageAttendance?: number;
  averageMarks?: number;
  difficultyTrend?: TrendDirection;
  semesterPopularity?: number;
  studentFeedbackScore?: number;
}

export interface SubjectStatistics {
  averageAttendance: number;
  averageMarks: number;
  passRate: number;
  failureRate: number;
  backlogRate: number;
  completionRate: number;
  studentCount: number;
  lastCalculatedAt: Date;
}

export interface SubjectSchemaType {
  subjectId: string;
  code: string;
  name: string;
  shortName?: string;
  description?: string;
  courseId: string;
  departmentId: string;
  semester: number;
  academicYear: string;
  regulationYear: number;
  subjectType: SubjectType;
  category: SubjectCategory;
  credits: number;
  theoryHours: number;
  tutorialHours: number;
  practicalHours: number;
  totalHours: number;
  deliveryMode: DeliveryMode;
  primaryFacultyId?: string;
  coFacultyIds: string[];
  syllabusUnits: SyllabusUnit[];
  courseOutcomes: string[];
  learningObjectives: string[];
  textbooks: Textbook[];
  referenceBooks: Textbook[];
  internalMarks: number;
  externalMarks: number;
  passingMarks: number;
  gradingScheme: GradingScheme;
  attendanceRequirement: number;
  prerequisiteSubjectIds: string[];
  outcomeMapping?: OutcomeMapping;
  currentVersion?: string;
  versionHistory: SubjectVersion[];
  documents: SubjectDocument[];
  learningResources: LearningResource[];
  predictedDifficulty?: DifficultyLevel;
  predictedPassRate?: number;
  averagePerformance?: number;
  recommendationScore?: number;
  aiInsights?: string;
  lastPredictedAt?: Date;
  confidenceScore?: number;
  historicalPassRate?: number;
  historicalFailureRate?: number;
  averageAttendance?: number;
  averageMarks?: number;
  difficultyTrend?: TrendDirection;
  semesterPopularity?: number;
  studentFeedbackScore?: number;
  subjectStatistics?: SubjectStatistics;
  status: SubjectStatus;
  isActive: boolean;
  archivedAt?: Date;
  archivedBy?: string;
  createdBy: string;
  updatedBy: string;
  deletedBy?: string;
  deletedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}
