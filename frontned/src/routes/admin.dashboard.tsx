import { createFileRoute } from "@tanstack/react-router";
import { ProtectedRoute } from "@/app/guards/ProtectedRoute";
import { RoleAppShell } from "@/app/components/layout/RoleAppShell";
import { AdminDashboard } from "@/app/pages/role/AdminDashboard";

export const Route = createFileRoute("/admin/dashboard")({
  head: () => ({
    meta: [
      { title: "Admin Dashboard — NEXORA AI CAMPUSOS" },
      { name: "description", content: "Admin dashboard" },
    ],
  }),
  component: () => (
    <ProtectedRoute>
      <RoleAppShell>
        <AdminDashboard />
      </RoleAppShell>
    </ProtectedRoute>
  ),
});
