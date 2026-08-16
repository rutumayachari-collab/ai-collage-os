import { createFileRoute } from "@tanstack/react-router";
import { ProtectedRoute } from "@/app/guards/ProtectedRoute";
import { RoleAppShell } from "@/app/components/layout/RoleAppShell";
import { StudentCourses } from "@/app/pages/role/StudentCourses";

export const Route = createFileRoute("/student/courses")({
  head: () => ({
    meta: [
      { title: "My Courses — NEXORA AI CAMPUSOS" },
      { name: "description", content: "View your enrolled courses" },
    ],
  }),
  component: () => (
    <ProtectedRoute>
      <RoleAppShell>
        <StudentCourses />
      </RoleAppShell>
    </ProtectedRoute>
  ),
});
