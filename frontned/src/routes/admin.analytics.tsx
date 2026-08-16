import { createFileRoute } from "@tanstack/react-router";
import { ProtectedRoute } from "@/app/guards/ProtectedRoute";
import { RoleAppShell } from "@/app/components/layout/RoleAppShell";
import { AdminAnalytics } from "@/app/pages/role/AdminAnalytics";

export const Route = createFileRoute("/admin/analytics")({
  head: () => ({
    meta: [
      { title: "Analytics — NEXORA AI CAMPUSOS" },
      { name: "description", content: "Analytics dashboard" },
    ],
  }),
  component: () => (
    <ProtectedRoute>
      <RoleAppShell>
        <AdminAnalytics />
      </RoleAppShell>
    </ProtectedRoute>
  ),
});
