import { createFileRoute } from "@tanstack/react-router";
import { ProtectedRoute } from "@/app/guards/ProtectedRoute";
import { RoleAppShell } from "@/app/components/layout/RoleAppShell";
import { AdminDocuments } from "@/app/pages/role/AdminDocuments";

export const Route = createFileRoute("/admin/documents")({
  head: () => ({
    meta: [
      { title: "Documents — NEXORA AI CAMPUSOS" },
      { name: "description", content: "Document verifications" },
    ],
  }),
  component: () => (
    <ProtectedRoute>
      <RoleAppShell>
        <AdminDocuments />
      </RoleAppShell>
    </ProtectedRoute>
  ),
});
