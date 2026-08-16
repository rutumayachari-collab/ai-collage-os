import { createFileRoute } from "@tanstack/react-router";
import { ProtectedRoute } from "@/app/guards/ProtectedRoute";
import { DashboardRouter } from "@/app/pages/dashboard/DashboardRouter";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard — NEXORA AI CAMPUSOS" },
      { name: "description", content: "NEXORA AI CAMPUSOS dashboard" },
    ],
  }),
  component: () => (
    <ProtectedRoute>
      <DashboardRouter />
    </ProtectedRoute>
  ),
});
