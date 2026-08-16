import { createFileRoute } from "@tanstack/react-router";
import { ProtectedRoute } from "@/app/guards/ProtectedRoute";
import { RoleAppShell } from "@/app/components/layout/RoleAppShell";
import { StudentSettings } from "@/app/pages/role/StudentSettings";

export const Route = createFileRoute("/student/settings")({
  head: () => ({
    meta: [
      { title: "Settings — NEXORA AI CAMPUSOS" },
      { name: "description", content: "Manage your account settings" },
    ],
  }),
  component: () => (
    <ProtectedRoute>
      <RoleAppShell>
        <StudentSettings />
      </RoleAppShell>
    </ProtectedRoute>
  ),
});
