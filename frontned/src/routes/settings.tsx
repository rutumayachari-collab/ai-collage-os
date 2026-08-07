import { createFileRoute } from "@tanstack/react-router";
import { ProtectedRoute } from "@/app/guards/ProtectedRoute";
import { DashboardShell } from "@/app/components/dashboard/DashboardShell";

export const Route = createFileRoute("/settings")({
  head: () => ({
    meta: [{ title: "Settings — AI-CollegeOS" }, { name: "description", content: "Settings page" }],
  }),
  component: () => (
    <ProtectedRoute>
      <DashboardShell>
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <h1 className="text-2xl font-bold">Settings</h1>
            <p className="mt-2 text-muted-foreground">Settings page coming soon.</p>
          </div>
        </div>
      </DashboardShell>
    </ProtectedRoute>
  ),
});
