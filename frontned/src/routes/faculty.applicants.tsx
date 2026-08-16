import { createFileRoute } from "@tanstack/react-router";
import { ProtectedRoute } from "@/app/guards/ProtectedRoute";
import { DashboardShell } from "@/app/components/dashboard/DashboardShell";
import { ApplicantReviewQueue } from "@/app/pages/faculty/ApplicantReviewQueue";

export const Route = createFileRoute("/faculty/applicants")({
  head: () => ({
    meta: [
      { title: "Applicant Review Queue — NEXORA AI CAMPUSOS" },
      { name: "description", content: "Review applicants" },
    ],
  }),
  component: () => (
    <ProtectedRoute>
      <DashboardShell>
        <ApplicantReviewQueue />
      </DashboardShell>
    </ProtectedRoute>
  ),
});
