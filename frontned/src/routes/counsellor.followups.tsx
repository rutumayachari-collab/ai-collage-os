import { createFileRoute } from "@tanstack/react-router";
import { ProtectedRoute } from "@/app/guards/ProtectedRoute";
import { RoleAppShell } from "@/app/components/layout/RoleAppShell";
import { CounsellorFollowups } from "@/app/pages/role/CounsellorFollowups";

export const Route = createFileRoute("/counsellor/followups")({
  head: () => ({
    meta: [
      { title: "Follow-ups — NEXORA AI CAMPUSOS" },
      { name: "description", content: "Manage your follow-up schedule" },
    ],
  }),
  component: () => (
    <ProtectedRoute>
      <RoleAppShell>
        <CounsellorFollowups />
      </RoleAppShell>
    </ProtectedRoute>
  ),
});
