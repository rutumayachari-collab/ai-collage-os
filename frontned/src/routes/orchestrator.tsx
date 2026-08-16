import { createFileRoute } from "@tanstack/react-router";
import { ProtectedRoute } from "@/app/guards/ProtectedRoute";
import { AppShell } from "@/app/components/layout/PremiumAppShell";
import { ActionOrchestratorPage } from "@/app/pages/orchestrator/ActionOrchestratorPage";

export const Route = createFileRoute("/orchestrator")({
  component: () => (
    <ProtectedRoute>
      <AppShell>
        <ActionOrchestratorPage />
      </AppShell>
    </ProtectedRoute>
  ),
});
