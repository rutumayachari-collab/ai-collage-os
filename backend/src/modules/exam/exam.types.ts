export type ExamStatus = 'SCHEDULED' | 'ONGOING' | 'COMPLETED' | 'CANCELLED' | 'RESULTS_PUBLISHED';
export type ExamType = 'THEORY' | 'LAB' | 'PRACTICAL' | 'PROJECT' | 'SEMINAR' | 'VIVA';
export type ExamRegistrationStatus = 'REGISTERED' | 'ATTENDED' | 'ABSENT' | 'WITHDRAWN';

export interface ExamSchedule {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  room: string;
  invigilatorId: string;
}

export interface ExamRegistration {
  id: string;
  studentId: string;
  status: ExamRegistrationStatus;
  registeredAt: Date;
}

export interface ExamResult {
  id: string;
  studentId: string;
  marksObtained: number;
  grade: string;
  isPassed: boolean;
  remarks: string;
  publishedAt: Date;
}

export interface ExamSchemaType {
  examId: string;
  code: string;
  name: string;
  courseId: string;
  subjectId: string;
  semester: number;
  academicYear: string;
  examType: ExamType;
  maxMarks: number;
  passingMarks: number;
  durationMinutes: number;
  status: ExamStatus;
  schedule: ExamSchedule[];
  registrations: ExamRegistration[];
  results: ExamResult[];
  createdBy: string;
  updatedBy: string;
  deletedBy?: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
  isActive: boolean;
}
