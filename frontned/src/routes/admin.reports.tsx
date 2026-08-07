import { createFileRoute } from "@tanstack/react-router";
import { ProtectedRoute } from "@/app/guards/ProtectedRoute";
import { DashboardShell } from "@/app/components/dashboard/DashboardShell";
import { ReportsModule } from "@/app/pages/admin/ReportsModule";

export const Route = createFileRoute("/admin/reports")({
  head: () => ({
    meta: [
      { title: "Reports — AI-CollegeOS" },
      { name: "description", content: "Generate reports" },
    ],
  }),
  component: () => (
    <ProtectedRoute>
      <DashboardShell>
        <ReportsModule />
      </DashboardShell>
    </ProtectedRoute>
  ),
});
