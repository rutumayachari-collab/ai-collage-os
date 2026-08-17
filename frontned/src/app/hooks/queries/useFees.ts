import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { feeService } from "@/app/services/fee.service";
import type { FeeStructure, StudentFeeAccount, FeeInvoice } from "@/app/types/fee";

export function useFeeStructures(params?: Record<string, string | number | boolean | undefined>) {
  return useQuery({
    queryKey: ["fee-structures", params],
    queryFn: () => feeService.getFeeStructures(params),
  });
}

export function useFeeStructure(id: string) {
  return useQuery({
    queryKey: ["fee-structures", id],
    queryFn: () => feeService.getFeeStructureById(id),
    enabled: !!id,
  });
}

export function useCreateFeeStructure() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<FeeStructure>) => feeService.createFeeStructure(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["fee-structures"] }),
  });
}

export function useUpdateFeeStructure() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<FeeStructure> }) =>
      feeService.updateFeeStructure(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["fee-structures"] }),
  });
}

export function useStudentFeeAccount(studentId: string) {
  return useQuery({
    queryKey: ["fee-accounts", studentId],
    queryFn: () => feeService.getStudentFeeAccount(studentId),
    enabled: !!studentId,
  });
}

export function useStudentFeeAccounts(
  params?: Record<string, string | number | boolean | undefined>,
) {
  return useQuery({
    queryKey: ["fee-accounts", params],
    queryFn: () => feeService.getStudentFeeAccounts(params),
  });
}

export function useCreateStudentFeeAccount() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<StudentFeeAccount>) => feeService.createStudentFeeAccount(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["fee-accounts"] }),
  });
}

export function useGenerateInvoice() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (studentId: string) => feeService.generateInvoice(studentId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["fee-invoices"] }),
  });
}

export function useInvoices(studentId: string) {
  return useQuery({
    queryKey: ["fee-invoices", studentId],
    queryFn: () => feeService.getInvoices(studentId),
    enabled: !!studentId,
  });
}

export function usePaymentHistory(studentId: string) {
  return useQuery({
    queryKey: ["fee-payments", studentId],
    queryFn: () => feeService.getPaymentHistory(studentId),
    enabled: !!studentId,
  });
}
