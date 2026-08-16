import { createFileRoute } from "@tanstack/react-router";
import { ProtectedRoute } from "@/app/guards/ProtectedRoute";
import { RoleAppShell } from "@/app/components/layout/RoleAppShell";
import { StudentProfile } from "@/app/pages/role/StudentProfile";

export const Route = createFileRoute("/student/profile")({
  head: () => ({
    meta: [
      { title: "My Profile — NEXORA AI CAMPUSOS" },
      { name: "description", content: "View and manage your student profile" },
    ],
  }),
  component: () => (
    <ProtectedRoute>
      <RoleAppShell>
        <StudentProfile />
      </RoleAppShell>
    </ProtectedRoute>
  ),
});
