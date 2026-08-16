import { createFileRoute } from "@tanstack/react-router";
import { ProtectedRoute } from "@/app/guards/ProtectedRoute";
import { RoleAppShell } from "@/app/components/layout/RoleAppShell";
import { StudentTimetable } from "@/app/pages/role/StudentTimetable";

export const Route = createFileRoute("/student/timetable")({
  head: () => ({
    meta: [
      { title: "Timetable — NEXORA AI CAMPUSOS" },
      { name: "description", content: "View your class timetable" },
    ],
  }),
  component: () => (
    <ProtectedRoute>
      <RoleAppShell>
        <StudentTimetable />
      </RoleAppShell>
    </ProtectedRoute>
  ),
});
