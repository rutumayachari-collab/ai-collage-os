import { createFileRoute } from "@tanstack/react-router";
import { ProtectedRoute } from "@/app/guards/ProtectedRoute";
import { RoleAppShell } from "@/app/components/layout/RoleAppShell";
import { ApplicantScholarships } from "@/app/pages/role/ApplicantScholarships";

export const Route = createFileRoute("/applicant/scholarships")({
  head: () => ({
    meta: [
      { title: "Scholarships — NEXORA AI CAMPUSOS" },
      { name: "description", content: "Explore available scholarships" },
    ],
  }),
  component: () => (
    <ProtectedRoute>
      <RoleAppShell>
        <ApplicantScholarships />
      </RoleAppShell>
    </ProtectedRoute>
  ),
});
