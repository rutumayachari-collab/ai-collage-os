import { createFileRoute } from "@tanstack/react-router";
import { ProtectedRoute } from "@/app/guards/ProtectedRoute";
import { RoleAppShell } from "@/app/components/layout/RoleAppShell";
import { AdminPayments } from "@/app/pages/role/AdminPayments";

export const Route = createFileRoute("/admin/payments")({
  head: () => ({
    meta: [
      { title: "Payments — NEXORA AI CAMPUSOS" },
      { name: "description", content: "Payment management" },
    ],
  }),
  component: () => (
    <ProtectedRoute>
      <RoleAppShell>
        <AdminPayments />
      </RoleAppShell>
    </ProtectedRoute>
  ),
});
