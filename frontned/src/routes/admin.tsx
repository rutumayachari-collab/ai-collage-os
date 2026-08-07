import { createFileRoute } from "@tanstack/react-router";
import { ProtectedRoute } from "@/app/guards/ProtectedRoute";
import { DashboardShell } from "@/app/components/dashboard/DashboardShell";
import { AdminDashboard } from "@/app/pages/admin/AdminDashboard";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Admin Dashboard — AI-CollegeOS" },
      { name: "description", content: "Admin dashboard" },
    ],
  }),
  component: () => (
    <ProtectedRoute>
      <DashboardShell>
        <AdminDashboard />
      </DashboardShell>
    </ProtectedRoute>
  ),
});
