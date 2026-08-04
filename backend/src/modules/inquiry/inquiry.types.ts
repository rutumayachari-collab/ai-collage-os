export type InquiryStatus = 'NEW' | 'CONTACTED' | 'INTERESTED' | 'APPLIED' | 'ENROLLED' | 'REJECTED' | 'ARCHIVED';
export type InquirySource = 'WEBSITE' | 'SOCIAL_MEDIA' | 'REFERRAL' | 'WALK_IN' | 'CALL' | 'EMAIL' | 'WHATSAPP' | 'EDUCATION_FAIR' | 'OTHER';
export type InquiryPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
export type QualificationType = 'HIGH_SCHOOL' | 'INTERMEDIATE' | 'DIPLOMA' | 'BACHELORS' | 'MASTERS' | 'PHD' | 'OTHER';
export type Gender = 'MALE' | 'FEMALE' | 'OTHER' | 'PREFER_NOT_TO_SAY';
export type PreferredCommunication = 'EMAIL' | 'PHONE' | 'SMS' | 'WHATSAPP';
export type AIIntent = 'HIGH_INTENT' | 'MEDIUM_INTENT' | 'LOW_INTENT' | 'UNCERTAIN';
export type AISentiment = 'POSITIVE' | 'NEUTRAL' | 'NEGATIVE';
export type AIRiskLevel = 'LOW' | 'MEDIUM' | 'HIGH';
export type CounselingMode = 'ONLINE' | 'IN_PERSON' | 'PHONE' | 'VIDEO_CALL';
export type CounselingOutcome = 'INTERESTED' | 'NOT_INTERESTED' | 'PENDING' | 'APPLIED' | 'ENROLLED';
export type TimelineEventType = 'CREATED' | 'CONTACTED' | 'COUNSELING_SCHEDULED' | 'COUNSELING_COMPLETED' | 'FOLLOW_UP' | 'APPLIED' | 'ENROLLED' | 'ARCHIVED' | 'NOTE_ADDED' | 'STATUS_CHANGED';
export type PerformedByRole = 'SYSTEM' | 'AI' | 'COUNSELOR' | 'ADMIN' | 'STUDENT';

export interface TimelineEvent {
  eventId: string;
  eventType: TimelineEventType;
  description: string;
  performedBy: string;
  performedByRole: PerformedByRole;
  createdAt: Date;
}

export interface LeadScoreHistory {
  score: number;
  reason: string;
  generatedAt: Date;
  generatedBy: string;
}

export interface Conversion {
  isConverted: boolean;
  applicantId?: string;
  convertedAt?: Date;
}

export interface InquirySchemaType {
  inquiryId: string;
  inquiryNumber: string;
  fullName: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dateOfBirth?: Date;
  gender?: Gender;
  preferredCommunication?: PreferredCommunication;
  country?: string;
  state?: string;
  city?: string;
  address?: string;
  qualification?: QualificationType;
  boardOrUniversity?: string;
  passingYear?: number;
  percentage?: number;
  cgpa?: number;
  category?: string;
  specialization?: string;
  preferredCourseId?: string;
  aiRecommendedCourseIds: string[];
  alternativeCourseIds: string[];
  preferredDepartmentId?: string;
  preferredCampus?: string;
  preferredAdmissionYear?: string;
  budgetRange?: string;
  hostelRequired?: boolean;
  transportRequired?: boolean;
  source: InquirySource;
  campaign?: string;
  medium?: string;
  referralSource?: string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  campaignId?: string;
  inquiryDate: Date;
  status: InquiryStatus;
  priority: InquiryPriority;
  aiSummary?: string;
  aiLeadScore?: number;
  aiLeadScoreHistory: LeadScoreHistory[];
  aiConfidenceScore?: number;
  aiRecommendedDepartmentId?: string;
  aiIntent?: AIIntent;
  aiSentiment?: AISentiment;
  aiRiskLevel?: AIRiskLevel;
  aiNextBestAction?: string;
  aiConversationSummary?: string;
  assignedCounselorId?: string;
  assignedAt?: Date;
  counselorNotes?: string;
  counselingMode?: CounselingMode;
  counselingOutcome?: CounselingOutcome;
  nextFollowUpDate?: Date;
  lastContactDate?: Date;
  followUpCount: number;
  lastFollowUpResult?: string;
  timeline: TimelineEvent[];
  tags: string[];
  conversion: Conversion;
  isActive: boolean;
  archivedAt?: Date;
  archivedBy?: string;
  createdBy: string;
  updatedBy: string;
  deletedBy?: string;
  deletedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}
