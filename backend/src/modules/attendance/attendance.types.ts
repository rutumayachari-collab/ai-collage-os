export type AttendanceStatus = 'PRESENT' | 'ABSENT' | 'LATE' | 'EXCUSED';
export type AttendanceSummaryPeriod = 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'SEMESTER';
export type AttendanceTrend = 'INCREASING' | 'STABLE' | 'DECREASING';

export interface AttendanceRecord {
  studentId: string;
  subjectId: string;
  facultyId: string;
  date: Date;
  status: AttendanceStatus;
  remarks?: string;
  sessionType?: string;
  periodNumber?: number;
  topicCovered?: string;
  isCompensated?: boolean;
  compensationDate?: Date;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  updatedBy: string;
  deletedBy?: string;
  deletedAt?: Date;
  isActive: boolean;
}

export interface StudentAttendanceSummary {
  studentId: string;
  subjectId: string;
  totalClasses: number;
  presentCount: number;
  absentCount: number;
  lateCount: number;
  excusedCount: number;
  attendancePercentage: number;
  lastUpdatedAt: Date;
}

export interface MonthlyAttendanceSummary {
  studentId: string;
  subjectId: string;
  month: number;
  year: number;
  totalClasses: number;
  presentCount: number;
  absentCount: number;
  lateCount: number;
  excusedCount: number;
  attendancePercentage: number;
}

export interface AttendanceStatistics {
  totalRecords: number;
  presentCount: number;
  absentCount: number;
  lateCount: number;
  excusedCount: number;
  overallPercentage: number;
  subjectWise: Record<string, {
    subjectId: string;
    subjectName?: string;
    totalClasses: number;
    presentCount: number;
    absentCount: number;
    lateCount: number;
    excusedCount: number;
    percentage: number;
  }>;
  studentWise?: Record<string, {
    studentId: string;
    studentName?: string;
    totalClasses: number;
    presentCount: number;
    absentCount: number;
    lateCount: number;
    excusedCount: number;
    percentage: number;
  }>;
}

export interface AttendanceSchemaType {
  studentId: string;
  subjectId: string;
  facultyId: string;
  date: Date;
  status: AttendanceStatus;
  remarks?: string;
  sessionType?: string;
  periodNumber?: number;
  topicCovered?: string;
  isCompensated?: boolean;
  compensationDate?: Date;
  createdBy: string;
  updatedBy: string;
  deletedBy?: string;
  deletedAt?: Date;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface AttendanceDocument extends AttendanceSchemaType {
  _id: string;
  id: string;
}
