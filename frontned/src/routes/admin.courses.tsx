import { createFileRoute } from "@tanstack/react-router";
import { ProtectedRoute } from "@/app/guards/ProtectedRoute";
import { RoleAppShell } from "@/app/components/layout/RoleAppShell";
import { AdminCourses } from "@/app/pages/role/AdminCourses";

export const Route = createFileRoute("/admin/courses")({
  head: () => ({
    meta: [
      { title: "Courses — NEXORA AI CAMPUSOS" },
      { name: "description", content: "Manage courses" },
    ],
  }),
  component: () => (
    <ProtectedRoute>
      <RoleAppShell>
        <AdminCourses />
      </RoleAppShell>
    </ProtectedRoute>
  ),
});
