import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { applicantService } from "@/app/services/applicant.service";
import type { Applicant, CreateApplicantDto, UpdateApplicantDto } from "@/app/types/applicant";

export function useApplicants(params?: Record<string, string | number | boolean | undefined>) {
  return useQuery({
    queryKey: ["applicants", params],
    queryFn: () => applicantService.getAll(params),
  });
}

export function useApplicant(id: string) {
  return useQuery({
    queryKey: ["applicants", id],
    queryFn: () => applicantService.getById(id),
    enabled: !!id,
  });
}

export function useCreateApplicant() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateApplicantDto) => applicantService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["applicants"] });
    },
  });
}

export function useUpdateApplicant() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateApplicantDto }) =>
      applicantService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["applicants"] });
    },
  });
}
