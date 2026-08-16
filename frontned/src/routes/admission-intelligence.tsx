import { createFileRoute } from "@tanstack/react-router";
import { ProtectedRoute } from "@/app/guards/ProtectedRoute";
import { AppShell } from "@/app/components/layout/PremiumAppShell";
import { AdmissionIntelligencePage } from "@/app/pages/admission-intelligence/AdmissionIntelligencePage";

export const Route = createFileRoute("/admission-intelligence")({
  head: () => ({
    meta: [
      { title: "Admission Intelligence Center — NEXORA AI CAMPUSOS" },
      { name: "description", content: "Admission intelligence dashboard" },
    ],
  }),
  component: () => (
    <ProtectedRoute>
      <AppShell>
        <AdmissionIntelligencePage />
      </AppShell>
    </ProtectedRoute>
  ),
});
