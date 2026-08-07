import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { documentService } from "@/app/services/document.service";
import type { Document, CreateDocumentDto, UpdateDocumentDto } from "@/app/types/document";

export function useDocuments(params?: Record<string, string | number | boolean | undefined>) {
  return useQuery({
    queryKey: ["documents", params],
    queryFn: () => documentService.getAll(params),
  });
}

export function useDocument(id: string) {
  return useQuery({
    queryKey: ["documents", id],
    queryFn: () => documentService.getById(id),
    enabled: !!id,
  });
}

export function useDocumentsByApplicant(applicantId: string) {
  return useQuery({
    queryKey: ["documents", "applicant", applicantId],
    queryFn: () => documentService.getByApplicant(applicantId),
    enabled: !!applicantId,
  });
}

export function useCreateDocument() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateDocumentDto) => documentService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["documents"] });
    },
  });
}

export function useUpdateDocument() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateDocumentDto }) =>
      documentService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["documents"] });
    },
  });
}

export function useUploadDocument() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ file, applicantId, type }: { file: File; applicantId: string; type: string }) =>
      documentService.upload(file, applicantId, type),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["documents"] });
    },
  });
}
