/** Eligibility status. */
export type EligibilityStatus = 'PENDING' | 'PROCESSING' | 'ELIGIBLE' | 'NOT_ELIGIBLE' | 'CONDITIONAL' | 'MANUAL_REVIEW_REQUIRED';

/** Rule type. */
export type RuleType = 'ACADEMIC' | 'CATEGORY' | 'COURSE' | 'ENTRANCE_EXAM' | 'RESERVATION' | 'CUSTOM';

/** Rule operator. */
export type RuleOperator = 'EQUALS' | 'NOT_EQUALS' | 'GREATER_THAN' | 'LESS_THAN' | 'GREATER_THAN_OR_EQUALS' | 'LESS_THAN_OR_EQUALS' | 'IN' | 'NOT_IN' | 'BETWEEN' | 'CONTAINS';

/** AI confidence level. */
export type AIConfidenceLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'VERY_HIGH';

/** Decision status. */
export type DecisionStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'CONDITIONAL' | 'REVIEW';

/**
 * Academic rule details.
 */
export interface AcademicRule {
  ruleId: string;
  ruleName: string;
  description?: string;
  minimumPercentage: number;
  minimumCGPA: number;
  allowedQualifications: string[];
  mandatorySubjects: string[];
  maxGapYears: number;
  isActive: boolean;
}

/**
 * Category rule details.
 */
export interface CategoryRule {
  ruleId: string;
  ruleName: string;
  description?: string;
  category: string;
  minimumPercentage: number;
  reservationPercentage: number;
  allowedCourses: string[];
  isActive: boolean;
}

/**
 * Course rule details.
 */
export interface CourseRule {
  ruleId: string;
  ruleName: string;
  description?: string;
  courseId: string;
  departmentId: string;
  minimumPercentage: number;
  minimumEntranceScore: number;
  maxApplicants: number;
  isActive: boolean;
}

/**
 * Entrance exam rule details.
 */
export interface EntranceExamRule {
  ruleId: string;
  ruleName: string;
  description?: string;
  examName: string;
  minimumScore: number;
  maximumScore: number;
  qualifyingPercentage: number;
  isActive: boolean;
}

/**
 * Reservation rule details.
 */
export interface ReservationRule {
  ruleId: string;
  ruleName: string;
  description?: string;
  category: string;
  reservationPercentage: number;
  applicableCourses: string[];
  isActive: boolean;
}

/**
 * AI confidence details.
 */
export interface AIConfidence {
  level: AIConfidenceLevel;
  score: number;
  factors: string[];
  generatedAt: Date;
  modelVersion?: string;
}

/**
 * Reason generation details.
 */
export interface ReasonGeneration {
  primaryReason: string;
  secondaryReasons: string[];
  ruleViolations: string[];
  recommendations: string[];
  generatedAt: Date;
}

/**
 * Recommendation details.
 */
export interface Recommendation {
  recommendedCourseId?: string;
  recommendedDepartmentId?: string;
  alternativeCourses: string[];
  confidence: number;
  reasoning?: string;
}

/**
 * Decision history entry.
 */
export interface DecisionHistoryEntry {
  decisionId: string;
  decision: DecisionStatus;
  reviewedBy: string;
  remarks?: string;
  createdAt: Date;
}

/**
 * Eligibility check result.
 */
export interface EligibilityCheckResult {
  ruleType: RuleType;
  ruleId: string;
  ruleName: string;
  passed: boolean;
  actualValue: number | string;
  expectedValue: number | string;
  operator: RuleOperator;
  remarks?: string;
}

/**
 * Core eligibility engine schema type.
 */
export interface EligibilitySchemaType {
  eligibilityId: string;
  applicantId: string;
  applicationNumber: string;
  status: EligibilityStatus;
  academicRules: AcademicRule[];
  categoryRules: CategoryRule[];
  courseRules: CourseRule[];
  entranceExamRules: EntranceExamRule[];
  reservationRules: ReservationRule[];
  checkResults: EligibilityCheckResult[];
  aiConfidence?: AIConfidence;
  reasonGeneration?: ReasonGeneration;
  recommendation?: Recommendation;
  decisionHistory: DecisionHistoryEntry[];
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
