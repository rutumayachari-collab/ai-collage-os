/** Application number prefix for globally unique applicant identifiers. */
export const APPLICATION_NUMBER_PREFIX = 'APP';

/** Default applicant priority. */
export const DEFAULT_PRIORITY = 'MEDIUM';

/** Default current stage for new applications. */
export const DEFAULT_CURRENT_STAGE = 'APPLICATION_SUBMITTED';

/**
 * Supported admission rounds.
 */
export const ADMISSION_ROUNDS = [
  'CAP_ROUND_1',
  'CAP_ROUND_2',
  'CAP_ROUND_3',
  'SPOT',
  'MANAGEMENT',
  'INSTITUTIONAL',
] as const;

/**
 * Applicant workflow state machine.
 *
 * Valid transitions:
 * - NEW -> DOCUMENTS_VERIFIED
 * - DOCUMENTS_VERIFIED -> ELIGIBLE
 * - ELIGIBLE -> INTERVIEW_SCHEDULED
 * - INTERVIEW_SCHEDULED -> INTERVIEWED
 * - INTERVIEWED -> SELECTED
 * - SELECTED -> OFFERED
 * - OFFERED -> ADMITTED
 * - Any non-terminal -> REJECTED
 * - Any -> ARCHIVED
 */
export type ApplicantStatus = 'NEW' | 'DOCUMENTS_VERIFIED' | 'ELIGIBLE' | 'INTERVIEW_SCHEDULED' | 'INTERVIEWED' | 'SELECTED' | 'OFFERED' | 'ADMITTED' | 'REJECTED' | 'ARCHIVED';

/** Admission round options. */
export type AdmissionRound = 'CAP_ROUND_1' | 'CAP_ROUND_2' | 'CAP_ROUND_3' | 'SPOT' | 'MANAGEMENT' | 'INSTITUTIONAL';

/** Application channel options. */
export type ApplicationChannel = 'ONLINE' | 'OFFLINE' | 'COUNSELOR' | 'WEBSITE' | 'PHONE' | 'WHATSAPP' | 'EDUCATION_FAIR';

/** Gender options. */
export type Gender = 'MALE' | 'FEMALE' | 'OTHER' | 'PREFER_NOT_TO_SAY';

/** Qualification type options. */
export type QualificationType = 'HIGH_SCHOOL' | 'INTERMEDIATE' | 'DIPLOMA' | 'BACHELORS' | 'MASTERS' | 'PHD' | 'OTHER';

/**
 * Document status lifecycle.
 */
export type DocumentStatus = 'NOT_REQUIRED' | 'PENDING' | 'UPLOADED' | 'VERIFIED' | 'REJECTED' | 'EXPIRED';

/** Document type options. */
export type DocumentType = 'PHOTO' | 'SIGNATURE' | 'MARKSHEET' | 'CERTIFICATE' | 'ID_PROOF' | 'ADDRESS_PROOF' | 'ENTRANCE_SCORE' | 'TRANSFER_CERTIFICATE' | 'MIGRATION' | 'OTHER';

/** Interview recommendation options. */
export type InterviewRecommendation = 'RECOMMENDED' | 'NOT_RECOMMENDED' | 'PENDING';

/** Payment status options. */
export type PaymentStatus = 'PENDING' | 'PARTIAL' | 'PAID' | 'REFUNDED' | 'CANCELLED';

/** Scholarship status options. */
export type ScholarshipStatus = 'NOT_APPLIED' | 'APPLIED' | 'APPROVED' | 'REJECTED' | 'AWARDED';

/** Seat allocation status options. */
export type SeatStatus = 'RESERVED' | 'CONFIRMED' | 'CANCELLED';

/** Offer letter status options. */
export type OfferLetterStatus = 'GENERATED' | 'ACCEPTED' | 'REJECTED' | 'EXPIRED';

/** Final admission decision options. */
export type Decision = 'ACCEPTED' | 'REJECTED' | 'WAITLISTED' | 'CONDITIONAL';

/** Parent type options. */
export type ParentType = 'FATHER' | 'MOTHER' | 'GUARDIAN';

/** Contact type options. */
export type ContactType = 'PRIMARY' | 'SECONDARY' | 'EMERGENCY';

/**
 * Parent or guardian details for the applicant.
 */
export interface Parent {
  type: ParentType;
  fullName: string;
  email?: string;
  phone: string;
  occupation?: string;
  annualIncome?: number;
}

/**
 * Guardian details for the applicant.
 */
export interface Guardian {
  fullName: string;
  relationship: string;
  email?: string;
  phone: string;
  occupation?: string;
  address?: string;
}

/**
 * Emergency contact details for the applicant.
 */
export interface EmergencyContact {
  fullName: string;
  relationship: string;
  phone: string;
  alternatePhone?: string;
  address?: string;
}

/**
 * Applicant document metadata with versioning and verification status.
 */
export interface ApplicantDocument {
  id: string;
  type: DocumentType;
  name: string;
  description?: string;
  fileUrl: string;
  fileSize: number;
  mimeType: string;
  uploadedBy: string;
  uploadedAt: Date;
  status: DocumentStatus;
  verifiedBy?: string;
  verifiedAt?: Date;
  rejectionReason?: string;
  previousVersionId?: string;
  isCurrent: boolean;
}

/**
 * Interview details including schedule, panel, and outcome.
 */
export interface Interview {
  scheduledAt: Date;
  completedAt?: Date;
  panelMembers: string[];
  score?: number;
  remarks?: string;
  recommendation?: InterviewRecommendation;
}

/**
 * Fee summary snapshot prepared for the Payment Module.
 */
export interface FeeSummary {
  totalFee: number;
  paidAmount: number;
  pendingAmount: number;
  lastPaymentDate?: Date;
  paymentStatus: PaymentStatus;
}

/**
 * Seat allocation details.
 */
export interface SeatAllocation {
  status: SeatStatus;
  seatNumber?: string;
  reservedAt?: Date;
  confirmedAt?: Date;
  cancelledAt?: Date;
  reservationExpiry?: Date;
}

/**
 * Offer letter details.
 */
export interface OfferLetter {
  status: OfferLetterStatus;
  generatedAt?: Date;
  acceptedAt?: Date;
  expiredAt?: Date;
  documentId?: string;
  validUntil?: Date;
}

/**
 * Scholarship details for the applicant.
 */
export interface Scholarship {
  applied: boolean;
  scholarshipType?: string;
  status: ScholarshipStatus;
  amount?: number;
  remarks?: string;
}

/**
 * Admission checklist tracking completion of required steps.
 */
export interface AdmissionChecklist {
  personalDetailsCompleted: boolean;
  academicDetailsCompleted: boolean;
  documentsUploaded: boolean;
  documentsVerified: boolean;
  eligibilityPassed: boolean;
  interviewCompleted: boolean;
  feePaid: boolean;
  admissionApproved: boolean;
}

/**
 * Timeline event for the applicant workflow.
 */
export interface TimelineEvent {
  eventId: string;
  eventType: string;
  description: string;
  performedBy: string;
  createdAt: Date;
}

/**
 * Decision history entry for the applicant.
 */
export interface DecisionHistory {
  decision: Decision;
  reviewedBy: string;
  remarks?: string;
  createdAt: Date;
}

/**
 * Workflow state change history entry.
 */
export interface WorkflowHistory {
  previousState: ApplicantStatus;
  newState: ApplicantStatus;
  changedBy: string;
  changedAt: Date;
  reason?: string;
}

/**
 * Conversion details when an applicant becomes a student.
 */
export interface Conversion {
  studentId?: string;
  convertedAt?: Date;
  convertedBy?: string;
}

/**
 * Core applicant schema type used by Mongoose.
 */
export interface ApplicantSchemaType {
  applicantId: string;
  applicationNumber: string;
  inquiryId?: string;
  fullName: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dateOfBirth?: Date;
  gender?: Gender;
  nationality?: string;
  address?: string;
  qualification?: QualificationType;
  boardOrUniversity?: string;
  passingYear?: number;
  percentage?: number;
  cgpa?: number;
  category?: string;
  specialization?: string;
  preferredCourseId?: string;
  alternativeCourseIds: string[];
  preferredDepartmentId?: string;
  preferredCampus?: string;
  preferredAdmissionYear?: string;
  budgetRange?: string;
  hostelRequired?: boolean;
  transportRequired?: boolean;
  source?: string;
  campaign?: string;
  medium?: string;
  referralSource?: string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  campaignId?: string;
  leadSource?: ApplicationChannel;
  applicationChannel?: ApplicationChannel;
  applicationDate: Date;
  status: ApplicantStatus;
  priority: string;
  admissionRound?: AdmissionRound;
  admissionChecklist: AdmissionChecklist;
  requiredDocuments: ApplicantDocument[];
  submittedDocuments: ApplicantDocument[];
  verifiedDocuments: ApplicantDocument[];
  scholarship: Scholarship;
  interview?: Interview;
  feeSummary: FeeSummary;
  seatAllocation: SeatAllocation;
  parents?: Parent[];
  guardian?: Guardian[];
  emergencyContacts?: EmergencyContact[];
  timeline: TimelineEvent[];
  decisionHistory: DecisionHistory[];
  workflowHistory: WorkflowHistory[];
  offerLetter?: OfferLetter;
  currentStage: string;
  assignedReviewerId?: string;
  assignedInterviewerId?: string;
  aiEligibilityScore?: number;
  aiRecommendationScore?: number;
  aiRiskLevel?: string;
  aiSuggestedCourseId?: string;
  aiDocumentAnalysis?: string;
  aiInterviewScorePrediction?: number;
  aiFinalDecision?: string;
  aiDropoutRisk?: string;
  aiFinancialRisk?: string;
  aiDocumentCompleteness?: number;
  aiRecommendedScholarships?: string[];
  aiRecommendedNextAction?: string;
  aiModelVersion?: string;
  generatedAt?: Date;
  conversion?: Conversion;
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
