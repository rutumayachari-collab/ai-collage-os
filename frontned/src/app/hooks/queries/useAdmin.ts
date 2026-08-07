import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { adminService } from "@/app/services/admin.service";
import type { ReportConfig, SettingsData } from "@/app/types/admin";

export function useAdminStats() {
  return useQuery({
    queryKey: ["admin", "stats"],
    queryFn: () => adminService.getStats(),
    refetchInterval: 30000,
  });
}

export function useAdmissionFunnel() {
  return useQuery({
    queryKey: ["admin", "funnel"],
    queryFn: () => adminService.getAdmissionFunnel(),
    refetchInterval: 60000,
  });
}

export function useDepartmentStats() {
  return useQuery({
    queryKey: ["admin", "departments"],
    queryFn: () => adminService.getDepartmentStats(),
  });
}

export function useFacultyStats() {
  return useQuery({
    queryKey: ["admin", "faculty"],
    queryFn: () => adminService.getFacultyStats(),
  });
}

export function useRevenue() {
  return useQuery({
    queryKey: ["admin", "revenue"],
    queryFn: () => adminService.getRevenue(),
  });
}

export function useScholarshipDistribution() {
  return useQuery({
    queryKey: ["admin", "scholarships"],
    queryFn: () => adminService.getScholarshipDistribution(),
  });
}

export function useAdmissionTimeline() {
  return useQuery({
    queryKey: ["admin", "timeline"],
    queryFn: () => adminService.getAdmissionTimeline(),
  });
}

export function useProcessingTime() {
  return useQuery({
    queryKey: ["admin", "processing-time"],
    queryFn: () => adminService.getProcessingTime(),
  });
}

export function useAIAccuracy() {
  return useQuery({
    queryKey: ["admin", "ai-accuracy"],
    queryFn: () => adminService.getAIAccuracy(),
  });
}

export function useGenerateReport() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (config: ReportConfig) => adminService.generateReport(config),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin"] });
    },
  });
}

export function useSettings() {
  return useQuery({
    queryKey: ["admin", "settings"],
    queryFn: () => adminService.getSettings(),
  });
}

export function useUpdateSettings() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<SettingsData>) => adminService.updateSettings(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "settings"] });
    },
  });
}
