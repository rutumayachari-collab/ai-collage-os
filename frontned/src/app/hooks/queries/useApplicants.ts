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

export function useApplicantByApplicationNumber(applicationNumber: string) {
  return useQuery({
    queryKey: ["applicants", "applicationNumber", applicationNumber],
    queryFn: () => applicantService.getByApplicationNumber(applicationNumber),
    enabled: !!applicationNumber,
  });
}

export function useMeProfile() {
  return useQuery({
    queryKey: ["applicants", "me"],
    queryFn: () => applicantService.getMeProfile(),
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

export function useApplicantWorkflow(id: string) {
  return useQuery({
    queryKey: ["applicants", id, "workflow"],
    queryFn: () => applicantService.getWorkflow(id),
    enabled: !!id,
  });
}

export function useApplicantDocuments(id: string) {
  return useQuery({
    queryKey: ["applicants", id, "documents"],
    queryFn: () => applicantService.getDocuments(id),
    enabled: !!id,
  });
}

export function useApplicantInterview(id: string) {
  return useQuery({
    queryKey: ["applicants", id, "interview"],
    queryFn: () => applicantService.getInterview(id),
    enabled: !!id,
  });
}

export function useApplicantOfferLetter(id: string) {
  return useQuery({
    queryKey: ["applicants", id, "offer-letter"],
    queryFn: () => applicantService.getOfferLetter(id),
    enabled: !!id,
  });
}

export function useApplicantFeeSummary(id: string) {
  return useQuery({
    queryKey: ["applicants", id, "fee-summary"],
    queryFn: () => applicantService.getFeeSummary(id),
    enabled: !!id,
  });
}

export function useApplicantTimeline(id: string) {
  return useQuery({
    queryKey: ["applicants", id, "timeline"],
    queryFn: () => applicantService.getTimeline(id),
    enabled: !!id,
  });
}
