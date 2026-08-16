import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { adminService } from "@/app/services/admin.service";
import type {
  AdminStats,
  SettingsData,
  AdmissionFunnel,
  RevenueData,
  ScholarshipData,
  TimelineData,
  ProcessingTimeData,
  AIAccuracyData,
  ReportConfig,
} from "@/app/types/admin";

export function useAdminStats() {
  return useQuery({
    queryKey: ["admin", "stats"],
    queryFn: () => adminService.getStats(),
  });
}

export function useAdmissionFunnel() {
  return useAdminAdmissionFunnel();
}

export function useAdminAdmissionFunnel() {
  return useQuery({
    queryKey: ["admin", "admission-funnel"],
    queryFn: () => adminService.getAdmissionFunnel(),
  });
}

export function useRevenue() {
  return useAdminRevenue();
}

export function useAdminRevenue() {
  return useQuery({
    queryKey: ["admin", "revenue"],
    queryFn: () => adminService.getRevenue(),
  });
}

export function useScholarshipDistribution() {
  return useAdminScholarshipDistribution();
}

export function useAdminScholarshipDistribution() {
  return useQuery({
    queryKey: ["admin", "scholarship-distribution"],
    queryFn: () => adminService.getScholarshipDistribution(),
  });
}

export function useAdmissionTimeline() {
  return useAdminAdmissionTimeline();
}

export function useAdminAdmissionTimeline() {
  return useQuery({
    queryKey: ["admin", "admission-timeline"],
    queryFn: () => adminService.getAdmissionTimeline(),
  });
}

export function useProcessingTime() {
  return useAdminProcessingTime();
}

export function useAdminProcessingTime() {
  return useQuery({
    queryKey: ["admin", "processing-time"],
    queryFn: () => adminService.getProcessingTime(),
  });
}

export function useAIAccuracy() {
  return useAdminAIAccuracy();
}

export function useAdminAIAccuracy() {
  return useQuery({
    queryKey: ["admin", "ai-accuracy"],
    queryFn: () => adminService.getAIAccuracy(),
  });
}

export function useAdminSettings() {
  return useQuery({
    queryKey: ["admin", "settings"],
    queryFn: () => adminService.getSettings(),
  });
}

export function useSettings() {
  return useAdminSettings();
}

export function useUpdateAdminSettings() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<SettingsData>) => adminService.updateSettings(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin"] });
    },
  });
}

export function useUpdateSettings() {
  return useUpdateAdminSettings();
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
