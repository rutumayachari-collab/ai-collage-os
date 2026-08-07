import { createFileRoute } from "@tanstack/react-router";
import { PaymentHistory } from "@/app/pages/payments/PaymentHistory";

export const Route = createFileRoute("/payments/history")({
  component: PaymentHistoryPage,
});

function PaymentHistoryPage() {
  return <PaymentHistory />;
}
