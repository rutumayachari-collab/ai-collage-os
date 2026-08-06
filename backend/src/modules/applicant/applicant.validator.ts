import { z } from 'zod';
import { objectIdSchema } from '../../shared/validators';

/**
 * Parent or guardian details schema.
 */
export const parentSchema = z.object({
  type: z.enum(['FATHER', 'MOTHER', 'GUARDIAN']),
  fullName: z.string().trim().min(1, 'Full name is required').max(100),
  email: z.string().trim().email('A valid email is required').max(100).optional().or(z.literal('')),
  phone: z.string().trim().regex(/^\+?[0-9]{10,15}$/, 'A valid phone number is required'),
  occupation: z.string().trim().max(100).optional().or(z.literal('')),
  annualIncome: z.coerce.number().int().min(0).optional(),
});

/**
 * Guardian details schema.
 */
export const guardianSchema = z.object({
  fullName: z.string().trim().min(1, 'Full name is required').max(100),
  relationship: z.string().trim().min(1, 'Relationship is required').max(50),
  email: z.string().trim().email('A valid email is required').max(100).optional().or(z.literal('')),
  phone: z.string().trim().regex(/^\+?[0-9]{10,15}$/, 'A valid phone number is required'),
  occupation: z.string().trim().max(100).optional().or(z.literal('')),
  address: z.string().trim().max(500).optional().or(z.literal('')),
});

/**
 * Emergency contact details schema.
 */
export const emergencyContactSchema = z.object({
  fullName: z.string().trim().min(1, 'Full name is required').max(100),
  relationship: z.string().trim().min(1, 'Relationship is required').max(50),
  phone: z.string().trim().regex(/^\+?[0-9]{10,15}$/, 'A valid phone number is required'),
  alternatePhone: z.string().trim().regex(/^\+?[0-9]{10,15}$/, 'A valid phone number is required').optional().or(z.literal('')),
  address: z.string().trim().max(500).optional().or(z.literal('')),
});

/**
 * Applicant document metadata schema.
 */
export const applicantDocumentSchema = z.object({
  id: z.string().trim().min(1, 'Document ID is required'),
  type: z.enum(['PHOTO', 'SIGNATURE', 'MARKSHEET', 'CERTIFICATE', 'ID_PROOF', 'ADDRESS_PROOF', 'ENTRANCE_SCORE', 'TRANSFER_CERTIFICATE', 'MIGRATION', 'OTHER']),
  name: z.string().trim().min(1, 'Document name is required').max(200),
  description: z.string().trim().max(500).optional().or(z.literal('')),
  fileUrl: z.string().trim().min(1, 'File URL is required').max(500),
  fileSize: z.coerce.number().int().min(0),
  mimeType: z.string().trim().min(1, 'MIME type is required').max(100),
  uploadedBy: z.string().trim().min(1, 'Uploaded by is required'),
  uploadedAt: z.coerce.date(),
  status: z.enum(['NOT_REQUIRED', 'PENDING', 'UPLOADED', 'VERIFIED', 'REJECTED', 'EXPIRED']).default('PENDING'),
  verifiedBy: z.string().trim().optional().or(z.literal('')),
  verifiedAt: z.coerce.date().optional(),
  rejectionReason: z.string().trim().max(500).optional().or(z.literal('')),
  previousVersionId: z.string().trim().optional().or(z.literal('')),
  isCurrent: z.boolean().default(true),
});

/**
 * Interview details schema.
 */
export const interviewSchema = z.object({
  scheduledAt: z.coerce.date(),
  completedAt: z.coerce.date().optional(),
  panelMembers: z.array(z.string().trim()).min(1, 'At least one panel member is required'),
  score: z.coerce.number().int().min(0).max(100).optional(),
  remarks: z.string().trim().max(1000).optional().or(z.literal('')),
  recommendation: z.enum(['RECOMMENDED', 'NOT_RECOMMENDED', 'PENDING']).optional(),
});

/**
 * Fee summary schema.
 */
export const feeSummarySchema = z.object({
  totalFee: z.coerce.number().int().min(0),
  paidAmount: z.coerce.number().int().min(0).default(0),
  pendingAmount: z.coerce.number().int().min(0),
  lastPaymentDate: z.coerce.date().optional(),
  paymentStatus: z.enum(['PENDING', 'PARTIAL', 'PAID', 'REFUNDED', 'CANCELLED']).default('PENDING'),
});

/**
 * Seat allocation schema.
 */
export const seatAllocationSchema = z.object({
  status: z.enum(['RESERVED', 'CONFIRMED', 'CANCELLED']).default('RESERVED'),
  seatNumber: z.string().trim().max(20).optional().or(z.literal('')),
  reservedAt: z.coerce.date().optional(),
  confirmedAt: z.coerce.date().optional(),
  cancelledAt: z.coerce.date().optional(),
  reservationExpiry: z.coerce.date().optional(),
});

/**
 * Offer letter schema.
 */
export const offerLetterSchema = z.object({
  status: z.enum(['GENERATED', 'ACCEPTED', 'REJECTED', 'EXPIRED']).default('GENERATED'),
  generatedAt: z.coerce.date().optional(),
  acceptedAt: z.coerce.date().optional(),
  expiredAt: z.coerce.date().optional(),
  documentId: z.string().trim().optional().or(z.literal('')),
  validUntil: z.coerce.date().optional(),
});

/**
 * Scholarship details schema.
 */
export const scholarshipSchema = z.object({
  applied: z.boolean().default(false),
  scholarshipType: z.string().trim().max(100).optional().or(z.literal('')),
  status: z.enum(['NOT_APPLIED', 'APPLIED', 'APPROVED', 'REJECTED', 'AWARDED']).default('NOT_APPLIED'),
  amount: z.coerce.number().int().min(0).optional(),
  remarks: z.string().trim().max(500).optional().or(z.literal('')),
});

/**
 * Admission checklist schema.
 */
export const admissionChecklistSchema = z.object({
  personalDetailsCompleted: z.boolean().default(false),
  academicDetailsCompleted: z.boolean().default(false),
  documentsUploaded: z.boolean().default(false),
  documentsVerified: z.boolean().default(false),
  eligibilityPassed: z.boolean().default(false),
  interviewCompleted: z.boolean().default(false),
  feePaid: z.boolean().default(false),
  admissionApproved: z.boolean().default(false),
});

/**
 * Timeline event schema.
 */
export const timelineEventSchema = z.object({
  eventId: z.string().trim().min(1, 'Event ID is required'),
  eventType: z.enum(['APPLICATION_SUBMITTED', 'DOCUMENT_UPLOADED', 'DOCUMENT_VERIFIED', 'ELIGIBILITY_CHECKED', 'INTERVIEW_SCHEDULED', 'INTERVIEW_COMPLETED', 'OFFER_GENERATED', 'OFFER_ACCEPTED', 'FEE_PAID', 'ADMISSION_APPROVED', 'STUDENT_CREATED', 'STATUS_CHANGED', 'NOTE_ADDED']),
  description: z.string().trim().min(1, 'Description is required').max(1000),
  performedBy: z.string().trim().min(1, 'Performed by is required'),
});

/**
 * Decision history schema.
 */
export const decisionHistorySchema = z.object({
  decision: z.enum(['ACCEPTED', 'REJECTED', 'WAITLISTED', 'CONDITIONAL']),
  reviewedBy: z.string().trim().min(1, 'Reviewed by is required'),
  remarks: z.string().trim().max(1000).optional().or(z.literal('')),
});

/**
 * Workflow history entry schema.
 */
export const workflowHistorySchema = z.object({
  previousState: z.enum(['NEW', 'DOCUMENTS_VERIFIED', 'ELIGIBLE', 'INTERVIEW_SCHEDULED', 'INTERVIEWED', 'SELECTED', 'OFFERED', 'ADMITTED', 'REJECTED', 'ARCHIVED']),
  newState: z.enum(['NEW', 'DOCUMENTS_VERIFIED', 'ELIGIBLE', 'INTERVIEW_SCHEDULED', 'INTERVIEWED', 'SELECTED', 'OFFERED', 'ADMITTED', 'REJECTED', 'ARCHIVED']),
  changedBy: z.string().trim().min(1, 'Changed by is required'),
  changedAt: z.coerce.date(),
  reason: z.string().trim().max(500).optional().or(z.literal('')),
});

/**
 * Create applicant schema.
 */
export const createApplicantSchema = z.object({
  applicationNumber: z.string().trim().regex(/^APP-\d{4}-\d{6}$/, 'Application number must follow format APP-YYYY-NNNNNN'),
  inquiryId: objectIdSchema.optional(),
  fullName: z.string().trim().min(2, 'Full name must be at least 2 characters').max(100),
  firstName: z.string().trim().min(1, 'First name is required').max(50),
  lastName: z.string().trim().min(1, 'Last name is required').max(50),
  email: z.string().trim().email('A valid email is required').max(100),
  phone: z.string().trim().regex(/^\+?[0-9]{10,15}$/, 'A valid phone number is required'),
  dateOfBirth: z.coerce.date().optional(),
  gender: z.enum(['MALE', 'FEMALE', 'OTHER', 'PREFER_NOT_TO_SAY']).optional(),
  nationality: z.string().trim().max(100).optional().or(z.literal('')),
  address: z.string().trim().max(500).optional().or(z.literal('')),
  qualification: z.enum(['HIGH_SCHOOL', 'INTERMEDIATE', 'DIPLOMA', 'BACHELORS', 'MASTERS', 'PHD', 'OTHER']).optional(),
  boardOrUniversity: z.string().trim().max(200).optional().or(z.literal('')),
  passingYear: z.coerce.number().int().min(1990).max(new Date().getFullYear() + 1).optional(),
  percentage: z.coerce.number().int().min(0).max(100).optional(),
  cgpa: z.coerce.number().int().min(0).max(10).optional(),
  category: z.string().trim().max(50).optional().or(z.literal('')),
  specialization: z.string().trim().max(100).optional().or(z.literal('')),
  preferredCourseId: objectIdSchema.optional(),
  alternativeCourseIds: z.array(objectIdSchema).default([]),
  preferredDepartmentId: objectIdSchema.optional(),
  preferredCampus: z.string().trim().max(100).optional().or(z.literal('')),
  preferredAdmissionYear: z.string().trim().regex(/^\d{4}-\d{4}$/, 'Admission year must be in format YYYY-YYYY').optional().or(z.literal('')),
  budgetRange: z.string().trim().max(50).optional().or(z.literal('')),
  hostelRequired: z.boolean().default(false),
  transportRequired: z.boolean().default(false),
  source: z.string().trim().max(100).optional().or(z.literal('')),
  campaign: z.string().trim().max(100).optional().or(z.literal('')),
  medium: z.string().trim().max(100).optional().or(z.literal('')),
  referralSource: z.string().trim().max(200).optional().or(z.literal('')),
  utmSource: z.string().trim().max(100).optional().or(z.literal('')),
  utmMedium: z.string().trim().max(100).optional().or(z.literal('')),
  utmCampaign: z.string().trim().max(100).optional().or(z.literal('')),
  campaignId: z.string().trim().max(50).optional().or(z.literal('')),
  leadSource: z.enum(['ONLINE', 'OFFLINE', 'COUNSELOR', 'WEBSITE', 'PHONE', 'WHATSAPP', 'EDUCATION_FAIR']).optional(),
  applicationChannel: z.enum(['ONLINE', 'OFFLINE', 'COUNSELOR', 'WEBSITE', 'PHONE', 'WHATSAPP', 'EDUCATION_FAIR']).optional(),
  applicationDate: z.coerce.date(),
  status: z.enum(['NEW', 'DOCUMENTS_VERIFIED', 'ELIGIBLE', 'INTERVIEW_SCHEDULED', 'INTERVIEWED', 'SELECTED', 'OFFERED', 'ADMITTED', 'REJECTED', 'ARCHIVED']).default('NEW'),
  priority: z.string().trim().max(50).default('MEDIUM'),
  admissionRound: z.enum(['CAP_ROUND_1', 'CAP_ROUND_2', 'CAP_ROUND_3', 'SPOT', 'MANAGEMENT', 'INSTITUTIONAL']).optional(),
  admissionChecklist: admissionChecklistSchema.default({
    personalDetailsCompleted: false,
    academicDetailsCompleted: false,
    documentsUploaded: false,
    documentsVerified: false,
    eligibilityPassed: false,
    interviewCompleted: false,
    feePaid: false,
    admissionApproved: false,
  }),
  requiredDocuments: z.array(applicantDocumentSchema).default([]),
  submittedDocuments: z.array(applicantDocumentSchema).default([]),
  verifiedDocuments: z.array(applicantDocumentSchema).default([]),
  scholarship: scholarshipSchema.default({ applied: false, status: 'NOT_APPLIED' }),
  interview: interviewSchema.optional(),
  feeSummary: feeSummarySchema.default({ totalFee: 0, paidAmount: 0, pendingAmount: 0, paymentStatus: 'PENDING' }),
  seatAllocation: seatAllocationSchema.default({ status: 'RESERVED' }),
  parents: z.array(parentSchema).default([]),
  guardian: z.array(guardianSchema).default([]),
  emergencyContacts: z.array(emergencyContactSchema).default([]),
  timeline: z.array(timelineEventSchema).default([]),
  decisionHistory: z.array(decisionHistorySchema).default([]),
  workflowHistory: z.array(workflowHistorySchema).default([]),
  offerLetter: offerLetterSchema.optional(),
  currentStage: z.string().trim().max(100).default('APPLICATION_SUBMITTED'),
  assignedReviewerId: objectIdSchema.optional(),
  assignedInterviewerId: objectIdSchema.optional(),
  aiEligibilityScore: z.coerce.number().int().min(0).max(100).optional(),
  aiRecommendationScore: z.coerce.number().int().min(0).max(100).optional(),
  aiRiskLevel: z.string().trim().max(50).optional().or(z.literal('')),
  aiSuggestedCourseId: objectIdSchema.optional(),
  aiDocumentAnalysis: z.string().trim().max(2000).optional().or(z.literal('')),
  aiInterviewScorePrediction: z.coerce.number().int().min(0).max(100).optional(),
  aiFinalDecision: z.string().trim().max(500).optional().or(z.literal('')),
  aiDropoutRisk: z.string().trim().max(50).optional().or(z.literal('')),
  aiFinancialRisk: z.string().trim().max(50).optional().or(z.literal('')),
  aiDocumentCompleteness: z.coerce.number().int().min(0).max(100).optional(),
  aiRecommendedScholarships: z.array(z.string().trim()).default([]),
  aiRecommendedNextAction: z.string().trim().max(500).optional().or(z.literal('')),
  aiModelVersion: z.string().trim().max(50).optional().or(z.literal('')),
  generatedAt: z.coerce.date().optional(),
  isActive: z.boolean().default(true),
});

/**
 * Update applicant schema.
 */
export const updateApplicantSchema = createApplicantSchema.partial().omit({
  applicationNumber: true,
  inquiryId: true,
  email: true,
  phone: true,
  timeline: true,
  decisionHistory: true,
  workflowHistory: true,
});

/**
 * Query parameters for applicants.
 */
export const applicantQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  sort: z.string().trim().optional(),
  order: z.enum(['asc', 'desc']).default('desc'),
  search: z.string().trim().optional(),
  status: z.enum(['NEW', 'DOCUMENTS_VERIFIED', 'ELIGIBLE', 'INTERVIEW_SCHEDULED', 'INTERVIEWED', 'SELECTED', 'OFFERED', 'ADMITTED', 'REJECTED', 'ARCHIVED']).optional(),
  priority: z.string().trim().optional(),
  admissionRound: z.enum(['CAP_ROUND_1', 'CAP_ROUND_2', 'CAP_ROUND_3', 'SPOT', 'MANAGEMENT', 'INSTITUTIONAL']).optional(),
  applicationChannel: z.enum(['ONLINE', 'OFFLINE', 'COUNSELOR', 'WEBSITE', 'PHONE', 'WHATSAPP', 'EDUCATION_FAIR']).optional(),
  preferredCourseId: z.string().trim().optional(),
  preferredDepartmentId: z.string().trim().optional(),
  assignedReviewerId: z.string().trim().optional(),
  assignedInterviewerId: z.string().trim().optional(),
  paymentStatus: z.enum(['PENDING', 'PARTIAL', 'PAID', 'REFUNDED', 'CANCELLED']).optional(),
  aiRiskLevel: z.string().trim().optional(),
  isActive: z.coerce.boolean().optional(),
  applicationDateFrom: z.string().trim().optional(),
  applicationDateTo: z.string().trim().optional(),
});

/**
 * Assign reviewer schema.
 */
export const assignReviewerSchema = z.object({
  reviewerId: objectIdSchema,
});

/**
 * Schedule interview schema.
 */
export const scheduleInterviewSchema = z.object({
  scheduledAt: z.coerce.date(),
  panelMembers: z.array(z.string().trim()).min(1, 'At least one panel member is required'),
});

/**
 * Interview result schema.
 */
export const interviewResultSchema = z.object({
  score: z.coerce.number().int().min(0).max(100),
  remarks: z.string().trim().max(1000).optional().or(z.literal('')),
  recommendation: z.enum(['RECOMMENDED', 'NOT_RECOMMENDED', 'PENDING']),
});

/**
 * Update payment schema.
 */
export const updatePaymentSchema = z.object({
  paidAmount: z.coerce.number().int().min(0),
  paymentStatus: z.enum(['PENDING', 'PARTIAL', 'PAID', 'REFUNDED', 'CANCELLED']),
});

/**
 * Update status schema.
 */
export const updateStatusSchema = z.object({
  status: z.enum(['NEW', 'DOCUMENTS_VERIFIED', 'ELIGIBLE', 'INTERVIEW_SCHEDULED', 'INTERVIEWED', 'SELECTED', 'OFFERED', 'ADMITTED', 'REJECTED', 'ARCHIVED']),
  note: z.string().trim().max(500).optional().or(z.literal('')),
});

/**
 * Bulk import schema.
 */
export const bulkImportSchema = z.object({
  applicants: z.array(createApplicantSchema).min(1).max(500),
});

/**
 * Bulk update schema.
 */
export const bulkUpdateSchema = z.object({
  ids: z.array(objectIdSchema).min(1).max(500),
  updates: updateApplicantSchema,
});

/**
 * Parent input type.
 */
export type ParentInput = z.infer<typeof parentSchema>;

/**
 * Guardian input type.
 */
export type GuardianInput = z.infer<typeof guardianSchema>;

/**
 * Emergency contact input type.
 */
export type EmergencyContactInput = z.infer<typeof emergencyContactSchema>;

/**
 * Applicant document input type.
 */
export type ApplicantDocumentInput = z.infer<typeof applicantDocumentSchema>;

/**
 * Interview input type.
 */
export type InterviewInput = z.infer<typeof interviewSchema>;

/**
 * Fee summary input type.
 */
export type FeeSummaryInput = z.infer<typeof feeSummarySchema>;

/**
 * Seat allocation input type.
 */
export type SeatAllocationInput = z.infer<typeof seatAllocationSchema>;

/**
 * Offer letter input type.
 */
export type OfferLetterInput = z.infer<typeof offerLetterSchema>;

/**
 * Scholarship input type.
 */
export type ScholarshipInput = z.infer<typeof scholarshipSchema>;

/**
 * Admission checklist input type.
 */
export type AdmissionChecklistInput = z.infer<typeof admissionChecklistSchema>;

/**
 * Timeline event input type.
 */
export type TimelineEventInput = z.infer<typeof timelineEventSchema>;

/**
 * Decision history input type.
 */
export type DecisionHistoryInput = z.infer<typeof decisionHistorySchema>;

/**
 * Workflow history input type.
 */
export type WorkflowHistoryInput = z.infer<typeof workflowHistorySchema>;

/**
 * Create applicant input type.
 */
export type CreateApplicantInput = z.infer<typeof createApplicantSchema>;

/**
 * Update applicant input type.
 */
export type UpdateApplicantInput = z.infer<typeof updateApplicantSchema>;

/**
 * Applicant query input type.
 */
export type ApplicantQueryInput = z.infer<typeof applicantQuerySchema>;

/**
 * Assign reviewer input type.
 */
export type AssignReviewerInput = z.infer<typeof assignReviewerSchema>;

/**
 * Schedule interview input type.
 */
export type ScheduleInterviewInput = z.infer<typeof scheduleInterviewSchema>;

/**
 * Interview result input type.
 */
export type InterviewResultInput = z.infer<typeof interviewResultSchema>;

/**
 * Update payment input type.
 */
export type UpdatePaymentInput = z.infer<typeof updatePaymentSchema>;

/**
 * Update status input type.
 */
export type UpdateStatusInput = z.infer<typeof updateStatusSchema>;

/**
 * Bulk import input type.
 */
export type BulkImportInput = z.infer<typeof bulkImportSchema>;

/**
 * Bulk update input type.
 */
export type BulkUpdateInput = z.infer<typeof bulkUpdateSchema>;
