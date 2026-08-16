import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { paymentService } from "@/app/services/payment.service";
import type { Payment, PaymentSummary } from "@/app/types/payment";

export function usePayments(params?: Record<string, string | number | boolean | undefined>) {
  return useQuery({
    queryKey: ["payments", params],
    queryFn: () => paymentService.getAll(params),
  });
}

export function usePaymentSummary() {
  return useQuery({
    queryKey: ["payments", "summary"],
    queryFn: () => paymentService.getSummary(),
  });
}
