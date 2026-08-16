import { createFileRoute } from "@tanstack/react-router";
import { ProtectedRoute } from "@/app/guards/ProtectedRoute";
import { RoleAppShell } from "@/app/components/layout/RoleAppShell";
import { StudentCampus } from "@/app/pages/role/StudentCampus";

export const Route = createFileRoute("/student/campus")({
  head: () => ({
    meta: [
      { title: "My Campus — NEXORA AI CAMPUSOS" },
      { name: "description", content: "Explore campus life and facilities" },
    ],
  }),
  component: () => (
    <ProtectedRoute>
      <RoleAppShell>
        <StudentCampus />
      </RoleAppShell>
    </ProtectedRoute>
  ),
});
