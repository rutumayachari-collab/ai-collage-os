import { createFileRoute } from "@tanstack/react-router";
import { ProtectedRoute } from "@/app/guards/ProtectedRoute";
import { RoleAppShell } from "@/app/components/layout/RoleAppShell";
import { CounsellorDashboard } from "@/app/pages/role/CounsellorDashboard";

export const Route = createFileRoute("/counsellor/dashboard")({
  head: () => ({
    meta: [
      { title: "Counsellor Dashboard — NEXORA AI CAMPUSOS" },
      { name: "description", content: "Counsellor dashboard" },
    ],
  }),
  component: () => (
    <ProtectedRoute>
      <RoleAppShell>
        <CounsellorDashboard />
      </RoleAppShell>
    </ProtectedRoute>
  ),
});
