import { createFileRoute } from "@tanstack/react-router";
import { ProtectedRoute } from "@/app/guards/ProtectedRoute";
import { DashboardShell } from "@/app/components/dashboard/DashboardShell";
import { ApplicantForm } from "@/app/pages/applicants/ApplicantForm";

export const Route = createFileRoute("/applicants/new")({
  head: () => ({
    meta: [
      { title: "New Applicant — AI-CollegeOS" },
      { name: "description", content: "Create a new applicant" },
    ],
  }),
  component: () => (
    <ProtectedRoute>
      <DashboardShell>
        <ApplicantForm />
      </DashboardShell>
    </ProtectedRoute>
  ),
});
