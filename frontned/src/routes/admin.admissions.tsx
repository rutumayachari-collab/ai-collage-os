import { createFileRoute } from "@tanstack/react-router";
import { ProtectedRoute } from "@/app/guards/ProtectedRoute";
import { RoleAppShell } from "@/app/components/layout/RoleAppShell";
import { AdminAdmissions } from "@/app/pages/role/AdminAdmissions";

export const Route = createFileRoute("/admin/admissions")({
  head: () => ({
    meta: [
      { title: "Admissions — NEXORA AI CAMPUSOS" },
      { name: "description", content: "Admissions pipeline" },
    ],
  }),
  component: () => (
    <ProtectedRoute>
      <RoleAppShell>
        <AdminAdmissions />
      </RoleAppShell>
    </ProtectedRoute>
  ),
});
