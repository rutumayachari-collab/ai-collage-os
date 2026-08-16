"use client";

import { PageHeader } from "@/app/components/common/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "@tanstack/react-router";
import { useAuth } from "@/app/hooks/useAuth";
import { useApplicants } from "@/app/hooks/queries/useApplicants";
import { useAdmissionByApplicant } from "@/app/hooks/queries/useAdmissions";
import { useApplicantFeeSummary } from "@/app/hooks/queries/useApplicants";
import { useApplicantTimeline } from "@/app/hooks/queries/useApplicants";
import {
  HiOutlineDocumentText,
  HiOutlineCheckCircle,
  HiOutlineAcademicCap,
  HiOutlineCurrencyRupee,
  HiOutlineUserGroup,
  HiOutlineBell,
  HiOutlineClock,
} from "react-icons/hi2";
import { toast } from "sonner";

const STAGES = [
  { key: "NEW", label: "Registered" },
  { key: "DOCUMENTS_VERIFIED", label: "Documents Verified" },
  { key: "ELIGIBLE", label: "Eligible" },
  { key: "INTERVIEW_SCHEDULED", label: "Interview Scheduled" },
  { key: "INTERVIEWED", label: "Interviewed" },
  { key: "SELECTED", label: "Selected" },
  { key: "OFFERED", label: "Offer Letter" },
  { key: "ADMITTED", label: "Admission Confirmed" },
];

function getStatusVariant(status?: string): "default" | "secondary" | "destructive" | "outline" {
  switch (status) {
    case "ADMITTED":
      return "default";
    case "REJECTED":
      return "destructive";
    case "OFFERED":
    case "SELECTED":
      return "default";
    default:
      return "secondary";
  }
}

export function ApplicantApplication() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { data: applicants = [], isLoading, error } = useApplicants({ search: user?.email || "" });
  const applicant = applicants[0];
  const { data: admission } = useAdmissionByApplicant(applicant?.id || "");
  const { data: feeSummary } = useApplicantFeeSummary(applicant?.id || "");
  const { data: timeline = [] } = useApplicantTimeline(applicant?.id || "");

  if (error) {
    toast.error("Unable to load application.");
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!applicant) {
    return (
      <div className="space-y-6">
        <PageHeader title="My Application" description="View and manage your application" />
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <HiOutlineDocumentText className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-lg font-medium">No Application Found</p>
            <p className="text-sm text-muted-foreground mb-4">You haven't submitted an application yet.</p>
            <Button onClick={() => navigate({ to: "/student/application/new" })}>Start Application</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const currentStageIndex = STAGES.findIndex((s) => s.key === applicant.status);

  return (
    <div className="space-y-6">
      <PageHeader title="My Application" description="View and manage your application" />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Application ID</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{applicant.applicationNumber || "N/A"}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Status</CardTitle>
          </CardHeader>
          <CardContent>
            <Badge variant={getStatusVariant(applicant.status)}>{applicant.status.replace(/_/g, " ")}</Badge>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Admission</CardTitle>
          </CardHeader>
          <CardContent>
            <Badge variant={admission ? "default" : "secondary"}>
              {admission?.status || "Pending"}
            </Badge>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Payment Status</CardTitle>
          </CardHeader>
          <CardContent>
            <Badge variant={feeSummary?.paymentStatus === "PAID" ? "default" : "secondary"}>
              {feeSummary?.paymentStatus || "Pending"}
            </Badge>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Application Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Full Name</p>
              <p className="text-base">{applicant.fullName || `${applicant.firstName} ${applicant.lastName}`}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Email</p>
              <p className="text-base">{applicant.email}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Phone</p>
              <p className="text-base">{applicant.phone}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Date of Birth</p>
              <p className="text-base">{applicant.dateOfBirth ? new Date(applicant.dateOfBirth).toLocaleDateString() : "N/A"}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Gender</p>
              <p className="text-base">{applicant.gender || "N/A"}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Qualification</p>
              <p className="text-base">{applicant.qualification || "N/A"}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Board / University</p>
              <p className="text-base">{applicant.boardOrUniversity || "N/A"}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Passing Year</p>
              <p className="text-base">{applicant.passingYear || "N/A"}</p>
            </div>
            <div className="sm:col-span-2">
              <p className="text-sm font-medium text-muted-foreground">Address</p>
              <p className="text-base">{applicant.address || "N/A"}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Application Progress</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2">
            {STAGES.map((stage, index) => {
              const isCompleted = index <= currentStageIndex;
              const isCurrent = index === currentStageIndex;
              return (
                <div
                  key={stage.key}
                  className={`flex items-center gap-2 ${isCompleted ? "text-foreground" : "text-muted-foreground"}`}
                >
                  {isCompleted ? (
                    <HiOutlineCheckCircle className="h-5 w-5 text-emerald-500" />
                  ) : (
                    <HiOutlineClock className="h-5 w-5 text-amber-500" />
                  )}
                  <span className="text-sm">{stage.label}</span>
                  {isCurrent && <Badge variant="outline" className="ml-auto">Current</Badge>}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {timeline.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {timeline.slice(-5).reverse().map((event) => (
                <li key={event.eventId} className="flex items-start gap-3 text-sm">
                  <HiOutlineBell className="h-4 w-4 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="font-medium">{event.description}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(event.createdAt).toLocaleString()} — {event.performedBy}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
