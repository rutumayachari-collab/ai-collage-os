export type AttendanceStatus = "PRESENT" | "ABSENT" | "LATE" | "EXCUSED";
export type AttendanceType = "THEORY" | "LAB" | "PROJECT" | "SEMINAR" | "ELECTIVE" | "MANDATORY";

export interface AttendanceRecord {
  id: string;
  studentId: string;
  studentName?: string;
  subjectId: string;
  subjectName?: string;
  facultyId: string;
  facultyName?: string;
  date: string;
  periodNumber?: number;
  status: AttendanceStatus;
  type?: AttendanceType;
  remarks?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AttendanceSummary {
  studentId: string;
  totalClasses: number;
  presentCount: number;
  absentCount: number;
  lateCount: number;
  attendancePercentage: number;
  subjectWise: Array<{
    subjectId: string;
    subjectName?: string;
    totalClasses: number;
    presentCount: number;
    absentCount: number;
    attendancePercentage: number;
  }>;
}

export interface AttendanceStatistics {
  overall: {
    totalRecords: number;
    presentCount: number;
    absentCount: number;
    lateCount: number;
    overallPercentage: number;
  };
  bySubject: Array<{
    subjectId: string;
    subjectName?: string;
    totalRecords: number;
    presentCount: number;
    attendancePercentage: number;
  }>;
  byStudent: Array<{
    studentId: string;
    studentName?: string;
    totalRecords: number;
    presentCount: number;
    attendancePercentage: number;
  }>;
}
