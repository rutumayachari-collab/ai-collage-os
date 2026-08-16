import { createFileRoute } from "@tanstack/react-router";
import { ProtectedRoute } from "@/app/guards/ProtectedRoute";
import { RoleAppShell } from "@/app/components/layout/RoleAppShell";
import { ApplicantProfile } from "@/app/pages/role/ApplicantProfile";

export const Route = createFileRoute("/applicant/profile")({
  head: () => ({
    meta: [
      { title: "My Profile — NEXORA AI CAMPUSOS" },
      { name: "description", content: "Manage your profile" },
    ],
  }),
  component: () => (
    <ProtectedRoute>
      <RoleAppShell>
        <ApplicantProfile />
      </RoleAppShell>
    </ProtectedRoute>
  ),
});
