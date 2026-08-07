import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { facultyService } from "@/app/services/faculty.service";

export function useFacultyStats() {
  return useQuery({
    queryKey: ["faculty", "stats"],
    queryFn: () => facultyService.getStats(),
    refetchInterval: 30000,
  });
}

export function useReviewQueue(type: string) {
  return useQuery({
    queryKey: ["faculty", "queue", type],
    queryFn: () => facultyService.getReviewQueue(type),
    refetchInterval: 15000,
  });
}

export function useAICopilotInsight(applicantId: string) {
  return useQuery({
    queryKey: ["faculty", "ai-insight", applicantId],
    queryFn: () => facultyService.getAICopilotInsight(applicantId),
    enabled: !!applicantId,
  });
}

export function useNotifications() {
  return useQuery({
    queryKey: ["faculty", "notifications"],
    queryFn: () => facultyService.getNotifications(),
    refetchInterval: 30000,
  });
}

export function useMarkNotificationRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => facultyService.markNotificationRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["faculty", "notifications"] });
    },
  });
}
