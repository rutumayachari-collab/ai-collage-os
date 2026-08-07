export interface AdminStats {
  totalInquiries: number;
  totalApplicants: number;
  totalStudents: number;
  totalFaculty: number;
  pendingVerifications: number;
  pendingEligibility: number;
  admissionsApproved: number;
  revenue: number;
  seatOccupancy: number;
}

export interface AdmissionFunnel {
  inquiries: number;
  applicants: number;
  verified: number;
  eligible: number;
  admitted: number;
  students: number;
}

export interface DepartmentStat {
  id: string;
  name: string;
  applicants: number;
  admitted: number;
  occupancy: number;
}

export interface FacultyStat {
  id: string;
  name: string;
  department: string;
  applicantsReviewed: number;
  averageProcessingTime: string;
}

export interface RevenueData {
  month: string;
  amount: number;
}

export interface ScholarshipData {
  name: string;
  count: number;
  amount: number;
}

export interface TimelineData {
  date: string;
  applicants: number;
  admissions: number;
}

export interface ProcessingTimeData {
  stage: string;
  averageTime: string;
}

export interface AIAccuracyData {
  month: string;
  accuracy: number;
}

export interface ReportConfig {
  type: "daily" | "weekly" | "monthly";
  category: "department" | "faculty" | "admission";
  startDate?: string;
  endDate?: string;
}

export interface SettingsData {
  academicYear: string;
  admissionRound: string;
  departments: string[];
  courses: string[];
  scholarships: string[];
  aiConfiguration: {
    enabled: boolean;
    threshold: number;
  };
  notifications: {
    email: boolean;
    sms: boolean;
    whatsapp: boolean;
  };
}
