import { createFileRoute } from "@tanstack/react-router";
import { ProtectedRoute } from "@/app/guards/ProtectedRoute";
import { RoleAppShell } from "@/app/components/layout/RoleAppShell";
import { AdminSettings } from "@/app/pages/role/AdminSettings";

export const Route = createFileRoute("/admin/settings")({
  head: () => ({
    meta: [
      { title: "Settings — NEXORA AI CAMPUSOS" },
      { name: "description", content: "System settings" },
    ],
  }),
  component: () => (
    <ProtectedRoute>
      <RoleAppShell>
        <AdminSettings />
      </RoleAppShell>
    </ProtectedRoute>
  ),
});
