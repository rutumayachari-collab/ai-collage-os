import { createFileRoute } from "@tanstack/react-router";
import { ProtectedRoute } from "@/app/guards/ProtectedRoute";
import { RoleAppShell } from "@/app/components/layout/RoleAppShell";
import { CounsellorLeads } from "@/app/pages/role/CounsellorLeads";

export const Route = createFileRoute("/counsellor/leads")({
  head: () => ({
    meta: [
      { title: "Leads — NEXORA AI CAMPUSOS" },
      { name: "description", content: "Manage your leads" },
    ],
  }),
  component: () => (
    <ProtectedRoute>
      <RoleAppShell>
        <CounsellorLeads />
      </RoleAppShell>
    </ProtectedRoute>
  ),
});
