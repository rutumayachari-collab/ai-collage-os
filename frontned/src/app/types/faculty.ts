export type ReviewStatus = "PENDING" | "UNDER_REVIEW" | "APPROVED" | "REJECTED" | "WAITLISTED";

export interface ReviewItem {
  id: string;
  applicantId: string;
  applicantName: string;
  course: string;
  status: ReviewStatus;
  submittedAt: string;
  priority?: "HIGH" | "MEDIUM" | "LOW";
  score?: number;
}

export interface FacultyStats {
  totalApplicants: number;
  pendingReview: number;
  pendingVerification: number;
  pendingEligibility: number;
  admissionsApproved: number;
  averageProcessingTime: string;
  todayApplicants: number;
}

export interface AICopilotInsight {
  applicantId: string;
  applicantName: string;
  admissionProbability: number;
  riskScore: number;
  missingDocuments: string[];
  scholarshipRecommendation?: string;
  recommendedCourse?: string;
  recommendedNextAction: string;
  summary: string;
}

export interface NotificationItem {
  id: string;
  title: string;
  description: string;
  type: "approval" | "document" | "deadline" | "info";
  read: boolean;
  createdAt: string;
}
