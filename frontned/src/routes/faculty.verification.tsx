import { createFileRoute } from "@tanstack/react-router";
import { ProtectedRoute } from "@/app/guards/ProtectedRoute";
import { DashboardShell } from "@/app/components/dashboard/DashboardShell";
import { VerificationQueue } from "@/app/pages/faculty/VerificationQueue";

export const Route = createFileRoute("/faculty/verification")({
  head: () => ({
    meta: [
      { title: "Verification Queue — NEXORA AI CAMPUSOS" },
      { name: "description", content: "Verify documents" },
    ],
  }),
  component: () => (
    <ProtectedRoute>
      <DashboardShell>
        <VerificationQueue />
      </DashboardShell>
    </ProtectedRoute>
  ),
});
