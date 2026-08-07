export type AdmissionStatus =
  "PENDING" | "APPROVED" | "REJECTED" | "WAITLISTED" | "CONFIRMED" | "CANCELLED";

export interface Admission {
  id: string;
  applicantId: string;
  applicantName: string;
  courseId: string;
  courseName: string;
  status: AdmissionStatus;
  stage: string;
  feeStatus: string;
  eligibilityStatus: string;
  aiRecommendation?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AdmissionStage {
  id: string;
  name: string;
  status: "completed" | "current" | "pending";
  description?: string;
  completedAt?: string;
}
