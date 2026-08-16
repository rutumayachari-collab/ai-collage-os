import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { eligibilityService } from "@/app/services/eligibility.service";
import type {
  Eligibility,
  CreateEligibilityDto,
  UpdateEligibilityDto,
} from "@/app/types/eligibility";

export function useEligibility(params?: Record<string, string | number | boolean | undefined>) {
  return useQuery({
    queryKey: ["eligibility", params],
    queryFn: () => eligibilityService.getAll(params),
  });
}

export function useEligibilityById(id: string) {
  return useQuery({
    queryKey: ["eligibility", id],
    queryFn: () => eligibilityService.getById(id),
    enabled: !!id,
  });
}

export function useEligibilityByApplicant(applicantId: string) {
  return useQuery({
    queryKey: ["eligibility", "applicant", applicantId],
    queryFn: () => eligibilityService.getByApplicant(applicantId),
    enabled: !!applicantId,
  });
}

export function useCreateEligibility() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateEligibilityDto) => eligibilityService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["eligibility"] });
    },
  });
}

export function useUpdateEligibility() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateEligibilityDto }) =>
      eligibilityService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["eligibility"] });
    },
  });
}

export function useRunEligibilityCheck() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => eligibilityService.runCheck(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["eligibility"] });
    },
  });
}
