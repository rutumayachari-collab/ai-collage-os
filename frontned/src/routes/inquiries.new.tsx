import { createFileRoute } from "@tanstack/react-router";
import { ProtectedRoute } from "@/app/guards/ProtectedRoute";
import { DashboardShell } from "@/app/components/dashboard/DashboardShell";
import { InquiryForm } from "@/app/pages/inquiries/InquiryForm";

export const Route = createFileRoute("/inquiries/new")({
  head: () => ({
    meta: [
      { title: "New Inquiry — NEXORA AI CAMPUSOS" },
      { name: "description", content: "Create a new inquiry" },
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
