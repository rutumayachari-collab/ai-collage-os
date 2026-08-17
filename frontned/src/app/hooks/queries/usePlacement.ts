import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { placementService } from "@/app/services/placement.service";
import type { Company, Drive, Application, Interview, Offer } from "@/app/types/placement";

export function useCompanies(params?: Record<string, string | number | boolean | undefined>) {
  return useQuery({
    queryKey: ["placement-companies", params],
    queryFn: () => placementService.getCompanies(params),
  });
}

export function useCreateCompany() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<Company>) => placementService.createCompany(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["placement-companies"] }),
  });
}

export function useUpdateCompany() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Company> }) =>
      placementService.updateCompany(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["placement-companies"] }),
  });
}

export function useDrives(params?: Record<string, string | number | boolean | undefined>) {
  return useQuery({
    queryKey: ["placement-drives", params],
    queryFn: () => placementService.getDrives(params),
  });
}

export function useCreateDrive() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<Drive>) => placementService.createDrive(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["placement-drives"] }),
  });
}

export function useUpdateDrive() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Drive> }) =>
      placementService.updateDrive(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["placement-drives"] }),
  });
}

export function useApplications(params?: Record<string, string | number | boolean | undefined>) {
  return useQuery({
    queryKey: ["placement-applications", params],
    queryFn: () => placementService.getApplications(params),
  });
}

export function useApplyToDrive() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { driveId: string; studentId: string }) =>
      placementService.applyToDrive(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["placement-applications"] }),
  });
}

export function usePlacementStatistics() {
  return useQuery({
    queryKey: ["placement-statistics"],
    queryFn: () => placementService.getStatistics(),
  });
}
