import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { hostelService } from "@/app/services/hostel.service";
import type { Hostel, HostelRoom, HostelAllocation } from "@/app/types/hostel";

export function useHostels(params?: Record<string, string | number | boolean | undefined>) {
  return useQuery({
    queryKey: ["hostels", params],
    queryFn: () => hostelService.getHostels(params),
  });
}

export function useHostel(id: string) {
  return useQuery({
    queryKey: ["hostels", id],
    queryFn: () => hostelService.getHostel(id),
    enabled: !!id,
  });
}

export function useCreateHostel() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<Hostel>) => hostelService.createHostel(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["hostels"] }),
  });
}

export function useUpdateHostel() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Hostel> }) =>
      hostelService.updateHostel(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["hostels"] }),
  });
}

export function useRooms(
  hostelId: string,
  params?: Record<string, string | number | boolean | undefined>,
) {
  return useQuery({
    queryKey: ["hostel-rooms", hostelId, params],
    queryFn: () => hostelService.getRooms(hostelId, params),
    enabled: !!hostelId,
  });
}

export function useCreateRoom() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ hostelId, data }: { hostelId: string; data: Partial<HostelRoom> }) =>
      hostelService.createRoom(hostelId, data),
    onSuccess: (_, variables) =>
      queryClient.invalidateQueries({ queryKey: ["hostel-rooms", variables.hostelId] }),
  });
}

export function useUpdateRoom() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      hostelId,
      roomId,
      data,
    }: {
      hostelId: string;
      roomId: string;
      data: Partial<HostelRoom>;
    }) => hostelService.updateRoom(hostelId, roomId, data),
    onSuccess: (_, variables) =>
      queryClient.invalidateQueries({ queryKey: ["hostel-rooms", variables.hostelId] }),
  });
}

export function useAllocations(params?: Record<string, string | number | boolean | undefined>) {
  return useQuery({
    queryKey: ["hostel-allocations", params],
    queryFn: () => hostelService.getAllocations(params),
  });
}

export function useCreateAllocation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<HostelAllocation>) => hostelService.createAllocation(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["hostel-allocations"] }),
  });
}

export function useCheckIn() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => hostelService.checkIn(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["hostel-allocations"] }),
  });
}

export function useCheckOut() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => hostelService.checkOut(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["hostel-allocations"] }),
  });
}
