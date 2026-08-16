import { createFileRoute } from "@tanstack/react-router";
import { ProtectedRoute } from "@/app/guards/ProtectedRoute";
import { RoleAppShell } from "@/app/components/layout/RoleAppShell";
import { StudentFuture } from "@/app/pages/role/StudentFuture";

export const Route = createFileRoute("/student/future")({
  head: () => ({
    meta: [
      { title: "My Future — NEXORA AI CAMPUSOS" },
      { name: "description", content: "Plan your career and placements" },
    ],
  }),
  component: () => (
    <ProtectedRoute>
      <RoleAppShell>
        <StudentFuture />
      </RoleAppShell>
    </ProtectedRoute>
  ),
});
