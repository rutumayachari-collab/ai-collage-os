import { createFileRoute } from "@tanstack/react-router";
import { ProtectedRoute } from "@/app/guards/ProtectedRoute";
import { RoleAppShell } from "@/app/components/layout/RoleAppShell";
import { AdminNotifications } from "@/app/pages/role/AdminNotifications";

export const Route = createFileRoute("/admin/notifications")({
  head: () => ({
    meta: [
      { title: "Notifications — NEXORA AI CAMPUSOS" },
      { name: "description", content: "Notification management" },
    ],
  }),
  component: () => (
    <ProtectedRoute>
      <RoleAppShell>
        <AdminNotifications />
      </RoleAppShell>
    </ProtectedRoute>
  ),
});
