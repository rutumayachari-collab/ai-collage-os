import { createFileRoute } from "@tanstack/react-router";
import { ProtectedRoute } from "@/app/guards/ProtectedRoute";
import { RoleAppShell } from "@/app/components/layout/RoleAppShell";
import { ApplicantCounsellor } from "@/app/pages/role/ApplicantCounsellor";

export const Route = createFileRoute("/applicant/counsellor")({
  head: () => ({
    meta: [
      { title: "My Counsellor — NEXORA AI CAMPUSOS" },
      { name: "description", content: "View your assigned counsellor details" },
    ],
  }),
  component: () => (
    <ProtectedRoute>
      <RoleAppShell>
        <ApplicantCounsellor />
      </RoleAppShell>
    </ProtectedRoute>
  ),
});
