import { createFileRoute } from "@tanstack/react-router";
import { ProtectedRoute } from "@/app/guards/ProtectedRoute";
import { RoleAppShell } from "@/app/components/layout/RoleAppShell";
import { ApplicantHelp } from "@/app/pages/role/ApplicantHelp";

export const Route = createFileRoute("/applicant/help")({
  head: () => ({
    meta: [
      { title: "Help & Support — NEXORA AI CAMPUSOS" },
      { name: "description", content: "Get help and support" },
    ],
  }),
  component: () => (
    <ProtectedRoute>
      <RoleAppShell>
        <ApplicantHelp />
      </RoleAppShell>
    </ProtectedRoute>
  ),
});
