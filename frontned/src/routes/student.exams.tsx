import { createFileRoute } from "@tanstack/react-router";
import { ProtectedRoute } from "@/app/guards/ProtectedRoute";
import { RoleAppShell } from "@/app/components/layout/RoleAppShell";
import { StudentExams } from "@/app/pages/role/StudentExams";

export const Route = createFileRoute("/student/exams")({
  head: () => ({
    meta: [
      { title: "Exams — NEXORA AI CAMPUSOS" },
      { name: "description", content: "View your exam schedule and results" },
    ],
  }),
  component: () => (
    <ProtectedRoute>
      <RoleAppShell>
        <StudentExams />
      </RoleAppShell>
    </ProtectedRoute>
  ),
});
