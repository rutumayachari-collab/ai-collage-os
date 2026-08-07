import { createFileRoute } from "@tanstack/react-router";
import { ProtectedRoute } from "@/app/guards/ProtectedRoute";
import { DashboardShell } from "@/app/components/dashboard/DashboardShell";
import { InquiryForm } from "@/app/pages/inquiries/InquiryForm";

export const Route = createFileRoute("/inquiries/$id/edit")({
  head: () => ({
    meta: [
      { title: "Edit Inquiry — AI-CollegeOS" },
      { name: "description", content: "Edit inquiry details" },
    ],
  }),
  component: () => (
    <ProtectedRoute>
      <DashboardShell>
        <InquiryForm />
      </DashboardShell>
    </ProtectedRoute>
  ),
});
