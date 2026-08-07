import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { inquiryService } from "@/app/services/inquiry.service";
import type { Inquiry, CreateInquiryDto, UpdateInquiryDto } from "@/app/types/inquiry";

export function useInquiries(params?: Record<string, string | number | boolean | undefined>) {
  return useQuery({
    queryKey: ["inquiries", params],
    queryFn: () => inquiryService.getAll(params),
  });
}

export function useInquiry(id: string) {
  return useQuery({
    queryKey: ["inquiries", id],
    queryFn: () => inquiryService.getById(id),
    enabled: !!id,
  });
}

export function useCreateInquiry() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateInquiryDto) => inquiryService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["inquiries"] });
    },
  });
}

export function useUpdateInquiry() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateInquiryDto }) =>
      inquiryService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["inquiries"] });
    },
  });
}
