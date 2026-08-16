import { createFileRoute } from "@tanstack/react-router";
import { ProtectedRoute } from "@/app/guards/ProtectedRoute";
import { AppShell } from "@/app/components/layout/PremiumAppShell";
import { CallingAgentPage } from "@/app/pages/outreach/CallingAgentPage";

export const Route = createFileRoute("/outreach")({
  component: () => (
    <ProtectedRoute>
      <AppShell>
        <CallingAgentPage />
      </AppShell>
    </ProtectedRoute>
  ),
});
