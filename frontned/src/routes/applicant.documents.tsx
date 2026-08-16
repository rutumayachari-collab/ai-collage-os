import { createFileRoute } from "@tanstack/react-router";
import { ProtectedRoute } from "@/app/guards/ProtectedRoute";
import { RoleAppShell } from "@/app/components/layout/RoleAppShell";
import { ApplicantDocuments } from "@/app/pages/role/ApplicantDocuments";

export const Route = createFileRoute("/applicant/documents")({
  head: () => ({
    meta: [
      { title: "Documents — NEXORA AI CAMPUSOS" },
      { name: "description", content: "Manage your application documents" },
    ],
  }),
  component: () => (
    <ProtectedRoute>
      <RoleAppShell>
        <ApplicantDocuments />
      </RoleAppShell>
    </ProtectedRoute>
  ),
});
