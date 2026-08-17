export type ExamStatus = "SCHEDULED" | "ONGOING" | "COMPLETED" | "CANCELLED" | "RESULTS_PUBLISHED";
export type ExamType =
  "THEORY" | "LAB" | "PROJECT" | "SEMINAR" | "ELECTIVE" | "MANDATORY" | "VALUE_ADDED";

export interface Exam {
  id: string;
  examId: string;
  code: string;
  name: string;
  description?: string;
  courseId: string;
  courseName?: string;
  subjectId: string;
  subjectName?: string;
  semester: number;
  academicYear: string;
  examType: ExamType;
  maxMarks: number;
  passingMarks: number;
  durationMinutes: number;
  status: ExamStatus;
  scheduledAt?: string;
  isActive: boolean;
  createdBy: string;
  updatedBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateExamDto {
  examId: string;
  code: string;
  name: string;
  description?: string;
  courseId: string;
  subjectId: string;
  semester: number;
  academicYear: string;
  examType: ExamType;
  maxMarks: number;
  passingMarks: number;
  durationMinutes: number;
  scheduledAt?: string;
}

export interface UpdateExamDto extends Partial<CreateExamDto> {
  status?: ExamStatus;
}
