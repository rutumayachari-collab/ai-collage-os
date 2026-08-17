import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { examService } from "@/app/services/exam.service";
import type { Exam, CreateExamDto, UpdateExamDto } from "@/app/types/exam";

export function useExams(params?: Record<string, string | number | boolean | undefined>) {
  return useQuery({
    queryKey: ["exams", params],
    queryFn: () => examService.getAll(params),
  });
}

export function useExam(id: string) {
  return useQuery({
    queryKey: ["exams", id],
    queryFn: () => examService.getById(id),
    enabled: !!id,
  });
}

export function useCreateExam() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateExamDto) => examService.create(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["exams"] }),
  });
}

export function useUpdateExam() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateExamDto }) => examService.update(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["exams"] }),
  });
}

export function useExamRegistration() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ examId, studentId }: { examId: string; studentId: string }) =>
      examService.registerStudent(examId, studentId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["exams"] }),
  });
}

export function usePublishResult() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ examId, data }: { examId: string; data: Record<string, unknown> }) =>
      examService.publishResult(examId, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["exams"] }),
  });
}
