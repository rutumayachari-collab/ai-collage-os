export type ApplicantStatus =
  | "NEW"
  | "DOCUMENTS_VERIFIED"
  | "ELIGIBLE"
  | "INTERVIEW_SCHEDULED"
  | "INTERVIEWED"
  | "SELECTED"
  | "OFFERED"
  | "ADMITTED"
  | "REJECTED"
  | "ARCHIVED";

export type ApplicantPriority = "LOW" | "MEDIUM" | "HIGH";
export type LeadSource = "ONLINE" | "OFFLINE" | "COUNSELOR" | "WEBSITE" | "PHONE" | "WHATSAPP" | "EDUCATION_FAIR";
export type ApplicationChannel = "ONLINE" | "OFFLINE" | "COUNSELOR" | "WEBSITE" | "PHONE" | "WHATSAPP" | "EDUCATION_FAIR";
export type AdmissionRound = "CAP_ROUND_1" | "CAP_ROUND_2" | "CAP_ROUND_3" | "SPOT" | "MANAGEMENT" | "INSTITUTIONAL";

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

export interface ApplicantDocument {
  id: string;
  type: "PHOTO" | "SIGNATURE" | "MARKSHEET" | "CERTIFICATE" | "ID_PROOF" | "ADDRESS_PROOF" | "ENTRANCE_SCORE" | "TRANSFER_CERTIFICATE" | "MIGRATION" | "OTHER";
  name: string;
  description?: string;
  fileUrl: string;
  fileSize: number;
  mimeType: string;
  uploadedBy: string;
  uploadedAt: string;
  status: "NOT_REQUIRED" | "PENDING" | "UPLOADED" | "VERIFIED" | "REJECTED" | "EXPIRED";
  verifiedBy?: string;
  verifiedAt?: string;
  rejectionReason?: string;
  previousVersionId?: string;
  isCurrent: boolean;
}

export interface InterviewDetails {
  scheduledAt: string;
  completedAt?: string;
  panelMembers: string[];
  score?: number;
  remarks?: string;
  recommendation?: "RECOMMENDED" | "NOT_RECOMMENDED" | "PENDING";
}

export interface FeeSummary {
  totalFee: number;
  paidAmount: number;
  pendingAmount: number;
  lastPaymentDate?: string;
  paymentStatus: "PENDING" | "PARTIAL" | "PAID" | "REFUNDED" | "CANCELLED";
}

export interface SeatAllocation {
  status: "RESERVED" | "CONFIRMED" | "CANCELLED";
  seatNumber?: string;
  reservedAt?: string;
  confirmedAt?: string;
  cancelledAt?: string;
  reservationExpiry?: string;
}

export interface ScholarshipDetails {
  applied: boolean;
  scholarshipType?: string;
  status: "NOT_APPLIED" | "APPLIED" | "APPROVED" | "REJECTED" | "AWARDED";
  amount?: number;
  remarks?: string;
}

export interface OfferLetterDetails {
  status?: "GENERATED" | "ACCEPTED" | "REJECTED" | "EXPIRED";
  generatedAt?: string;
  acceptedAt?: string;
  expiredAt?: string;
  documentId?: string;
  validUntil?: string;
}

export interface ParentDetails {
  type: "FATHER" | "MOTHER" | "GUARDIAN";
  fullName: string;
  email?: string;
  phone: string;
  occupation?: string;
  annualIncome?: number;
}

export interface GuardianDetails {
  fullName: string;
  relationship: string;
  email?: string;
  phone: string;
  occupation?: string;
  address?: string;
}

export interface EmergencyContact {
  fullName: string;
  relationship: string;
  phone: string;
  alternatePhone?: string;
  address?: string;
}

export interface TimelineEvent {
  eventId: string;
  eventType: "APPLICATION_SUBMITTED" | "DOCUMENT_UPLOADED" | "DOCUMENT_VERIFIED" | "ELIGIBILITY_CHECKED" | "INTERVIEW_SCHEDULED" | "INTERVIEW_COMPLETED" | "OFFER_GENERATED" | "OFFER_ACCEPTED" | "FEE_PAID" | "ADMISSION_APPROVED" | "STUDENT_CREATED" | "STATUS_CHANGED" | "NOTE_ADDED";
  description: string;
  performedBy: string;
  createdAt: string;
}

export interface DecisionHistory {
  decision: "ACCEPTED" | "REJECTED" | "WAITLISTED" | "CONDITIONAL";
  reviewedBy: string;
  remarks?: string;
  createdAt: string;
}

export interface WorkflowHistory {
  previousState: ApplicantStatus;
  newState: ApplicantStatus;
  changedBy: string;
  changedAt: string;
  reason?: string;
}

export interface Applicant {
  id: string;
  applicantId: string;
  applicationNumber: string;
  inquiryId?: string;
  fullName: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dateOfBirth?: string;
  gender?: "MALE" | "FEMALE" | "OTHER" | "PREFER_NOT_TO_SAY";
  nationality?: string;
  address?: string;
  qualification?: "HIGH_SCHOOL" | "INTERMEDIATE" | "DIPLOMA" | "BACHELORS" | "MASTERS" | "PHD" | "OTHER";
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
  hostelRequired: boolean;
  transportRequired: boolean;
  source?: string;
  campaign?: string;
  medium?: string;
  referralSource?: string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  campaignId?: string;
  leadSource?: LeadSource;
  applicationChannel?: ApplicationChannel;
  applicationDate: string;
  status: ApplicantStatus;
  priority: ApplicantPriority;
  admissionRound?: AdmissionRound;
  admissionChecklist: AdmissionChecklist;
  requiredDocuments: ApplicantDocument[];
  submittedDocuments: ApplicantDocument[];
  verifiedDocuments: ApplicantDocument[];
  scholarship: ScholarshipDetails;
  interview?: InterviewDetails;
  feeSummary: FeeSummary;
  seatAllocation: SeatAllocation;
  parents: ParentDetails[];
  guardian: GuardianDetails[];
  emergencyContacts: EmergencyContact[];
  timeline: TimelineEvent[];
  decisionHistory: DecisionHistory[];
  workflowHistory: WorkflowHistory[];
  offerLetter?: OfferLetterDetails;
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
  aiRecommendedScholarships: string[];
  aiRecommendedNextAction?: string;
  aiModelVersion?: string;
  generatedAt?: string;
  conversion?: {
    studentId?: string;
    convertedAt?: string;
    convertedBy?: string;
  };
  isActive: boolean;
  archivedAt?: string;
  archivedBy?: string;
  createdBy: string;
  updatedBy: string;
  deletedBy?: string;
  deletedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateApplicantDto {
  applicationNumber: string;
  fullName: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  applicationDate: string;
  dateOfBirth?: string;
  gender?: "MALE" | "FEMALE" | "OTHER" | "PREFER_NOT_TO_SAY";
  nationality?: string;
  address?: string;
  qualification?: "HIGH_SCHOOL" | "INTERMEDIATE" | "DIPLOMA" | "BACHELORS" | "MASTERS" | "PHD" | "OTHER";
  boardOrUniversity?: string;
  passingYear?: number;
  percentage?: number;
  cgpa?: number;
  category?: string;
  specialization?: string;
  preferredCourseId?: string;
  alternativeCourseIds?: string[];
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
  leadSource?: LeadSource;
  applicationChannel?: ApplicationChannel;
  status?: ApplicantStatus;
  priority?: ApplicantPriority;
  admissionRound?: AdmissionRound;
  requiredDocuments?: ApplicantDocument[];
  submittedDocuments?: ApplicantDocument[];
  verifiedDocuments?: ApplicantDocument[];
  scholarship?: Partial<ScholarshipDetails>;
  interview?: Partial<InterviewDetails>;
  feeSummary?: Partial<FeeSummary>;
  seatAllocation?: Partial<SeatAllocation>;
  parents?: ParentDetails[];
  guardian?: GuardianDetails[];
  emergencyContacts?: EmergencyContact[];
  offerLetter?: Partial<OfferLetterDetails>;
  currentStage?: string;
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
  generatedAt?: string;
}

export interface UpdateApplicantDto extends Partial<CreateApplicantDto> {
  applicationNumber?: string;
  inquiryId?: string;
  email?: string;
  phone?: string;
  timeline?: TimelineEvent[];
  decisionHistory?: DecisionHistory[];
  workflowHistory?: WorkflowHistory[];
}
