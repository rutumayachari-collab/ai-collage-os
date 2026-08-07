import { createFileRoute } from "@tanstack/react-router";
import { ProtectedRoute } from "@/app/guards/ProtectedRoute";
import { DashboardShell } from "@/app/components/dashboard/DashboardShell";
import { AdmissionQueue } from "@/app/pages/faculty/AdmissionQueue";

export const Route = createFileRoute("/faculty/admissions")({
  head: () => ({
    meta: [
      { title: "Admission Queue — AI-CollegeOS" },
      { name: "description", content: "Review admissions" },
    ],
  }),
  component: () => (
    <ProtectedRoute>
      <DashboardShell>
        <AdmissionQueue />
      </DashboardShell>
    </ProtectedRoute>
  ),
});
