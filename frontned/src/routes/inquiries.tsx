import { createFileRoute } from "@tanstack/react-router";
import { ProtectedRoute } from "@/app/guards/ProtectedRoute";
import { DashboardShell } from "@/app/components/dashboard/DashboardShell";
import { InquiryList } from "@/app/pages/inquiries/InquiryList";

export const Route = createFileRoute("/inquiries")({
  head: () => ({
    meta: [
      { title: "Inquiries — AI-CollegeOS" },
      { name: "description", content: "Manage student inquiries" },
    ],
  }),
  component: () => (
    <ProtectedRoute>
      <DashboardShell>
        <InquiryList />
      </DashboardShell>
    </ProtectedRoute>
  ),
});
