import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { studentService } from "@/app/services/student.service";
import type { Student, StudentQueryParams } from "@/app/types/student";

export function useStudent(id: string) {
  return useQuery({
    queryKey: ["students", id],
    queryFn: () => studentService.getById(id),
    enabled: !!id,
  });
}

export function useMyStudentProfile() {
  return useQuery({
    queryKey: ["students", "me"],
    queryFn: () => studentService.getMyProfile(),
  });
}

export function useUpdateMyStudentProfile() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<Student>) => studentService.updateMyProfile(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["students"] });
    },
  });
}

export function useStudents(params?: StudentQueryParams) {
  return useQuery({
    queryKey: ["students", params],
    queryFn: () => studentService.getMany(params),
  });
}
