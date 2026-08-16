import { createFileRoute } from "@tanstack/react-router";
import { ProtectedRoute } from "@/app/guards/ProtectedRoute";
import { RoleAppShell } from "@/app/components/layout/RoleAppShell";
import { AICopilot } from "@/app/pages/role/AICopilot";

export const Route = createFileRoute("/ai/copilot")({
  head: () => ({
    meta: [
      { title: "AI Copilot — NEXORA AI CAMPUSOS" },
      { name: "description", content: "Role-specific AI assistant" },
    ],
  }),
  component: () => (
    <ProtectedRoute>
      <RoleAppShell>
        <AICopilot />
      </RoleAppShell>
    </ProtectedRoute>
  ),
});
