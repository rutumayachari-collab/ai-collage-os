import { createFileRoute } from "@tanstack/react-router";
import { ProtectedRoute } from "@/app/guards/ProtectedRoute";
import { RoleAppShell } from "@/app/components/layout/RoleAppShell";
import { ApplicantApplication } from "@/app/pages/role/ApplicantApplication";

export const Route = createFileRoute("/applicant/application")({
  head: () => ({
    meta: [
      { title: "My Application — NEXORA AI CAMPUSOS" },
      { name: "description", content: "View and manage your application" },
    ],
  }),
  component: () => (
    <ProtectedRoute>
      <RoleAppShell>
        <ApplicantApplication />
      </RoleAppShell>
    </ProtectedRoute>
  ),
});
