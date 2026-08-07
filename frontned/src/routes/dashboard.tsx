import { createFileRoute } from "@tanstack/react-router";
import { ProtectedRoute } from "@/app/guards/ProtectedRoute";
import { DashboardShell } from "@/app/components/dashboard/DashboardShell";
import { StudentDashboard } from "@/app/pages/dashboard/StudentDashboard";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard — AI-CollegeOS" },
      { name: "description", content: "AI-CollegeOS dashboard" },
    ],
  }),
  component: () => (
    <ProtectedRoute>
      <DashboardShell>
        <StudentDashboard />
      </DashboardShell>
    </ProtectedRoute>
  ),
});
