export type DriveStatus =
  "SCHEDULED" | "REGISTRATION_OPEN" | "REGISTRATION_CLOSED" | "COMPLETED" | "CANCELLED";
export type ApplicationStatus =
  | "APPLIED"
  | "SHORTLISTED"
  | "INTERVIEW_SCHEDULED"
  | "INTERVIEWED"
  | "SELECTED"
  | "REJECTED"
  | "WITHDRAWN";
export type OfferStatus = "OFFERED" | "ACCEPTED" | "REJECTED" | "EXPIRED";

export interface Company {
  id: string;
  companyId: string;
  name: string;
  industry: string;
  website?: string;
  hrName?: string;
  hrEmail?: string;
  hrPhone?: string;
  address?: string;
  isActive: boolean;
  createdBy: string;
  updatedBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface Drive {
  id: string;
  driveId: string;
  companyId: string;
  companyName?: string;
  driveName: string;
  driveDate: string;
  registrationDeadline: string;
  eligibleCourses: string[];
  eligibleBranches: string[];
  minPercentage: number;
  maxBacklogs: number;
  packageDetails: string;
  driveType: "ON_CAMPUS" | "OFF_CAMPUS";
  status: DriveStatus;
  isActive: boolean;
  createdBy: string;
  updatedBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface Application {
  id: string;
  applicationId: string;
  studentId: string;
  studentName?: string;
  driveId: string;
  driveName?: string;
  companyName?: string;
  appliedDate: string;
  status: ApplicationStatus;
  updatedAt: string;
}

export interface Interview {
  id: string;
  interviewId: string;
  applicationId: string;
  roundName: string;
  roundNumber: number;
  scheduledAt: string;
  completedAt?: string;
  result?: string;
  feedback?: string;
  interviewerName?: string;
  createdAt: string;
}

export interface Offer {
  id: string;
  offerId: string;
  applicationId: string;
  studentId: string;
  studentName?: string;
  companyName?: string;
  offerLetterUrl?: string;
  packageAmount: number;
  joiningDate: string;
  location: string;
  status: OfferStatus;
  createdAt: string;
  updatedAt: string;
}
