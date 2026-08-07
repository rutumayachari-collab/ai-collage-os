import { createFileRoute } from "@tanstack/react-router";
import { ProtectedRoute } from "@/app/guards/ProtectedRoute";
import { DashboardShell } from "@/app/components/dashboard/DashboardShell";
import { AdmissionStatus } from "@/app/pages/admissions/AdmissionStatus";

export const Route = createFileRoute("/admissions/$id")({
  head: () => ({
    meta: [
      { title: "Admission Status — AI-CollegeOS" },
      { name: "description", content: "View admission status" },
    ],
  }),
  component: () => (
    <ProtectedRoute>
      <DashboardShell>
        <AdmissionStatus />
      </DashboardShell>
    </ProtectedRoute>
  ),
});
