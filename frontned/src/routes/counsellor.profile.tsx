import { createFileRoute } from "@tanstack/react-router";
import { ProtectedRoute } from "@/app/guards/ProtectedRoute";
import { RoleAppShell } from "@/app/components/layout/RoleAppShell";
import { CounsellorProfile } from "@/app/pages/role/CounsellorProfile";

export const Route = createFileRoute("/counsellor/profile")({
  head: () => ({
    meta: [
      { title: "My Profile — NEXORA AI CAMPUSOS" },
      { name: "description", content: "Manage your counsellor profile" },
    ],
  }),
  component: () => (
    <ProtectedRoute>
      <RoleAppShell>
        <CounsellorProfile />
      </RoleAppShell>
    </ProtectedRoute>
  ),
});
