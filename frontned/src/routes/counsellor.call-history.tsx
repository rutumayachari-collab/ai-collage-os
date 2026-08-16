import { createFileRoute } from "@tanstack/react-router";
import { ProtectedRoute } from "@/app/guards/ProtectedRoute";
import { RoleAppShell } from "@/app/components/layout/RoleAppShell";
import { CounsellorCallHistory } from "@/app/pages/role/CounsellorCallHistory";

export const Route = createFileRoute("/counsellor/call-history")({
  head: () => ({
    meta: [
      { title: "Call History — NEXORA AI CAMPUSOS" },
      { name: "description", content: "View your call history" },
    ],
  }),
  component: () => (
    <ProtectedRoute>
      <RoleAppShell>
        <CounsellorCallHistory />
      </RoleAppShell>
    </ProtectedRoute>
  ),
});
