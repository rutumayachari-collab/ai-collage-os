import { createFileRoute } from "@tanstack/react-router";
import { ProtectedRoute } from "@/app/guards/ProtectedRoute";
import { RoleAppShell } from "@/app/components/layout/RoleAppShell";
import { AdminReports } from "@/app/pages/role/AdminReports";

export const Route = createFileRoute("/admin/reports")({
  head: () => ({
    meta: [
      { title: "Reports — NEXORA AI CAMPUSOS" },
      { name: "description", content: "Generate reports" },
    ],
  }),
  component: () => (
    <ProtectedRoute>
      <RoleAppShell>
        <AdminReports />
      </RoleAppShell>
    </ProtectedRoute>
  ),
});
