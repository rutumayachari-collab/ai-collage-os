import { createFileRoute } from "@tanstack/react-router";
import { ProtectedRoute } from "@/app/guards/ProtectedRoute";
import { DashboardShell } from "@/app/components/dashboard/DashboardShell";
import { EligibilityQueue } from "@/app/pages/faculty/EligibilityQueue";

export const Route = createFileRoute("/faculty/eligibility")({
  head: () => ({
    meta: [
      { title: "Eligibility Queue — NEXORA AI CAMPUSOS" },
      { name: "description", content: "Check eligibility" },
    ],
  }),
  component: () => (
    <ProtectedRoute>
      <DashboardShell>
        <EligibilityQueue />
      </DashboardShell>
    </ProtectedRoute>
  ),
});
