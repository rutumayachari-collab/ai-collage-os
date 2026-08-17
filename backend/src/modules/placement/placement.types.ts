export type CompanyStatus = 'ACTIVE' | 'INACTIVE';
export type DriveType = 'ON_CAMPUS' | 'OFF_CAMPUS';
export type DriveStatus = 'SCHEDULED' | 'REGISTRATION_OPEN' | 'REGISTRATION_CLOSED' | 'COMPLETED' | 'CANCELLED';
export type ApplicationStatus = 'APPLIED' | 'SHORTLISTED' | 'INTERVIEW_SCHEDULED' | 'INTERVIEWED' | 'SELECTED' | 'REJECTED' | 'WITHDRAWN';
export type InterviewResult = 'PASSED' | 'FAILED' | 'PENDING';
export type OfferStatus = 'OFFERED' | 'ACCEPTED' | 'REJECTED' | 'EXPIRED';
export type PlacementStatus = 'PLACED' | 'NOT_PLACED' | 'IN_PROGRESS';

export interface Company {
  companyId: string;
  name: string;
  industry: string;
  website?: string;
  hrName?: string;
  hrEmail?: string;
  hrPhone?: string;
  address?: string;
  isActive: boolean;
  status: CompanyStatus;
  createdBy: string;
  updatedBy: string;
  deletedBy?: string;
  deletedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface Drive {
  driveId: string;
  companyId: string;
  driveName: string;
  driveDate: Date;
  registrationDeadline: Date;
  eligibleCourses: string[];
  eligibleBranches: string[];
  minPercentage: number;
  maxBacklogs: number;
  packageDetails: string;
  driveType: DriveType;
  status: DriveStatus;
  createdBy: string;
  updatedBy: string;
  deletedBy?: string;
  deletedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface Application {
  applicationId: string;
  studentId: string;
  driveId: string;
  appliedDate: Date;
  status: ApplicationStatus;
  createdBy: string;
  updatedBy: string;
  deletedBy?: string;
  deletedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface Interview {
  interviewId: string;
  applicationId: string;
  roundName: string;
  roundNumber: number;
  scheduledAt: Date;
  completedAt?: Date;
  result?: InterviewResult;
  feedback?: string;
  interviewerName?: string;
  createdBy: string;
  updatedBy: string;
  deletedBy?: string;
  deletedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface Offer {
  offerId: string;
  applicationId: string;
  offerLetterUrl?: string;
  packageAmount?: number;
  joiningDate?: Date;
  location?: string;
  status: OfferStatus;
  createdBy: string;
  updatedBy: string;
  deletedBy?: string;
  deletedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface Placement {
  placementId: string;
  studentId: string;
  applicationId: string;
  companyId: string;
  driveId: string;
  offerId: string;
  packageAmount: number;
  joiningDate: Date;
  location: string;
  status: PlacementStatus;
  createdBy: string;
  updatedBy: string;
  deletedBy?: string;
  deletedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface CompanyStat {
  companyId: string;
  companyName: string;
  totalOffers: number;
  acceptedOffers: number;
  avgPackage: number;
}

export interface PlacementStatistics {
  totalStudents: number;
  placedStudents: number;
  placementPercentage: number;
  totalDrives: number;
  activeDrives: number;
  totalCompanies: number;
  totalApplications: number;
  totalOffers: number;
  acceptedOffers: number;
  rejectedOffers: number;
  companyWiseStats: CompanyStat[];
  calculatedAt: Date;
}

export interface CompanySchemaType {
  companyId: string;
  name: string;
  industry: string;
  website?: string;
  hrName?: string;
  hrEmail?: string;
  hrPhone?: string;
  address?: string;
  isActive: boolean;
  status: CompanyStatus;
  createdBy: string;
  updatedBy: string;
  deletedBy?: string;
  deletedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface DriveSchemaType {
  driveId: string;
  companyId: string;
  driveName: string;
  driveDate: Date;
  registrationDeadline: Date;
  eligibleCourses: string[];
  eligibleBranches: string[];
  minPercentage: number;
  maxBacklogs: number;
  packageDetails: string;
  driveType: DriveType;
  status: DriveStatus;
  createdBy: string;
  updatedBy: string;
  deletedBy?: string;
  deletedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface ApplicationSchemaType {
  applicationId: string;
  studentId: string;
  driveId: string;
  appliedDate: Date;
  status: ApplicationStatus;
  createdBy: string;
  updatedBy: string;
  deletedBy?: string;
  deletedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface InterviewSchemaType {
  interviewId: string;
  applicationId: string;
  roundName: string;
  roundNumber: number;
  scheduledAt: Date;
  completedAt?: Date;
  result?: InterviewResult;
  feedback?: string;
  interviewerName?: string;
  createdBy: string;
  updatedBy: string;
  deletedBy?: string;
  deletedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface OfferSchemaType {
  offerId: string;
  applicationId: string;
  offerLetterUrl?: string;
  packageAmount?: number;
  joiningDate?: Date;
  location?: string;
  status: OfferStatus;
  createdBy: string;
  updatedBy: string;
  deletedBy?: string;
  deletedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface PlacementSchemaType {
  placementId: string;
  studentId: string;
  applicationId: string;
  companyId: string;
  driveId: string;
  offerId: string;
  packageAmount: number;
  joiningDate: Date;
  location: string;
  status: PlacementStatus;
  createdBy: string;
  updatedBy: string;
  deletedBy?: string;
  deletedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface PlacementStatisticsSchemaType {
  totalStudents: number;
  placedStudents: number;
  placementPercentage: number;
  totalDrives: number;
  activeDrives: number;
  totalCompanies: number;
  totalApplications: number;
  totalOffers: number;
  acceptedOffers: number;
  rejectedOffers: number;
  companyWiseStats: CompanyStat[];
  calculatedAt: Date;
  createdBy: string;
  updatedBy: string;
  deletedBy?: string;
  deletedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}
