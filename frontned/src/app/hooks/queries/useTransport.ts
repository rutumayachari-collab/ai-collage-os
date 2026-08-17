import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { transportService } from "@/app/services/transport.service";
import type {
  TransportRoute,
  Vehicle,
  Driver,
  Stop,
  StudentAssignment,
} from "@/app/types/transport";

export function useTransports(params?: Record<string, string | number | boolean | undefined>) {
  return useQuery({
    queryKey: ["transports", params],
    queryFn: () => transportService.getTransports(params),
  });
}

export function useCreateTransport() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Record<string, unknown>) => transportService.createTransport(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["transports"] }),
  });
}

export function useTransportRoutes(transportId: string) {
  return useQuery({
    queryKey: ["transport-routes", transportId],
    queryFn: async () => {
      const transport = await transportService.getTransport(transportId);
      return transport?.routes || [];
    },
    enabled: !!transportId,
  });
}

export function useCreateTransportRoute() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ transportId, data }: { transportId: string; data: Partial<TransportRoute> }) =>
      transportService.addRoute(transportId, data),
    onSuccess: (_, variables) =>
      queryClient.invalidateQueries({ queryKey: ["transport-routes", variables.transportId] }),
  });
}

export function useUpdateTransportRoute() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      transportId,
      routeId,
      data,
    }: {
      transportId: string;
      routeId: string;
      data: Partial<TransportRoute>;
    }) => transportService.updateRoute(transportId, routeId, data),
    onSuccess: (_, variables) =>
      queryClient.invalidateQueries({ queryKey: ["transport-routes", variables.transportId] }),
  });
}

export function useVehicles(transportId: string) {
  return useQuery({
    queryKey: ["transport-vehicles", transportId],
    queryFn: async () => {
      const transport = await transportService.getTransport(transportId);
      return transport?.vehicles || [];
    },
    enabled: !!transportId,
  });
}

export function useCreateVehicle() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ transportId, data }: { transportId: string; data: Partial<Vehicle> }) =>
      transportService.addVehicle(transportId, data),
    onSuccess: (_, variables) =>
      queryClient.invalidateQueries({ queryKey: ["transport-vehicles", variables.transportId] }),
  });
}

export function useStops(transportId: string) {
  return useQuery({
    queryKey: ["transport-stops", transportId],
    queryFn: async () => {
      const transport = await transportService.getTransport(transportId);
      return transport?.stops || [];
    },
    enabled: !!transportId,
  });
}

export function useCreateStop() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ transportId, data }: { transportId: string; data: Partial<Stop> }) =>
      transportService.addStop(transportId, data),
    onSuccess: (_, variables) =>
      queryClient.invalidateQueries({ queryKey: ["transport-stops", variables.transportId] }),
  });
}

export function useTransportAssignments(
  params?: Record<string, string | number | boolean | undefined>,
) {
  return useQuery({
    queryKey: ["transport-assignments", params],
    queryFn: async () => {
      if (params?.studentId) {
        const transports = await transportService.getTransports();
        const assignments: StudentAssignment[] = [];
        for (const transport of transports) {
          const studentAssignments =
            transport?.studentAssignments?.filter(
              (a: StudentAssignment) => a.studentId === params.studentId,
            ) || [];
          assignments.push(...studentAssignments);
        }
        return assignments;
      }
      const transports = await transportService.getTransports();
      const assignments: StudentAssignment[] = [];
      for (const transport of transports) {
        assignments.push(...(transport?.studentAssignments || []));
      }
      return assignments;
    },
  });
}

export function useCreateTransportAssignment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      transportId,
      data,
    }: {
      transportId: string;
      data: { studentId: string; routeId?: string; stopId?: string; feeId?: string };
    }) => transportService.assignStudent(transportId, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["transport-assignments"] }),
  });
}

export function useUpdateTransportAssignment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      transportId,
      assignmentId,
      data,
    }: {
      transportId: string;
      assignmentId: string;
      data: Partial<StudentAssignment>;
    }) => transportService.updateAssignmentStatus(transportId, assignmentId, data.status || ""),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["transport-assignments"] }),
  });
}
