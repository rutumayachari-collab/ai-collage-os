import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { admissionService } from "@/app/services/admission.service";
import type { Admission, AdmissionStage } from "@/app/types/admission";

export function useAdmissions(params?: Record<string, string | number | boolean | undefined>) {
  return useQuery({
    queryKey: ["admissions", params],
    queryFn: () => admissionService.getAll(params),
  });
}

export function useAdmission(id: string) {
  return useQuery({
    queryKey: ["admissions", id],
    queryFn: () => admissionService.getById(id),
    enabled: !!id,
  });
}

export function useAdmissionByApplicant(applicantId: string) {
  return useQuery({
    queryKey: ["admissions", "applicant", applicantId],
    queryFn: () => admissionService.getByApplicant(applicantId),
    enabled: !!applicantId,
  });
}

export function useAdmissionStages(id: string) {
  return useQuery({
    queryKey: ["admissions", id, "stages"],
    queryFn: () => admissionService.getStages(id),
    enabled: !!id,
  });
}

export function useUpdateAdmissionStage() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, stage }: { id: string; stage: string }) =>
      admissionService.updateStage(id, stage),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admissions"] });
    },
  });
}
