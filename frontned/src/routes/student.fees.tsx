import { createFileRoute } from "@tanstack/react-router";
import { ProtectedRoute } from "@/app/guards/ProtectedRoute";
import { RoleAppShell } from "@/app/components/layout/RoleAppShell";
import { StudentFees } from "@/app/pages/role/StudentFees";

export const Route = createFileRoute("/student/fees")({
  head: () => ({
    meta: [
      { title: "Fees — NEXORA AI CAMPUSOS" },
      { name: "description", content: "View and pay your fees" },
    ],
  }),
  component: () => (
    <ProtectedRoute>
      <RoleAppShell>
        <StudentFees />
      </RoleAppShell>
    </ProtectedRoute>
  ),
});
