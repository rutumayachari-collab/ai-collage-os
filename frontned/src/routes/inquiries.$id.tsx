import { createFileRoute } from "@tanstack/react-router";
import { ProtectedRoute } from "@/app/guards/ProtectedRoute";
import { DashboardShell } from "@/app/components/dashboard/DashboardShell";
import { InquiryDetail } from "@/app/pages/inquiries/InquiryDetail";

export const Route = createFileRoute("/inquiries/$id")({
  head: () => ({
    meta: [
      { title: "Inquiry Details — AI-CollegeOS" },
      { name: "description", content: "View inquiry details" },
    ],
  }),
  component: () => (
    <ProtectedRoute>
      <DashboardShell>
        <InquiryDetail />
      </DashboardShell>
    </ProtectedRoute>
  ),
});
