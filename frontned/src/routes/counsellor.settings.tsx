import { createFileRoute } from "@tanstack/react-router";
import { ProtectedRoute } from "@/app/guards/ProtectedRoute";
import { RoleAppShell } from "@/app/components/layout/RoleAppShell";
import { CounsellorSettings } from "@/app/pages/role/CounsellorSettings";

export const Route = createFileRoute("/counsellor/settings")({
  head: () => ({
    meta: [
      { title: "Settings — NEXORA AI CAMPUSOS" },
      { name: "description", content: "Manage your account settings" },
    ],
  }),
  component: () => (
    <ProtectedRoute>
      <RoleAppShell>
        <CounsellorSettings />
      </RoleAppShell>
    </ProtectedRoute>
  ),
});
