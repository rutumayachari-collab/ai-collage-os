import { createFileRoute } from "@tanstack/react-router";
import { PaymentSummary } from "@/app/pages/payments/PaymentSummary";

export const Route = createFileRoute("/payments/summary")({
  component: PaymentSummaryPage,
});

function PaymentSummaryPage() {
  return <PaymentSummary />;
}
