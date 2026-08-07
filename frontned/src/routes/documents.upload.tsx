import { createFileRoute } from "@tanstack/react-router";
import { ProtectedRoute } from "@/app/guards/ProtectedRoute";
import { DashboardShell } from "@/app/components/dashboard/DashboardShell";
import { DocumentUpload } from "@/app/pages/documents/DocumentUpload";

export const Route = createFileRoute("/documents/upload")({
  head: () => ({
    meta: [
      { title: "Upload Document — AI-CollegeOS" },
      { name: "description", content: "Upload a document" },
    ],
  }),
  component: () => (
    <ProtectedRoute>
      <DashboardShell>
        <DocumentUpload />
      </DashboardShell>
    </ProtectedRoute>
  ),
});
