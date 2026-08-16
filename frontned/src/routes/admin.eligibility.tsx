import { createFileRoute } from "@tanstack/react-router";
import { ProtectedRoute } from "@/app/guards/ProtectedRoute";
import { RoleAppShell } from "@/app/components/layout/RoleAppShell";
import { AdminEligibility } from "@/app/pages/role/AdminEligibility";

export const Route = createFileRoute("/admin/eligibility")({
  head: () => ({
    meta: [
      { title: "Eligibility — NEXORA AI CAMPUSOS" },
      { name: "description", content: "Eligibility checks" },
    ],
  }),
  component: () => (
    <ProtectedRoute>
      <RoleAppShell>
        <AdminEligibility />
      </RoleAppShell>
    </ProtectedRoute>
  ),
});
