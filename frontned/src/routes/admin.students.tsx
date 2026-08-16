import { createFileRoute } from "@tanstack/react-router";
import { ProtectedRoute } from "@/app/guards/ProtectedRoute";
import { RoleAppShell } from "@/app/components/layout/RoleAppShell";
import { AdminStudents } from "@/app/pages/role/AdminStudents";

export const Route = createFileRoute("/admin/students")({
  head: () => ({
    meta: [
      { title: "Students — NEXORA AI CAMPUSOS" },
      { name: "description", content: "Manage students" },
    ],
  }),
  component: () => (
    <ProtectedRoute>
      <RoleAppShell>
        <AdminStudents />
      </RoleAppShell>
    </ProtectedRoute>
  ),
});
