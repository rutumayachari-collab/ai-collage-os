import { createFileRoute } from "@tanstack/react-router";
import { ProtectedRoute } from "@/app/guards/ProtectedRoute";
import { RoleAppShell } from "@/app/components/layout/RoleAppShell";
import { CallingAgentWorkspace } from "@/app/pages/role/CallingAgentWorkspace";

export const Route = createFileRoute("/counsellor/workspace")({
  head: () => ({
    meta: [
      { title: "Calling Agent Workspace — NEXORA AI CAMPUSOS" },
      { name: "description", content: "AI-assisted outreach workspace" },
    ],
  }),
  component: () => (
    <ProtectedRoute>
      <RoleAppShell>
        <CallingAgentWorkspace />
      </RoleAppShell>
    </ProtectedRoute>
  ),
});
