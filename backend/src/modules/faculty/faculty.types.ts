export type FacultyStatus = 'ACTIVE' | 'INACTIVE' | 'ARCHIVED';
export type FacultyEmploymentStatus = 'ACTIVE' | 'INACTIVE' | 'ON_LEAVE' | 'RETIRED' | 'TERMINATED';
export type FacultyEmployeeType = 'PERMANENT' | 'CONTRACT' | 'VISITING' | 'ADJUNCT';
export type FacultyDesignation = 'PROFESSOR' | 'ASSOCIATE_PROFESSOR' | 'ASSISTANT_PROFESSOR' | 'LECTURER' | 'VISITING_FACULTY' | 'HOD' | 'DEAN' | 'PRINCIPAL';
export type FacultyAcademicRank = 'PROFESSOR' | 'ASSOCIATE_PROFESSOR' | 'ASSISTANT_PROFESSOR' | 'LECTURER' | 'SENIOR_LECTURER';
export type FacultyGender = 'MALE' | 'FEMALE' | 'OTHER' | 'PREFER_NOT_TO_SAY';
export type FacultyTitle = 'MR' | 'MRS' | 'MS' | 'DR' | 'PROF';
export type FacultyBloodGroup = 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-';
export type FacultyCategory = 'GENERAL' | 'OBC' | 'SC' | 'ST' | 'EWS' | 'OTHER';
export type FacultyCommitteeRole = 'CHAIR' | 'MEMBER' | 'SECRETARY' | 'COORDINATOR';
export type FacultyCommitteeStatus = 'ACTIVE' | 'COMPLETED' | 'CANCELLED';
export type FacultyPublicationType = 'JOURNAL' | 'CONFERENCE' | 'BOOK' | 'BOOK_CHAPTER' | 'PATENT';
export type FacultyDocumentType = 'RESUME' | 'PHOTO' | 'SIGNATURE' | 'AADHAR' | 'PAN' | 'QUALIFICATION' | 'EXPERIENCE_CERTIFICATE' | 'RESEARCH_PAPER' | 'OTHER';
export type FacultyAddressType = 'HOSTEL' | 'PG' | 'RENTED' | 'FAMILY';
export type FacultyLeaveType = 'CASUAL' | 'SICK' | 'EARNED' | 'MATERNITY' | 'PATERNITY' | 'RESEARCH';
export type FacultyLeaveStatus = 'PENDING' | 'APPROVED' | 'REJECTED';
export type FacultyEmploymentTypeHistory = 'FULL_TIME' | 'PART_TIME' | 'CONTRACT' | 'VISITING';
export type FacultyResearchProjectStatus = 'PROPOSED' | 'ONGOING' | 'COMPLETED' | 'CANCELLED';
export type FacultyResearchProjectRole = 'PRINCIPAL_INVESTIGATOR' | 'CO_INVESTIGATOR' | 'TEAM_MEMBER';
export type FacultyUnavailabilityType = 'LEAVE' | 'CONFERENCE' | 'RESEARCH' | 'OTHER';
export type FacultyAIPerformance = 'EXCELLENT' | 'GOOD' | 'AVERAGE' | 'BELOW_AVERAGE';

export interface FacultyAddress {
  street: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;
}

export interface FacultyCurrentAddress extends FacultyAddress {
  type?: FacultyAddressType;
}

export interface FacultyEmergencyContact {
  name: string;
  relation: string;
  phone: string;
  email?: string;
}

export interface FacultyQualification {
  degree: string;
  field: string;
  institution: string;
  year: number;
  percentage?: number;
  grade?: string;
}

export interface FacultyCertification {
  name: string;
  issuingAuthority: string;
  issueDate: Date;
  expiryDate?: Date;
  credentialId?: string;
}

export interface FacultyExperience {
  totalYears: number;
  industryYears: number;
  teachingYears: number;
  currentDesignation: string;
  previousDesignations?: Array<{
    designation: string;
    organization: string;
    from: Date;
    to?: Date;
  }>;
}

export interface FacultyEmploymentHistoryItem {
  organization: string;
  designation: string;
  department?: string;
  from: Date;
  to?: Date;
  employmentType: FacultyEmploymentTypeHistory;
  responsibilities?: string;
  reasonForLeaving?: string;
  createdAt: Date;
}

export interface FacultyResearchProject {
  title: string;
  description: string;
  fundingAgency?: string;
  amount?: number;
  startDate: Date;
  endDate?: Date;
  status: FacultyResearchProjectStatus;
  role: FacultyResearchProjectRole;
  teamMembers?: string[];
  publications?: string[];
  patents?: string[];
  createdAt: Date;
}

export interface FacultyPublication {
  type: FacultyPublicationType;
  title: string;
  authors: string[];
  publicationName: string;
  year: number;
  doi?: string;
  isbn?: string;
  url?: string;
}

export interface FacultyLanguage {
  language: string;
  proficiency: 'NATIVE' | 'FLUENT' | 'INTERMEDIATE' | 'BASIC';
}

export interface FacultyOfficeHour {
  day: 'MONDAY' | 'TUESDAY' | 'WEDNESDAY' | 'THURSDAY' | 'FRIDAY' | 'SATURDAY';
  startTime: string;
  endTime: string;
  isActive: boolean;
  room?: string;
}

export interface FacultyTeachingLoad {
  totalCreditHours: number;
  theoryHours: number;
  practicalHours: number;
  tutorialHours: number;
  coursesAssigned: number;
  subjectsAssigned: number;
  timetableSlotsAssigned: number;
  maxLoad: number;
  currentSemester: string;
  academicYear: string;
  overload: boolean;
  lastUpdated: Date;
}

export interface FacultyLeaveBalance {
  totalLeaves: number;
  usedLeaves: number;
  remainingLeaves: number;
  carryForwardLeaves: number;
  casualLeaves: {
    total: number;
    used: number;
    remaining: number;
  };
  sickLeaves: {
    total: number;
    used: number;
    remaining: number;
  };
  earnedLeaves: {
    total: number;
    used: number;
    remaining: number;
  };
  researchLeaves: {
    total: number;
    used: number;
    remaining: number;
  };
  currentLeave?: {
    type: FacultyLeaveType;
    from: Date;
    to: Date;
    reason: string;
    approvedBy: string;
    status: FacultyLeaveStatus;
  };
  lastUpdated: Date;
}

export interface FacultyAiTeachingProfile {
  predictedPerformance: FacultyAIPerformance | null;
  predictedRetentionRisk: number | null;
  recommendedTraining: string[];
  workloadScore: number | null;
  researchPotential: number | null;
  studentSatisfactionPrediction: number | null;
  courseFitScores: Array<{
    courseId: string;
    score: number;
    reasoning?: string;
  }>;
  lastPredictionDate: Date | null;
  aiGeneratedInsights: string | null;
  confidenceScore: number | null;
  modelVersion: string | null;
}

export interface FacultyUnavailabilityPeriod {
  from: Date;
  to: Date;
  reason: string;
  type: FacultyUnavailabilityType;
}

export interface FacultyPreferredTimeSlot {
  day: string;
  startTime: string;
  endTime: string;
}

export interface FacultyAvailability {
  isAvailable: boolean;
  unavailablePeriods: FacultyUnavailabilityPeriod[];
  preferredSubjects: string[];
  preferredTimeSlots: FacultyPreferredTimeSlot[];
  maxWeeklyHours: number;
  currentWeeklyHours: number;
  lastUpdated: Date;
}

export interface FacultyDocumentRecord {
  name: string;
  type: FacultyDocumentType;
  url: string;
  fileSize: number;
  uploadedAt: Date;
  uploadedBy: string;
  verified: boolean;
  verifiedAt?: Date;
  verifiedBy?: string;
}

export interface FacultyCommitteeAssignment {
  committeeId: string;
  committeeName: string;
  role: FacultyCommitteeRole;
  startDate: Date;
  endDate?: Date;
  status: FacultyCommitteeStatus;
  remarks?: string;
}

export interface FacultyPerformanceMetrics {
  averageRating: number;
  totalFeedbacks: number;
  lastFeedbackDate?: Date;
  studentSatisfaction?: number;
  researchScore?: number;
  overallScore?: number;
}

export interface FacultySalaryMetadata {
  basicPay?: number;
  gradePay?: number;
  allowances?: Record<string, number>;
  bankAccount?: string;
  bankIfsc?: string;
}

export interface FacultySchemaType {
  facultyId: string;
  employeeId: string;
  userId?: string;
  title: string;
  firstName: string;
  lastName: string;
  displayName: string;
  dateOfBirth: Date;
  gender: string;
  bloodGroup?: string;
  nationality: string;
  religion?: string;
  category?: string;
  aadharNumber?: string;
  panNumber?: string;
  photo?: string;
  signature?: string;
  email: string;
  phone: string;
  officialEmail: string;
  officialPhone?: string;
  alternatePhone?: string;
  address: FacultyAddress;
  currentAddress?: FacultyCurrentAddress;
  emergencyContact: FacultyEmergencyContact;
  joiningDate: Date;
  employeeType: string;
  designation: string;
  academicRank: string;
  departmentId: string;
  supportingDepartmentIds: string[];
  isHOD?: boolean;
  hodDepartmentId?: string;
  employmentStatus: string;
  isActive: boolean;
  qualifications: FacultyQualification[];
  specializations: string[];
  certifications: FacultyCertification[];
  experience: FacultyExperience;
  employmentHistory: FacultyEmploymentHistoryItem[];
  researchInterests: string[];
  researchProjects: FacultyResearchProject[];
  publications: FacultyPublication[];
  skills: string[];
  languages: FacultyLanguage[];
  officeLocation?: string;
  officeHours: FacultyOfficeHour[];
  courses: string[];
  subjects: string[];
  timetableSlots: string[];
  teachingLoad: FacultyTeachingLoad;
  performanceMetrics: FacultyPerformanceMetrics;
  leaveBalance: FacultyLeaveBalance;
  salaryMetadata?: FacultySalaryMetadata;
  aiTeachingProfile?: FacultyAiTeachingProfile;
  availability: FacultyAvailability;
  documents: FacultyDocumentRecord[];
  committeeAssignments: FacultyCommitteeAssignment[];
  status: string;
  tags?: string[];
  remarks?: string;
  createdBy: string;
  updatedBy: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
  deletedBy?: string;
}
