import { createFileRoute } from "@tanstack/react-router";
import { ProtectedRoute } from "@/app/guards/ProtectedRoute";
import { DashboardShell } from "@/app/components/dashboard/DashboardShell";
import { AICopilotPage } from "@/app/pages/faculty/AICopilotPage";

export const Route = createFileRoute("/faculty/ai-copilot/$applicantId")({
  head: () => ({
    meta: [
      { title: "AI Copilot — AI-CollegeOS" },
      { name: "description", content: "AI-powered insights" },
    ],
  }),
  component: () => (
    <ProtectedRoute>
      <DashboardShell>
        <AICopilotPage />
      </DashboardShell>
    </ProtectedRoute>
  ),
});
