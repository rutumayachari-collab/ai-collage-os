import { createFileRoute } from "@tanstack/react-router";
import { ProtectedRoute } from "@/app/guards/ProtectedRoute";
import { DashboardShell } from "@/app/components/dashboard/DashboardShell";
import { DocumentList } from "@/app/pages/documents/DocumentList";

export const Route = createFileRoute("/documents")({
  head: () => ({
    meta: [
      { title: "Documents — AI-CollegeOS" },
      { name: "description", content: "Manage documents" },
    ],
  }),
  component: () => (
    <ProtectedRoute>
      <DashboardShell>
        <DocumentList />
      </DashboardShell>
    </ProtectedRoute>
  ),
});
