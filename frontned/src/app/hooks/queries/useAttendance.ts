import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { attendanceService } from "@/app/services/attendance.service";
import type {
  AttendanceRecord,
  AttendanceSummary,
  AttendanceStatistics,
} from "@/app/types/attendance";

export function useAttendance(params?: Record<string, string | number | boolean | undefined>) {
  return useQuery({
    queryKey: ["attendance", params],
    queryFn: () => attendanceService.getAll(params),
  });
}

export function useMyAttendance() {
  return useQuery({
    queryKey: ["attendance", "me"],
    queryFn: () => attendanceService.getMyAttendance(),
  });
}

export function useMyAttendanceSummary(subjectId: string) {
  return useQuery({
    queryKey: ["attendance", "me", "summary", subjectId],
    queryFn: () => attendanceService.getMySummary(subjectId),
    enabled: !!subjectId,
  });
}

export function useAttendanceStatistics() {
  return useQuery({
    queryKey: ["attendance", "statistics"],
    queryFn: () => attendanceService.getStatistics(),
  });
}

export function useCreateAttendance() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<AttendanceRecord>) => attendanceService.create(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["attendance"] }),
  });
}

export function useUpdateAttendance() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<AttendanceRecord> }) =>
      attendanceService.update(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["attendance"] }),
  });
}

export function useBulkMarkAttendance() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: {
      studentIds: string[];
      subjectId: string;
      date: string;
      periodNumber?: number;
      status: string;
      remarks?: string;
    }) => attendanceService.bulkMark(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["attendance"] }),
  });
}
