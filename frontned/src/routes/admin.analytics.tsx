import { createFileRoute } from "@tanstack/react-router";
import { ProtectedRoute } from "@/app/guards/ProtectedRoute";
import { DashboardShell } from "@/app/components/dashboard/DashboardShell";
import { AnalyticsDashboard } from "@/app/pages/admin/AnalyticsDashboard";

export const Route = createFileRoute("/admin/analytics")({
  head: () => ({
    meta: [
      { title: "Analytics — AI-CollegeOS" },
      { name: "description", content: "Analytics dashboard" },
    ],
  }),
  component: () => (
    <ProtectedRoute>
      <DashboardShell>
        <AnalyticsDashboard />
      </DashboardShell>
    </ProtectedRoute>
  ),
});
