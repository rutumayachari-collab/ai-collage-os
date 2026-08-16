import { createFileRoute } from "@tanstack/react-router";
import { ProtectedRoute } from "@/app/guards/ProtectedRoute";
import { RoleAppShell } from "@/app/components/layout/RoleAppShell";
import { StudentEvents } from "@/app/pages/role/StudentEvents";

export const Route = createFileRoute("/student/events")({
  head: () => ({
    meta: [
      { title: "Events — NEXORA AI CAMPUSOS" },
      { name: "description", content: "View campus events and activities" },
    ],
  }),
  component: () => (
    <ProtectedRoute>
      <RoleAppShell>
        <StudentEvents />
      </RoleAppShell>
    </ProtectedRoute>
  ),
});
