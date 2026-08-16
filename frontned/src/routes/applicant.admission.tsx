import { createFileRoute } from "@tanstack/react-router";
import { ProtectedRoute } from "@/app/guards/ProtectedRoute";
import { RoleAppShell } from "@/app/components/layout/RoleAppShell";
import { ApplicantAdmission } from "@/app/pages/role/ApplicantAdmission";

export const Route = createFileRoute("/applicant/admission")({
  head: () => ({
    meta: [
      { title: "Admission Status — NEXORA AI CAMPUSOS" },
      { name: "description", content: "Track your admission status" },
    ],
  }),
  component: () => (
    <ProtectedRoute>
      <RoleAppShell>
        <ApplicantAdmission />
      </RoleAppShell>
    </ProtectedRoute>
  ),
});
