import { createFileRoute } from "@tanstack/react-router";
import { ProtectedRoute } from "@/app/guards/ProtectedRoute";
import { RoleAppShell } from "@/app/components/layout/RoleAppShell";
import { StudentDashboard } from "@/app/pages/role/StudentDashboard";

export const Route = createFileRoute("/student/dashboard")({
  head: () => ({
    meta: [
      { title: "Student Dashboard — NEXORA AI CAMPUSOS" },
      { name: "description", content: "Student dashboard" },
    ],
  }),
  component: () => (
    <ProtectedRoute>
      <RoleAppShell>
        <StudentDashboard />
      </RoleAppShell>
    </ProtectedRoute>
  ),
});
