import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { departmentService } from "@/app/services/department.service";
import type { Department, CreateDepartmentDto, UpdateDepartmentDto } from "@/app/types/department";

export function useDepartments(params?: Record<string, string | number | boolean | undefined>) {
  return useQuery({
    queryKey: ["departments", params],
    queryFn: () => departmentService.getAll(params),
  });
}

export function useDepartment(id: string) {
  return useQuery({
    queryKey: ["departments", id],
    queryFn: () => departmentService.getById(id),
    enabled: !!id,
  });
}

export function useCreateDepartment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateDepartmentDto) => departmentService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["departments"] });
    },
  });
}

export function useUpdateDepartment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateDepartmentDto }) =>
      departmentService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["departments"] });
    },
  });
}

export function useDeleteDepartment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => departmentService.deleteById(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["departments"] });
    },
  });
}
