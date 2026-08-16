import { createFileRoute } from "@tanstack/react-router";
import { ProtectedRoute } from "@/app/guards/ProtectedRoute";
import { RoleAppShell } from "@/app/components/layout/RoleAppShell";
import { StudentApplicationForm } from "@/app/pages/role/StudentApplicationForm";

export const Route = createFileRoute("/student/application/new")({
  head: () => ({
    meta: [
      { title: "New Application — NEXORA AI CAMPUSOS" },
      { name: "description", content: "Submit a new admission application" },
    ],
  }),
  component: () => (
    <ProtectedRoute>
      <RoleAppShell>
        <StudentApplicationForm />
      </RoleAppShell>
    </ProtectedRoute>
  ),
});
