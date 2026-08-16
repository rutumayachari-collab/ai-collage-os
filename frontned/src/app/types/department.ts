export interface Department {
  id: string;
  name: string;
  code: string;
  headId?: string;
  headName?: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateDepartmentDto {
  name: string;
  code: string;
  headId?: string;
  description?: string;
}

export type UpdateDepartmentDto = Partial<CreateDepartmentDto>;
