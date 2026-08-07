import { createFileRoute } from "@tanstack/react-router";
import { ProtectedRoute } from "@/app/guards/ProtectedRoute";
import { DashboardShell } from "@/app/components/dashboard/DashboardShell";
import { SettingsModule } from "@/app/pages/admin/SettingsModule";

export const Route = createFileRoute("/admin/settings")({
  head: () => ({
    meta: [
      { title: "Settings — AI-CollegeOS" },
      { name: "description", content: "System settings" },
    ],
  }),
  component: () => (
    <ProtectedRoute>
      <DashboardShell>
        <SettingsModule />
      </DashboardShell>
    </ProtectedRoute>
  ),
});
