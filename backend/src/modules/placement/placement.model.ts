import { Schema, model, type HydratedDocument, type Model } from 'mongoose';
import type {
  CompanySchemaType,
  DriveSchemaType,
  ApplicationSchemaType,
  InterviewSchemaType,
  OfferSchemaType,
  PlacementSchemaType,
  PlacementStatisticsSchemaType,
} from './placement.types';

export type CompanyDocument = HydratedDocument<CompanySchemaType>;
export type DriveDocument = HydratedDocument<DriveSchemaType>;
export type ApplicationDocument = HydratedDocument<ApplicationSchemaType>;
export type InterviewDocument = HydratedDocument<InterviewSchemaType>;
export type OfferDocument = HydratedDocument<OfferSchemaType>;
export type PlacementDocument = HydratedDocument<PlacementSchemaType>;
export type PlacementStatisticsDocument = HydratedDocument<PlacementStatisticsSchemaType>;

export { CompanySchemaType, DriveSchemaType, ApplicationSchemaType, InterviewSchemaType, OfferSchemaType, PlacementSchemaType, PlacementStatisticsSchemaType };

const companySchema = new Schema<CompanySchemaType>(
  {
    companyId: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true, trim: true, maxlength: 100, index: true },
    industry: { type: String, required: true, trim: true, maxlength: 100, index: true },
    website: { type: String, trim: true, maxlength: 200 },
    hrName: { type: String, trim: true, maxlength: 100 },
    hrEmail: { type: String, trim: true, maxlength: 100 },
    hrPhone: { type: String, trim: true, maxlength: 20 },
    address: { type: String, trim: true, maxlength: 500 },
    isActive: { type: Boolean, required: true, default: true, index: true },
    status: { type: String, required: true, enum: ['ACTIVE', 'INACTIVE'], default: 'ACTIVE', index: true },
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

companySchema.index({ name: 'text', industry: 'text', hrName: 'text' });
companySchema.index({ isActive: 1, status: 1 });
companySchema.index({ createdAt: -1 });
companySchema.index({ deletedAt: 1 });

const driveSchema = new Schema<DriveSchemaType>(
  {
    driveId: { type: String, required: true, unique: true, index: true },
    companyId: { type: String, required: true, index: true },
    driveName: { type: String, required: true, trim: true, maxlength: 100, index: true },
    driveDate: { type: Date, required: true, index: true },
    registrationDeadline: { type: Date, required: true, index: true },
    eligibleCourses: [{ type: String, trim: true, index: true }],
    eligibleBranches: [{ type: String, trim: true, index: true }],
    minPercentage: { type: Number, required: true, min: 0, max: 100 },
    maxBacklogs: { type: Number, required: true, min: 0, max: 10 },
    packageDetails: { type: String, required: true, trim: true, maxlength: 500 },
    driveType: { type: String, required: true, enum: ['ON_CAMPUS', 'OFF_CAMPUS'], index: true },
    status: { type: String, required: true, enum: ['SCHEDULED', 'REGISTRATION_OPEN', 'REGISTRATION_CLOSED', 'COMPLETED', 'CANCELLED'], default: 'SCHEDULED', index: true },
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

driveSchema.index({ companyId: 1, status: 1 });
driveSchema.index({ companyId: 1, driveDate: 1 });
driveSchema.index({ driveType: 1, status: 1 });
driveSchema.index({ isActive: 1, status: 1 });
driveSchema.index({ createdAt: -1 });
driveSchema.index({ deletedAt: 1 });

const applicationSchema = new Schema<ApplicationSchemaType>(
  {
    applicationId: { type: String, required: true, unique: true, index: true },
    studentId: { type: String, required: true, index: true },
    driveId: { type: String, required: true, index: true },
    appliedDate: { type: Date, required: true, index: true },
    status: { type: String, required: true, enum: ['APPLIED', 'SHORTLISTED', 'INTERVIEW_SCHEDULED', 'INTERVIEWED', 'SELECTED', 'REJECTED', 'WITHDRAWN'], default: 'APPLIED', index: true },
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

applicationSchema.index({ studentId: 1, status: 1 });
applicationSchema.index({ driveId: 1, status: 1 });
applicationSchema.index({ studentId: 1, driveId: 1 }, { unique: true });
applicationSchema.index({ createdAt: -1 });
applicationSchema.index({ deletedAt: 1 });

const interviewSchema = new Schema<InterviewSchemaType>(
  {
    interviewId: { type: String, required: true, unique: true, index: true },
    applicationId: { type: String, required: true, index: true },
    roundName: { type: String, required: true, trim: true, maxlength: 100, index: true },
    roundNumber: { type: Number, required: true, min: 1, max: 10, index: true },
    scheduledAt: { type: Date, required: true, index: true },
    completedAt: { type: Date, index: true },
    result: { type: String, enum: ['PASSED', 'FAILED', 'PENDING'], index: true },
    feedback: { type: String, trim: true, maxlength: 1000 },
    interviewerName: { type: String, trim: true, maxlength: 100 },
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

interviewSchema.index({ applicationId: 1, roundNumber: 1 });
interviewSchema.index({ result: 1, scheduledAt: 1 });
interviewSchema.index({ createdAt: -1 });
interviewSchema.index({ deletedAt: 1 });

const offerSchema = new Schema<OfferSchemaType>(
  {
    offerId: { type: String, required: true, unique: true, index: true },
    applicationId: { type: String, required: true, unique: true, index: true },
    offerLetterUrl: { type: String, trim: true, maxlength: 500 },
    packageAmount: { type: Number, min: 0, index: true },
    joiningDate: { type: Date, index: true },
    location: { type: String, trim: true, maxlength: 200 },
    status: { type: String, required: true, enum: ['OFFERED', 'ACCEPTED', 'REJECTED', 'EXPIRED'], default: 'OFFERED', index: true },
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

offerSchema.index({ status: 1, createdAt: -1 });
offerSchema.index({ packageAmount: 1 });
offerSchema.index({ createdAt: -1 });
offerSchema.index({ deletedAt: 1 });

const placementSchema = new Schema<PlacementSchemaType>(
  {
    placementId: { type: String, required: true, unique: true, index: true },
    studentId: { type: String, required: true, index: true },
    applicationId: { type: String, required: true, unique: true, index: true },
    companyId: { type: String, required: true, index: true },
    driveId: { type: String, required: true, index: true },
    offerId: { type: String, required: true, unique: true, index: true },
    packageAmount: { type: Number, required: true, min: 0 },
    joiningDate: { type: Date, required: true, index: true },
    location: { type: String, required: true, trim: true, maxlength: 200 },
    status: { type: String, required: true, enum: ['PLACED', 'NOT_PLACED', 'IN_PROGRESS'], default: 'PLACED', index: true },
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

placementSchema.index({ studentId: 1, status: 1 });
placementSchema.index({ companyId: 1, status: 1 });
placementSchema.index({ createdAt: -1 });
placementSchema.index({ deletedAt: 1 });

const placementStatisticsSchema = new Schema<PlacementStatisticsSchemaType>(
  {
    totalStudents: { type: Number, required: true, min: 0, default: 0 },
    placedStudents: { type: Number, required: true, min: 0, default: 0 },
    placementPercentage: { type: Number, required: true, min: 0, max: 100, default: 0 },
    totalDrives: { type: Number, required: true, min: 0, default: 0 },
    activeDrives: { type: Number, required: true, min: 0, default: 0 },
    totalCompanies: { type: Number, required: true, min: 0, default: 0 },
    totalApplications: { type: Number, required: true, min: 0, default: 0 },
    totalOffers: { type: Number, required: true, min: 0, default: 0 },
    acceptedOffers: { type: Number, required: true, min: 0, default: 0 },
    rejectedOffers: { type: Number, required: true, min: 0, default: 0 },
    companyWiseStats: [
      {
        companyId: { type: String, required: true },
        companyName: { type: String, required: true },
        totalOffers: { type: Number, required: true, min: 0, default: 0 },
        acceptedOffers: { type: Number, required: true, min: 0, default: 0 },
        avgPackage: { type: Number, required: true, min: 0, default: 0 },
      },
    ],
    calculatedAt: { type: Date, required: true, default: Date.now },
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

placementStatisticsSchema.index({ calculatedAt: -1 });
placementStatisticsSchema.index({ deletedAt: 1 });

export const CompanyModel: Model<CompanySchemaType> = model<CompanySchemaType>('Company', companySchema);
export const DriveModel: Model<DriveSchemaType> = model<DriveSchemaType>('Drive', driveSchema);
export const ApplicationModel: Model<ApplicationSchemaType> = model<ApplicationSchemaType>('Application', applicationSchema);
export const InterviewModel: Model<InterviewSchemaType> = model<InterviewSchemaType>('Interview', interviewSchema);
export const OfferModel: Model<OfferSchemaType> = model<OfferSchemaType>('Offer', offerSchema);
export const PlacementModel: Model<PlacementSchemaType> = model<PlacementSchemaType>('Placement', placementSchema);
export const PlacementStatisticsModel: Model<PlacementStatisticsSchemaType> = model<PlacementStatisticsSchemaType>('PlacementStatistics', placementStatisticsSchema);
