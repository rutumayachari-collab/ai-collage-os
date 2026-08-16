import { createFileRoute } from "@tanstack/react-router";
import { ProtectedRoute } from "@/app/guards/ProtectedRoute";
import { RoleAppShell } from "@/app/components/layout/RoleAppShell";
import { ApplicantEligibility } from "@/app/pages/role/ApplicantEligibility";

export const Route = createFileRoute("/applicant/eligibility")({
  head: () => ({
    meta: [
      { title: "Eligibility — NEXORA AI CAMPUSOS" },
      { name: "description", content: "Check your eligibility status" },
    ],
  }),
  component: () => (
    <ProtectedRoute>
      <RoleAppShell>
        <ApplicantEligibility />
      </RoleAppShell>
    </ProtectedRoute>
  ),
});
