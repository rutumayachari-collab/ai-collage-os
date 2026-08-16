import { createFileRoute } from "@tanstack/react-router";
import { ProtectedRoute } from "@/app/guards/ProtectedRoute";
import { RoleAppShell } from "@/app/components/layout/RoleAppShell";
import { AdminCounsellors } from "@/app/pages/role/AdminCounsellors";

export const Route = createFileRoute("/admin/counsellors")({
  head: () => ({
    meta: [
      { title: "Counsellors — NEXORA AI CAMPUSOS" },
      { name: "description", content: "Manage counsellors" },
    ],
  }),
  component: () => (
    <ProtectedRoute>
      <RoleAppShell>
        <AdminCounsellors />
      </RoleAppShell>
    </ProtectedRoute>
  ),
});
