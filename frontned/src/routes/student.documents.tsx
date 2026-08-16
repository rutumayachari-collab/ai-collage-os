import { createFileRoute } from "@tanstack/react-router";
import { ProtectedRoute } from "@/app/guards/ProtectedRoute";
import { RoleAppShell } from "@/app/components/layout/RoleAppShell";
import { StudentDocuments } from "@/app/pages/role/StudentDocuments";

export const Route = createFileRoute("/student/documents")({
  head: () => ({
    meta: [
      { title: "Documents — NEXORA AI CAMPUSOS" },
      { name: "description", content: "Manage your student documents" },
    ],
  }),
  component: () => (
    <ProtectedRoute>
      <RoleAppShell>
        <StudentDocuments />
      </RoleAppShell>
    </ProtectedRoute>
  ),
});
