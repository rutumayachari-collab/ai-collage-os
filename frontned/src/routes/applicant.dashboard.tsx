import { createFileRoute } from "@tanstack/react-router";
import { ProtectedRoute } from "@/app/guards/ProtectedRoute";
import { RoleAppShell } from "@/app/components/layout/RoleAppShell";
import { ApplicantDashboard } from "@/app/pages/role/ApplicantDashboard";

export const Route = createFileRoute("/applicant/dashboard")({
  head: () => ({
    meta: [
      { title: "Applicant Dashboard — NEXORA AI CAMPUSOS" },
      { name: "description", content: "Applicant dashboard" },
    ],
  }),
  component: () => (
    <ProtectedRoute>
      <RoleAppShell>
        <ApplicantDashboard />
      </RoleAppShell>
    </ProtectedRoute>
  ),
});
