export type CourseStatus = 'ACTIVE' | 'INACTIVE' | 'ARCHIVED';
export type ProgramType = 'UG' | 'PG' | 'DIPLOMA' | 'CERTIFICATE' | 'PHD';
export type Degree = 'BACHELOR' | 'MASTER' | 'DOCTORATE' | 'DIPLOMA' | 'CERTIFICATE';
export type CurriculumStatus = 'DRAFT' | 'REVIEW' | 'APPROVED' | 'ACTIVE' | 'RETIRED';
export type AssessmentMethod = 'EXAM' | 'PROJECT' | 'ASSIGNMENT' | 'LAB' | 'QUIZ' | 'PRESENTATION' | 'INTERNAL';
export type PredictedDifficulty = 'EASY' | 'MEDIUM' | 'HARD';

export interface CourseOutcome {
  code: string;
  title: string;
  description: string;
  attainmentTarget: number;
  assessmentMethods: AssessmentMethod[];
}

export interface ProgramOutcome {
  code: string;
  title: string;
  description: string;
  attainmentTarget: number;
  assessmentMethods: AssessmentMethod[];
}

export interface ProgramSpecificOutcome {
  code: string;
  title: string;
  description: string;
  attainmentTarget: number;
  assessmentMethods: AssessmentMethod[];
}

export interface GraduateAttribute {
  code: string;
  title: string;
  description: string;
  attainmentTarget: number;
  assessmentMethods: AssessmentMethod[];
}

export interface SemesterSubject {
  subjectId: string;
  isElective: boolean;
}

export interface Semester {
  semesterNumber: number;
  credits: number;
  electiveCredits: number;
  mandatoryCredits: number;
  theoryCredits: number;
  practicalCredits: number;
  labCredits: number;
  projectCredits: number;
  internshipCredits: number;
  subjects: SemesterSubject[];
  isActive: boolean;
}

export interface CurriculumHistoryItem {
  version: string;
  status: CurriculumStatus;
  effectiveFrom: Date;
  effectiveTo: Date | null;
  changedBy: string;
  changeReason: string;
  approvedBy: string;
  approvedAt: Date;
  publishedAt: Date | null;
}

export interface Prerequisite {
  prerequisiteCourseId: string;
  minimumGrade: string;
  mandatory: boolean;
  remarks: string;
}

export interface AiMetadata {
  predictedDifficulty: PredictedDifficulty | null;
  predictedDropoutRisk: number | null;
  predictedPlacementRate: number | null;
  averagePassRate: number | null;
  historicalDifficultyTrend: string | null;
  recommendedLearningPath: string | null;
  recommendedPrerequisites: string[];
  prerequisiteGraphVersion: string | null;
  aiGeneratedInsights: string | null;
  lastPredictionDate: Date | null;
  lastAIModelVersion: string | null;
  confidenceScore: number | null;
}
