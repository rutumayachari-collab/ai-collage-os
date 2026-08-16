import { createFileRoute } from "@tanstack/react-router";
import { ProtectedRoute } from "@/app/guards/ProtectedRoute";
import { RoleAppShell } from "@/app/components/layout/RoleAppShell";
import { ApplicantHistory } from "@/app/pages/role/ApplicantHistory";

export const Route = createFileRoute("/applicant/history")({
  head: () => ({
    meta: [
      { title: "Application History — NEXORA AI CAMPUSOS" },
      { name: "description", content: "View your application history" },
    ],
  }),
  component: () => (
    <ProtectedRoute>
      <RoleAppShell>
        <ApplicantHistory />
      </RoleAppShell>
    </ProtectedRoute>
  ),
});
