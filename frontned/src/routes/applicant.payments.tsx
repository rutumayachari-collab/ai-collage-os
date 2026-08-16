import { createFileRoute } from "@tanstack/react-router";
import { ProtectedRoute } from "@/app/guards/ProtectedRoute";
import { RoleAppShell } from "@/app/components/layout/RoleAppShell";
import { ApplicantPayments } from "@/app/pages/role/ApplicantPayments";

export const Route = createFileRoute("/applicant/payments")({
  head: () => ({
    meta: [
      { title: "Payments — NEXORA AI CAMPUSOS" },
      { name: "description", content: "View your payment history" },
    ],
  }),
  component: () => (
    <ProtectedRoute>
      <RoleAppShell>
        <ApplicantPayments />
      </RoleAppShell>
    </ProtectedRoute>
  ),
});
