import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { notificationService } from "@/app/services/notification.service";
import type { Notification, NotificationStats } from "@/app/types/notification";

export function useNotifications(params?: Record<string, string | number | boolean | undefined>) {
  return useQuery({
    queryKey: ["notifications", params],
    queryFn: () => notificationService.getAll(params),
  });
}

export function useNotificationStats(recipientId?: string) {
  return useQuery({
    queryKey: ["notifications", "stats", recipientId],
    queryFn: () => notificationService.getStats(recipientId),
  });
}

export function useSendNotification() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Parameters<typeof notificationService.send>[0]) =>
      notificationService.send(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });
}

export function useMarkNotificationRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => notificationService.markAsRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });
}
