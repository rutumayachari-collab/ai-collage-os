import { createFileRoute } from "@tanstack/react-router";
import { ProtectedRoute } from "@/app/guards/ProtectedRoute";
import { RoleAppShell } from "@/app/components/layout/RoleAppShell";
import { AdminApplicants } from "@/app/pages/role/AdminApplicants";

export const Route = createFileRoute("/admin/applicants")({
  head: () => ({
    meta: [
      { title: "Applicants — NEXORA AI CAMPUSOS" },
      { name: "description", content: "Manage all applications" },
    ],
  }),
  component: () => (
    <ProtectedRoute>
      <RoleAppShell>
        <AdminApplicants />
      </RoleAppShell>
    </ProtectedRoute>
  ),
});
