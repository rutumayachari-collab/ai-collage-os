import { createFileRoute } from "@tanstack/react-router";
import { ProtectedRoute } from "@/app/guards/ProtectedRoute";
import { RoleAppShell } from "@/app/components/layout/RoleAppShell";
import { AdminCalling } from "@/app/pages/role/AdminCalling";

export const Route = createFileRoute("/admin/calling")({
  head: () => ({
    meta: [
      { title: "Calling Management — NEXORA AI CAMPUSOS" },
      { name: "description", content: "Admin calling management" },
    ],
  }),
  component: () => (
    <ProtectedRoute>
      <RoleAppShell>
        <AdminCalling />
      </RoleAppShell>
    </ProtectedRoute>
  ),
});
