import { Schema, model, type HydratedDocument, type Model } from 'mongoose';
import type { InquirySchemaType } from './inquiry.types';

export type InquiryDocument = HydratedDocument<InquirySchemaType>;
export { InquirySchemaType };

const inquirySchema = new Schema<InquirySchemaType>(
  {
    inquiryId: { type: String, required: true, unique: true, index: true },
    inquiryNumber: { type: String, required: true, unique: true, uppercase: true, trim: true, index: true },
    fullName: { type: String, required: true, trim: true, maxlength: 100, index: true },
    firstName: { type: String, required: true, trim: true, maxlength: 50 },
    lastName: { type: String, required: true, trim: true, maxlength: 50 },
    email: { type: String, required: true, trim: true, lowercase: true, maxlength: 100, index: true },
    phone: { type: String, required: true, trim: true, index: true },
    dateOfBirth: { type: Date },
    gender: { type: String, enum: ['MALE', 'FEMALE', 'OTHER', 'PREFER_NOT_TO_SAY'] },
    preferredCommunication: { type: String, enum: ['EMAIL', 'PHONE', 'SMS', 'WHATSAPP'], index: true },
    country: { type: String, trim: true, maxlength: 100 },
    state: { type: String, trim: true, maxlength: 100 },
    city: { type: String, trim: true, maxlength: 100 },
    address: { type: String, trim: true, maxlength: 500 },
    qualification: { type: String, enum: ['HIGH_SCHOOL', 'INTERMEDIATE', 'DIPLOMA', 'BACHELORS', 'MASTERS', 'PHD', 'OTHER'] },
    boardOrUniversity: { type: String, trim: true, maxlength: 200 },
    passingYear: { type: Number, min: 1990, max: new Date().getFullYear() + 1 },
    percentage: { type: Number, min: 0, max: 100 },
    cgpa: { type: Number, min: 0, max: 10 },
    category: { type: String, trim: true, maxlength: 50 },
    specialization: { type: String, trim: true, maxlength: 100 },
    preferredCourseId: { type: String, index: true },
    aiRecommendedCourseIds: [{ type: String, index: true }],
    alternativeCourseIds: [{ type: String, index: true }],
    preferredDepartmentId: { type: String, index: true },
    preferredCampus: { type: String, trim: true, maxlength: 100 },
    preferredAdmissionYear: { type: String, trim: true, maxlength: 9 },
    budgetRange: { type: String, trim: true, maxlength: 50 },
    hostelRequired: { type: Boolean, default: false },
    transportRequired: { type: Boolean, default: false },
    source: { type: String, required: true, enum: ['WEBSITE', 'SOCIAL_MEDIA', 'REFERRAL', 'WALK_IN', 'CALL', 'EMAIL', 'WHATSAPP', 'EDUCATION_FAIR', 'OTHER'], index: true },
    campaign: { type: String, trim: true, maxlength: 100 },
    medium: { type: String, trim: true, maxlength: 100 },
    referralSource: { type: String, trim: true, maxlength: 200 },
    utmSource: { type: String, trim: true, maxlength: 100 },
    utmMedium: { type: String, trim: true, maxlength: 100 },
    utmCampaign: { type: String, trim: true, maxlength: 100 },
    campaignId: { type: String, trim: true, maxlength: 50, index: true },
    inquiryDate: { type: Date, required: true, index: true },
    status: { type: String, required: true, enum: ['NEW', 'CONTACTED', 'INTERESTED', 'APPLIED', 'ENROLLED', 'REJECTED', 'ARCHIVED'], default: 'NEW', index: true },
    priority: { type: String, required: true, enum: ['LOW', 'MEDIUM', 'HIGH', 'URGENT'], default: 'MEDIUM', index: true },
    aiSummary: { type: String, trim: true, maxlength: 2000 },
    aiLeadScore: { type: Number, min: 0, max: 100, index: true },
    aiLeadScoreHistory: [
      {
        score: { type: Number, required: true, min: 0, max: 100 },
        reason: { type: String, required: true, trim: true, maxlength: 500 },
        generatedAt: { type: Date, required: true },
        generatedBy: { type: String, required: true, trim: true },
      },
    ],
    aiConfidenceScore: { type: Number, min: 0, max: 100 },
    aiRecommendedDepartmentId: { type: String, index: true },
    aiIntent: { type: String, enum: ['HIGH_INTENT', 'MEDIUM_INTENT', 'LOW_INTENT', 'UNCERTAIN'] },
    aiSentiment: { type: String, enum: ['POSITIVE', 'NEUTRAL', 'NEGATIVE'] },
    aiRiskLevel: { type: String, enum: ['LOW', 'MEDIUM', 'HIGH'] },
    aiNextBestAction: { type: String, trim: true, maxlength: 500 },
    aiConversationSummary: { type: String, trim: true, maxlength: 3000 },
    assignedCounselorId: { type: String, index: true },
    assignedAt: { type: Date },
    counselorNotes: { type: String, trim: true, maxlength: 2000 },
    counselingMode: { type: String, enum: ['ONLINE', 'IN_PERSON', 'PHONE', 'VIDEO_CALL'] },
    counselingOutcome: { type: String, enum: ['INTERESTED', 'NOT_INTERESTED', 'PENDING', 'APPLIED', 'ENROLLED'] },
    nextFollowUpDate: { type: Date, index: true },
    lastContactDate: { type: Date },
    followUpCount: { type: Number, min: 0, default: 0 },
    lastFollowUpResult: { type: String, trim: true, maxlength: 500 },
    timeline: [
      {
        eventId: { type: String, required: true, trim: true },
        eventType: { type: String, required: true, enum: ['CREATED', 'CONTACTED', 'COUNSELING_SCHEDULED', 'COUNSELING_COMPLETED', 'FOLLOW_UP', 'APPLIED', 'ENROLLED', 'ARCHIVED', 'NOTE_ADDED', 'STATUS_CHANGED'] },
        description: { type: String, required: true, trim: true, maxlength: 1000 },
        performedBy: { type: String, required: true },
        performedByRole: { type: String, required: true, enum: ['SYSTEM', 'AI', 'COUNSELOR', 'ADMIN', 'STUDENT'] },
        createdAt: { type: Date, required: true },
      },
    ],
    tags: [{ type: String, trim: true, index: true }],
    conversion: {
      isConverted: { type: Boolean, required: true, default: false },
      applicantId: { type: String, trim: true },
      convertedAt: { type: Date },
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

inquirySchema.index({ status: 1, priority: 1 });
inquirySchema.index({ source: 1, createdAt: -1 });
inquirySchema.index({ assignedCounselorId: 1, status: 1 });
inquirySchema.index({ preferredCourseId: 1, status: 1 });
inquirySchema.index({ preferredDepartmentId: 1, status: 1 });
inquirySchema.index({ nextFollowUpDate: 1 });
inquirySchema.index({ aiLeadScore: -1 });
inquirySchema.index({ createdAt: -1 });
inquirySchema.index({ deletedAt: 1 });
inquirySchema.index({ isActive: 1, status: 1 });
inquirySchema.index({ tags: 1 });
inquirySchema.index({ 'conversion.isConverted': 1 });
inquirySchema.index({ utmSource: 1, utmMedium: 1 });
inquirySchema.index({ campaignId: 1 });

inquirySchema.index(
  {
    fullName: 'text',
    email: 'text',
    phone: 'text',
    aiSummary: 'text',
    counselorNotes: 'text',
    aiConversationSummary: 'text',
  },
  {
    weights: {
      fullName: 10,
      email: 10,
      phone: 10,
      aiSummary: 5,
      counselorNotes: 5,
      aiConversationSummary: 5,
    },
  },
);

export const InquiryModel: Model<InquirySchemaType> = model<InquirySchemaType>('Inquiry', inquirySchema);
