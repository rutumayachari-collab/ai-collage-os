import { createFileRoute } from "@tanstack/react-router";
import { ProtectedRoute } from "@/app/guards/ProtectedRoute";
import { RoleAppShell } from "@/app/components/layout/RoleAppShell";
import { CallHistory } from "@/app/pages/role/CallHistory";

export const Route = createFileRoute("/counsellor/calls")({
  head: () => ({
    meta: [
      { title: "Call History — NEXORA AI CAMPUSOS" },
      { name: "description", content: "View your call history" },
    ],
  }),
  component: () => (
    <ProtectedRoute>
      <RoleAppShell>
        <CallHistory />
      </RoleAppShell>
    </ProtectedRoute>
  ),
});
