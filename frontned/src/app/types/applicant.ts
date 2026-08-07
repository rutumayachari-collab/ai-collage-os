export type ApplicantStatus =
  "DRAFT" | "SUBMITTED" | "UNDER_REVIEW" | "SHORTLISTED" | "ADMITTED" | "REJECTED" | "WAITLISTED";

export interface Applicant {
  id: string;
  inquiryId?: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  gender: string;
  address: string;
  city: string;
  state: string;
  country: string;
  pincode: string;
  courseId: string;
  courseName: string;
  status: ApplicantStatus;
  eligibilityScore?: number;
  documentsVerified: boolean;
  admissionStatus?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateApplicantDto {
  inquiryId?: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  gender: string;
  address: string;
  city: string;
  state: string;
  country: string;
  pincode: string;
  courseId: string;
}

export interface UpdateApplicantDto extends Partial<CreateApplicantDto> {
  status?: ApplicantStatus;
}
