export type EligibilityStatus = "PENDING" | "ELIGIBLE" | "NOT_ELIGIBLE" | "CONDITIONAL";

export interface Eligibility {
  id: string;
  applicantId: string;
  applicantName?: string;
  courseId?: string;
  courseName?: string;
  status: EligibilityStatus;
  score?: number;
  criteria?: Record<string, boolean>;
  reasons?: string[];
  failedCriteria?: string[];
  remarks?: string;
  reviewedBy?: string;
  reviewedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateEligibilityDto {
  applicantId: string;
  courseId?: string;
  score?: number;
  criteria?: Record<string, boolean>;
  reasons?: string[];
  failedCriteria?: string[];
  remarks?: string;
  reviewedBy?: string;
  reviewedAt?: string;
  status?: EligibilityStatus;
}

export interface UpdateEligibilityDto extends Partial<CreateEligibilityDto> {
  status?: EligibilityStatus;
}
