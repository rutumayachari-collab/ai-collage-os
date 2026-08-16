"use client";

import { PageHeader } from "@/app/components/common/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatCard } from "@/app/components/common/StatCard";
import { StatusBadge } from "@/app/components/common/StatusBadge";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/app/hooks/useAuth";
import { useApplicants } from "@/app/hooks/queries/useApplicants";
import { useDocumentsByApplicant } from "@/app/hooks/queries/useDocuments";
import { useAdmissionByApplicant } from "@/app/hooks/queries/useAdmissions";
import { useApplicantTimeline } from "@/app/hooks/queries/useApplicants";
import { useNavigate } from "@tanstack/react-router";
import {
  HiOutlineDocumentText,
  HiOutlineCheckCircle,
  HiOutlineAcademicCap,
  HiOutlineCurrencyRupee,
} from "react-icons/hi2";
import { toast } from "sonner";

export function StudentDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { data: applicants = [], isLoading, error } = useApplicants({ search: user?.email || "" });
  const applicant = applicants[0];
  const { data: documents = [] } = useDocumentsByApplicant(applicant?.id || "");
  const { data: admission } = useAdmissionByApplicant(applicant?.id || "");
  const { data: timeline = [] } = useApplicantTimeline(applicant?.id || "");

  if (error) {
    toast.error("Unable to load dashboard data.");
  }

  const pendingDocuments = documents.filter(
    (d) => d.status === "PENDING" || d.status === "REJECTED" || d.status === "EXPIRED",
  );
  const verifiedDocuments = documents.filter((d) => d.status === "VERIFIED");

  const recentEvents = timeline.slice(-3).reverse();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Student Dashboard"
        description={`Welcome back, ${user?.fullName || "Student"}`}
      />

      {!applicant ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <HiOutlineAcademicCap className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-lg font-medium">No Application Found</p>
            <p className="text-sm text-muted-foreground mb-4">You haven't submitted an application yet.</p>
            <Button onClick={() => navigate({ to: "/student/application/new" })}>Start Application</Button>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard
              title="Application Status"
              value={admission?.status || applicant.status.replace(/_/g, " ")}
              description={`Application ${applicant.applicationNumber || "N/A"}`}
              icon={HiOutlineAcademicCap}
            />
            <StatCard
              title="Documents"
              value={`${verifiedDocuments.length}/${documents.length}`}
              description={
                pendingDocuments.length > 0 ? `${pendingDocuments.length} pending` : "All verified"
              }
              icon={HiOutlineDocumentText}
            />
            <StatCard
              title="Eligibility"
              value={applicant.aiEligibilityScore !== undefined ? `${applicant.aiEligibilityScore}/100` : "Pending"}
              description="AI eligibility score"
              icon={HiOutlineCheckCircle}
            />
            <StatCard
              title="Payment"
              value={admission?.status === "CONFIRMED" ? "Confirmed" : "Pending"}
              description="Admission fee status"
              icon={HiOutlineCurrencyRupee}
            />
          </div>

          {recentEvents.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {recentEvents.map((event) => (
                    <li key={event.eventId} className="flex items-start gap-3 text-sm">
                      <HiOutlineCheckCircle className="h-4 w-4 text-muted-foreground mt-0.5" />
                      <div>
                        <p className="font-medium">{event.description}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(event.createdAt).toLocaleString()}
                        </p>
                      </div>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
}
