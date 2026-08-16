export interface Course {
  id: string;
  name: string;
  code: string;
  departmentId: string;
  department?: {
    id: string;
    name: string;
    code: string;
  };
  duration: string;
  seats: number;
  fees: number;
  description?: string;
  status: "ACTIVE" | "INACTIVE";
  createdAt: string;
  updatedAt: string;
}

export interface CreateCourseDto {
  name: string;
  code: string;
  departmentId: string;
  duration: string;
  seats: number;
  fees: number;
  description?: string;
  status?: "ACTIVE" | "INACTIVE";
}

export type UpdateCourseDto = Partial<CreateCourseDto>;
