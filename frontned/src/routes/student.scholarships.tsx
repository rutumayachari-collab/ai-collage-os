import { createFileRoute } from "@tanstack/react-router";
import { ProtectedRoute } from "@/app/guards/ProtectedRoute";
import { RoleAppShell } from "@/app/components/layout/RoleAppShell";
import { StudentScholarships } from "@/app/pages/role/StudentScholarships";

export const Route = createFileRoute("/student/scholarships")({
  head: () => ({
    meta: [
      { title: "Scholarships — NEXORA AI CAMPUSOS" },
      { name: "description", content: "View your scholarships and financial aid" },
    ],
  }),
  component: () => (
    <ProtectedRoute>
      <RoleAppShell>
        <StudentScholarships />
      </RoleAppShell>
    </ProtectedRoute>
  ),
});
