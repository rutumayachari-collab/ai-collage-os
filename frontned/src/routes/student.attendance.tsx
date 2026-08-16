import { createFileRoute } from "@tanstack/react-router";
import { ProtectedRoute } from "@/app/guards/ProtectedRoute";
import { RoleAppShell } from "@/app/components/layout/RoleAppShell";
import { StudentAttendance } from "@/app/pages/role/StudentAttendance";

export const Route = createFileRoute("/student/attendance")({
  head: () => ({
    meta: [
      { title: "Attendance — NEXORA AI CAMPUSOS" },
      { name: "description", content: "View your attendance records" },
    ],
  }),
  component: () => (
    <ProtectedRoute>
      <RoleAppShell>
        <StudentAttendance />
      </RoleAppShell>
    </ProtectedRoute>
  ),
});
