import { createFileRoute } from "@tanstack/react-router";
import { ProtectedRoute } from "@/app/guards/ProtectedRoute";
import { RoleAppShell } from "@/app/components/layout/RoleAppShell";
import { StudentAssignments } from "@/app/pages/role/StudentAssignments";

export const Route = createFileRoute("/student/assignments")({
  head: () => ({
    meta: [
      { title: "Assignments — NEXORA AI CAMPUSOS" },
      { name: "description", content: "View and submit assignments" },
    ],
  }),
  component: () => (
    <ProtectedRoute>
      <RoleAppShell>
        <StudentAssignments />
      </RoleAppShell>
    </ProtectedRoute>
  ),
});
