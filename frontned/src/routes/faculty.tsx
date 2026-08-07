import { createFileRoute } from "@tanstack/react-router";
import { ProtectedRoute } from "@/app/guards/ProtectedRoute";
import { DashboardShell } from "@/app/components/dashboard/DashboardShell";
import { FacultyDashboard } from "@/app/pages/faculty/FacultyDashboard";

export const Route = createFileRoute("/faculty")({
  head: () => ({
    meta: [
      { title: "Faculty Dashboard — AI-CollegeOS" },
      { name: "description", content: "Faculty dashboard" },
    ],
  }),
  component: () => (
    <ProtectedRoute>
      <DashboardShell>
        <FacultyDashboard />
      </DashboardShell>
    </ProtectedRoute>
  ),
});
