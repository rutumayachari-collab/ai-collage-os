import { createFileRoute } from "@tanstack/react-router";
import { ProtectedRoute } from "@/app/guards/ProtectedRoute";
import { RoleAppShell } from "@/app/components/layout/RoleAppShell";
import { StudentAcademics } from "@/app/pages/role/StudentAcademics";

export const Route = createFileRoute("/student/academics")({
  head: () => ({
    meta: [
      { title: "Academics — NEXORA AI CAMPUSOS" },
      { name: "description", content: "View your academic records" },
    ],
  }),
  component: () => (
    <ProtectedRoute>
      <RoleAppShell>
        <StudentAcademics />
      </RoleAppShell>
    </ProtectedRoute>
  ),
});
