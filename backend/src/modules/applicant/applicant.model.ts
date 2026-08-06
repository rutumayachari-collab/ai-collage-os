import { Schema, model, type HydratedDocument, type Model } from 'mongoose';
import type { ApplicantSchemaType } from './applicant.types';

export type ApplicantDocument = HydratedDocument<ApplicantSchemaType>;
export { ApplicantSchemaType };

/**
 * Mongoose schema for the Applicant collection.
 *
 * Includes:
 * - Soft delete via `deletedAt` and `isActive`
 * - Audit fields (`createdBy`, `updatedBy`, `deletedBy`, `createdAt`, `updatedAt`)
 * - Enterprise indexes for query performance
 * - Text search on identity and AI fields
 */
const applicantSchema = new Schema<ApplicantSchemaType>(
  {
    applicantId: { type: String, required: true, unique: true, index: true },
    applicationNumber: { type: String, required: true, unique: true, uppercase: true, trim: true, index: true },
    inquiryId: { type: String, index: true },
    fullName: { type: String, required: true, trim: true, maxlength: 100, index: true },
    firstName: { type: String, required: true, trim: true, maxlength: 50 },
    lastName: { type: String, required: true, trim: true, maxlength: 50 },
    email: { type: String, required: true, trim: true, lowercase: true, maxlength: 100, index: true },
    phone: { type: String, required: true, trim: true, index: true },
    dateOfBirth: { type: Date },
    gender: { type: String, enum: ['MALE', 'FEMALE', 'OTHER', 'PREFER_NOT_TO_SAY'] },
    nationality: { type: String, trim: true, maxlength: 100 },
    address: { type: String, trim: true, maxlength: 500 },
    qualification: { type: String, enum: ['HIGH_SCHOOL', 'INTERMEDIATE', 'DIPLOMA', 'BACHELORS', 'MASTERS', 'PHD', 'OTHER'] },
    boardOrUniversity: { type: String, trim: true, maxlength: 200 },
    passingYear: { type: Number, min: 1990, max: new Date().getFullYear() + 1 },
    percentage: { type: Number, min: 0, max: 100 },
    cgpa: { type: Number, min: 0, max: 10 },
    category: { type: String, trim: true, maxlength: 50 },
    specialization: { type: String, trim: true, maxlength: 100 },
    preferredCourseId: { type: String, index: true },
    alternativeCourseIds: [{ type: String, index: true }],
    preferredDepartmentId: { type: String, index: true },
    preferredCampus: { type: String, trim: true, maxlength: 100 },
    preferredAdmissionYear: { type: String, trim: true, maxlength: 9 },
    budgetRange: { type: String, trim: true, maxlength: 50 },
    hostelRequired: { type: Boolean, default: false },
    transportRequired: { type: Boolean, default: false },
    source: { type: String, trim: true, maxlength: 100 },
    campaign: { type: String, trim: true, maxlength: 100 },
    medium: { type: String, trim: true, maxlength: 100 },
    referralSource: { type: String, trim: true, maxlength: 200 },
    utmSource: { type: String, trim: true, maxlength: 100 },
    utmMedium: { type: String, trim: true, maxlength: 100 },
    utmCampaign: { type: String, trim: true, maxlength: 100 },
    campaignId: { type: String, trim: true, maxlength: 50, index: true },
    leadSource: { type: String, enum: ['ONLINE', 'OFFLINE', 'COUNSELOR', 'WEBSITE', 'PHONE', 'WHATSAPP', 'EDUCATION_FAIR'], index: true },
    applicationChannel: { type: String, enum: ['ONLINE', 'OFFLINE', 'COUNSELOR', 'WEBSITE', 'PHONE', 'WHATSAPP', 'EDUCATION_FAIR'], index: true },
    applicationDate: { type: Date, required: true, index: true },
    status: { type: String, required: true, enum: ['NEW', 'DOCUMENTS_VERIFIED', 'ELIGIBLE', 'INTERVIEW_SCHEDULED', 'INTERVIEWED', 'SELECTED', 'OFFERED', 'ADMITTED', 'REJECTED', 'ARCHIVED'], default: 'NEW', index: true },
    priority: { type: String, required: true, trim: true, maxlength: 50, default: 'MEDIUM', index: true },
    admissionRound: { type: String, enum: ['CAP_ROUND_1', 'CAP_ROUND_2', 'CAP_ROUND_3', 'SPOT', 'MANAGEMENT', 'INSTITUTIONAL'], index: true },
    admissionChecklist: {
      personalDetailsCompleted: { type: Boolean, default: false },
      academicDetailsCompleted: { type: Boolean, default: false },
      documentsUploaded: { type: Boolean, default: false },
      documentsVerified: { type: Boolean, default: false },
      eligibilityPassed: { type: Boolean, default: false },
      interviewCompleted: { type: Boolean, default: false },
      feePaid: { type: Boolean, default: false },
      admissionApproved: { type: Boolean, default: false },
    },
    requiredDocuments: [
      {
        id: { type: String, required: true, trim: true },
        type: { type: String, required: true, enum: ['PHOTO', 'SIGNATURE', 'MARKSHEET', 'CERTIFICATE', 'ID_PROOF', 'ADDRESS_PROOF', 'ENTRANCE_SCORE', 'TRANSFER_CERTIFICATE', 'MIGRATION', 'OTHER'] },
        name: { type: String, required: true, trim: true, maxlength: 200 },
        description: { type: String, trim: true, maxlength: 500 },
        fileUrl: { type: String, required: true, trim: true, maxlength: 500 },
        fileSize: { type: Number, required: true, min: 0 },
        mimeType: { type: String, required: true, trim: true, maxlength: 100 },
        uploadedBy: { type: String, required: true, trim: true },
        uploadedAt: { type: Date, required: true },
        status: { type: String, required: true, enum: ['NOT_REQUIRED', 'PENDING', 'UPLOADED', 'VERIFIED', 'REJECTED', 'EXPIRED'], default: 'PENDING' },
        verifiedBy: { type: String, trim: true },
        verifiedAt: { type: Date },
        rejectionReason: { type: String, trim: true, maxlength: 500 },
        previousVersionId: { type: String, trim: true },
        isCurrent: { type: Boolean, default: true },
      },
    ],
    submittedDocuments: [
      {
        id: { type: String, required: true, trim: true },
        type: { type: String, required: true, enum: ['PHOTO', 'SIGNATURE', 'MARKSHEET', 'CERTIFICATE', 'ID_PROOF', 'ADDRESS_PROOF', 'ENTRANCE_SCORE', 'TRANSFER_CERTIFICATE', 'MIGRATION', 'OTHER'] },
        name: { type: String, required: true, trim: true, maxlength: 200 },
        description: { type: String, trim: true, maxlength: 500 },
        fileUrl: { type: String, required: true, trim: true, maxlength: 500 },
        fileSize: { type: Number, required: true, min: 0 },
        mimeType: { type: String, required: true, trim: true, maxlength: 100 },
        uploadedBy: { type: String, required: true, trim: true },
        uploadedAt: { type: Date, required: true },
        status: { type: String, required: true, enum: ['NOT_REQUIRED', 'PENDING', 'UPLOADED', 'VERIFIED', 'REJECTED', 'EXPIRED'], default: 'PENDING' },
        verifiedBy: { type: String, trim: true },
        verifiedAt: { type: Date },
        rejectionReason: { type: String, trim: true, maxlength: 500 },
        previousVersionId: { type: String, trim: true },
        isCurrent: { type: Boolean, default: true },
      },
    ],
    verifiedDocuments: [
      {
        id: { type: String, required: true, trim: true },
        type: { type: String, required: true, enum: ['PHOTO', 'SIGNATURE', 'MARKSHEET', 'CERTIFICATE', 'ID_PROOF', 'ADDRESS_PROOF', 'ENTRANCE_SCORE', 'TRANSFER_CERTIFICATE', 'MIGRATION', 'OTHER'] },
        name: { type: String, required: true, trim: true, maxlength: 200 },
        description: { type: String, trim: true, maxlength: 500 },
        fileUrl: { type: String, required: true, trim: true, maxlength: 500 },
        fileSize: { type: Number, required: true, min: 0 },
        mimeType: { type: String, required: true, trim: true, maxlength: 100 },
        uploadedBy: { type: String, required: true, trim: true },
        uploadedAt: { type: Date, required: true },
        status: { type: String, required: true, enum: ['NOT_REQUIRED', 'PENDING', 'UPLOADED', 'VERIFIED', 'REJECTED', 'EXPIRED'], default: 'PENDING' },
        verifiedBy: { type: String, trim: true },
        verifiedAt: { type: Date },
        rejectionReason: { type: String, trim: true, maxlength: 500 },
        previousVersionId: { type: String, trim: true },
        isCurrent: { type: Boolean, default: true },
      },
    ],
    scholarship: {
      applied: { type: Boolean, required: true, default: false },
      scholarshipType: { type: String, trim: true, maxlength: 100 },
      status: { type: String, required: true, enum: ['NOT_APPLIED', 'APPLIED', 'APPROVED', 'REJECTED', 'AWARDED'], default: 'NOT_APPLIED' },
      amount: { type: Number, min: 0 },
      remarks: { type: String, trim: true, maxlength: 500 },
    },
    interview: {
      scheduledAt: { type: Date, required: true },
      completedAt: { type: Date },
      panelMembers: [{ type: String, required: true, trim: true }],
      score: { type: Number, min: 0, max: 100 },
      remarks: { type: String, trim: true, maxlength: 1000 },
      recommendation: { type: String, enum: ['RECOMMENDED', 'NOT_RECOMMENDED', 'PENDING'] },
    },
    feeSummary: {
      totalFee: { type: Number, required: true, min: 0 },
      paidAmount: { type: Number, required: true, min: 0, default: 0 },
      pendingAmount: { type: Number, required: true, min: 0 },
      lastPaymentDate: { type: Date },
      paymentStatus: { type: String, required: true, enum: ['PENDING', 'PARTIAL', 'PAID', 'REFUNDED', 'CANCELLED'], default: 'PENDING' },
    },
    seatAllocation: {
      status: { type: String, required: true, enum: ['RESERVED', 'CONFIRMED', 'CANCELLED'], default: 'RESERVED' },
      seatNumber: { type: String, trim: true, maxlength: 20 },
      reservedAt: { type: Date },
      confirmedAt: { type: Date },
      cancelledAt: { type: Date },
      reservationExpiry: { type: Date },
    },
    parents: [
      {
        type: { type: String, required: true, enum: ['FATHER', 'MOTHER', 'GUARDIAN'] },
        fullName: { type: String, required: true, trim: true, maxlength: 100 },
        email: { type: String, trim: true, lowercase: true, maxlength: 100 },
        phone: { type: String, required: true, trim: true },
        occupation: { type: String, trim: true, maxlength: 100 },
        annualIncome: { type: Number, min: 0 },
      },
    ],
    guardian: [
      {
        fullName: { type: String, required: true, trim: true, maxlength: 100 },
        relationship: { type: String, required: true, trim: true, maxlength: 50 },
        email: { type: String, trim: true, lowercase: true, maxlength: 100 },
        phone: { type: String, required: true, trim: true },
        occupation: { type: String, trim: true, maxlength: 100 },
        address: { type: String, trim: true, maxlength: 500 },
      },
    ],
    emergencyContacts: [
      {
        fullName: { type: String, required: true, trim: true, maxlength: 100 },
        relationship: { type: String, required: true, trim: true, maxlength: 50 },
        phone: { type: String, required: true, trim: true },
        alternatePhone: { type: String, trim: true },
        address: { type: String, trim: true, maxlength: 500 },
      },
    ],
    timeline: [
      {
        eventId: { type: String, required: true, trim: true },
        eventType: { type: String, required: true, enum: ['APPLICATION_SUBMITTED', 'DOCUMENT_UPLOADED', 'DOCUMENT_VERIFIED', 'ELIGIBILITY_CHECKED', 'INTERVIEW_SCHEDULED', 'INTERVIEW_COMPLETED', 'OFFER_GENERATED', 'OFFER_ACCEPTED', 'FEE_PAID', 'ADMISSION_APPROVED', 'STUDENT_CREATED', 'STATUS_CHANGED', 'NOTE_ADDED'] },
        description: { type: String, required: true, trim: true, maxlength: 1000 },
        performedBy: { type: String, required: true, trim: true },
        createdAt: { type: Date, required: true },
      },
    ],
    decisionHistory: [
      {
        decision: { type: String, required: true, enum: ['ACCEPTED', 'REJECTED', 'WAITLISTED', 'CONDITIONAL'] },
        reviewedBy: { type: String, required: true, trim: true },
        remarks: { type: String, trim: true, maxlength: 1000 },
        createdAt: { type: Date, required: true },
      },
    ],
    workflowHistory: [
      {
        previousState: { type: String, required: true, enum: ['NEW', 'DOCUMENTS_VERIFIED', 'ELIGIBLE', 'INTERVIEW_SCHEDULED', 'INTERVIEWED', 'SELECTED', 'OFFERED', 'ADMITTED', 'REJECTED', 'ARCHIVED'] },
        newState: { type: String, required: true, enum: ['NEW', 'DOCUMENTS_VERIFIED', 'ELIGIBLE', 'INTERVIEW_SCHEDULED', 'INTERVIEWED', 'SELECTED', 'OFFERED', 'ADMITTED', 'REJECTED', 'ARCHIVED'] },
        changedBy: { type: String, required: true, trim: true },
        changedAt: { type: Date, required: true },
        reason: { type: String, trim: true, maxlength: 500 },
      },
    ],
    offerLetter: {
      status: { type: String, enum: ['GENERATED', 'ACCEPTED', 'REJECTED', 'EXPIRED'], default: 'GENERATED' },
      generatedAt: { type: Date },
      acceptedAt: { type: Date },
      expiredAt: { type: Date },
      documentId: { type: String, trim: true },
      validUntil: { type: Date },
    },
    currentStage: { type: String, required: true, trim: true, maxlength: 100, default: 'APPLICATION_SUBMITTED' },
    assignedReviewerId: { type: String, index: true },
    assignedInterviewerId: { type: String, index: true },
    aiEligibilityScore: { type: Number, min: 0, max: 100, index: true },
    aiRecommendationScore: { type: Number, min: 0, max: 100 },
    aiRiskLevel: { type: String, trim: true, maxlength: 50 },
    aiSuggestedCourseId: { type: String, index: true },
    aiDocumentAnalysis: { type: String, trim: true, maxlength: 2000 },
    aiInterviewScorePrediction: { type: Number, min: 0, max: 100 },
    aiFinalDecision: { type: String, trim: true, maxlength: 500 },
    aiDropoutRisk: { type: String, trim: true, maxlength: 50 },
    aiFinancialRisk: { type: String, trim: true, maxlength: 50 },
    aiDocumentCompleteness: { type: Number, min: 0, max: 100 },
    aiRecommendedScholarships: [{ type: String, trim: true }],
    aiRecommendedNextAction: { type: String, trim: true, maxlength: 500 },
    aiModelVersion: { type: String, trim: true, maxlength: 50 },
    generatedAt: { type: Date },
    conversion: {
      studentId: { type: String, trim: true },
      convertedAt: { type: Date },
      convertedBy: { type: String, trim: true },
    },
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
applicantSchema.index({ status: 1, priority: 1 });
applicantSchema.index({ preferredCourseId: 1, status: 1 });
applicantSchema.index({ preferredDepartmentId: 1, status: 1 });
applicantSchema.index({ assignedReviewerId: 1, status: 1 });
applicantSchema.index({ assignedInterviewerId: 1, status: 1 });
applicantSchema.index({ admissionRound: 1, status: 1 });
applicantSchema.index({ applicationChannel: 1, status: 1 });
applicantSchema.index({ leadSource: 1, status: 1 });
applicantSchema.index({ 'feeSummary.paymentStatus': 1 });
applicantSchema.index({ 'seatAllocation.status': 1 });
applicantSchema.index({ 'conversion.studentId': 1 });
applicantSchema.index({ createdAt: -1 });
applicantSchema.index({ deletedAt: 1 });
applicantSchema.index({ isActive: 1, status: 1 });
applicantSchema.index({ campaignId: 1 });

/**
 * Text index for global search across applicant identity and AI fields.
 */
applicantSchema.index(
  {
    fullName: 'text',
    email: 'text',
    phone: 'text',
    aiDocumentAnalysis: 'text',
    aiFinalDecision: 'text',
  },
  {
    weights: {
      fullName: 10,
      email: 10,
      phone: 10,
      aiDocumentAnalysis: 5,
      aiFinalDecision: 5,
    },
  },
);

export const ApplicantModel: Model<ApplicantSchemaType> = model<ApplicantSchemaType>('Applicant', applicantSchema);
