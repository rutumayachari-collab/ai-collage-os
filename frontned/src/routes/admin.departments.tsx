import { createFileRoute } from "@tanstack/react-router";
import { ProtectedRoute } from "@/app/guards/ProtectedRoute";
import { RoleAppShell } from "@/app/components/layout/RoleAppShell";
import { AdminDepartments } from "@/app/pages/role/AdminDepartments";

export const Route = createFileRoute("/admin/departments")({
  head: () => ({
    meta: [
      { title: "Departments — NEXORA AI CAMPUSOS" },
      { name: "description", content: "Manage departments" },
    ],
  }),
  component: () => (
    <ProtectedRoute>
      <RoleAppShell>
        <AdminDepartments />
      </RoleAppShell>
    </ProtectedRoute>
  ),
});
