import { createFileRoute } from "@tanstack/react-router";
import { ProtectedRoute } from "@/app/guards/ProtectedRoute";
import { DashboardShell } from "@/app/components/dashboard/DashboardShell";
import { ApplicantList } from "@/app/pages/applicants/ApplicantList";

export const Route = createFileRoute("/applicants")({
  head: () => ({
    meta: [
      { title: "Applicants — AI-CollegeOS" },
      { name: "description", content: "Manage student applications" },
    ],
  }),
  component: () => (
    <ProtectedRoute>
      <DashboardShell>
        <ApplicantList />
      </DashboardShell>
    </ProtectedRoute>
  ),
});
