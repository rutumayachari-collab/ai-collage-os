import { createFileRoute } from "@tanstack/react-router";
import { ProtectedRoute } from "@/app/guards/ProtectedRoute";
import { DashboardShell } from "@/app/components/dashboard/DashboardShell";
import { ApplicantDetail } from "@/app/pages/applicants/ApplicantDetail";

export const Route = createFileRoute("/applicants/$id")({
  head: () => ({
    meta: [
      { title: "Applicant Details — AI-CollegeOS" },
      { name: "description", content: "View applicant details" },
    ],
  }),
  component: () => (
    <ProtectedRoute>
      <DashboardShell>
        <ApplicantDetail />
      </DashboardShell>
    </ProtectedRoute>
  ),
});
