export interface Student {
  id: string;
  studentId: string;
  userId: string;
  firstName: string;
  lastName: string;
  email: string;
  departmentId: string;
  department?: {
    id: string;
    name: string;
    code: string;
  };
  semester: number;
  cgpa?: number;
  attendancePercentage?: number;
  feeStatus?: string;
  phone?: string;
  address?: string;
  status?: string;
  createdAt: string;
  updatedAt: string;
}

export interface StudentQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  departmentId?: string;
  semester?: number;
}
