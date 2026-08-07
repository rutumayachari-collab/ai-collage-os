import { createFileRoute } from "@tanstack/react-router";
import { ProtectedRoute } from "@/app/guards/ProtectedRoute";
import { DashboardShell } from "@/app/components/dashboard/DashboardShell";
import { NotificationsCenter } from "@/app/pages/faculty/NotificationsCenter";

export const Route = createFileRoute("/faculty/notifications")({
  head: () => ({
    meta: [
      { title: "Notifications — AI-CollegeOS" },
      { name: "description", content: "View notifications" },
    ],
  }),
  component: () => (
    <ProtectedRoute>
      <DashboardShell>
        <NotificationsCenter />
      </DashboardShell>
    </ProtectedRoute>
  ),
});
