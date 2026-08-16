"use client";

import { PageHeader } from "@/app/components/common/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "@tanstack/react-router";
import { useAuth } from "@/app/hooks/useAuth";
import { useApplicants } from "@/app/hooks/queries/useApplicants";
import { useDocumentsByApplicant } from "@/app/hooks/queries/useDocuments";
import { useAdmissionByApplicant } from "@/app/hooks/queries/useAdmissions";
import {
  HiOutlineDocumentText,
  HiOutlineCheckCircle,
  HiOutlineAcademicCap,
  HiOutlineCurrencyRupee,
  HiOutlineBell,
  HiOutlineClock,
  HiOutlineUserGroup,
} from "react-icons/hi2";
import { toast } from "sonner";

const STAGES = [
  { key: "NEW", label: "Registered", icon: HiOutlineUserGroup },
  { key: "DOCUMENTS_VERIFIED", label: "Documents Verified", icon: HiOutlineCheckCircle },
  { key: "ELIGIBLE", label: "Eligible", icon: HiOutlineAcademicCap },
  { key: "INTERVIEW_SCHEDULED", label: "Interview Scheduled", icon: HiOutlineClock },
  { key: "INTERVIEWED", label: "Interviewed", icon: HiOutlineCheckCircle },
  { key: "SELECTED", label: "Selected", icon: HiOutlineCheckCircle },
  { key: "OFFERED", label: "Offer Letter", icon: HiOutlineDocumentText },
  { key: "ADMITTED", label: "Admission Confirmed", icon: HiOutlineCheckCircle },
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

export function ApplicantDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { data: applicants = [], isLoading, error } = useApplicants({ search: user?.email || "" });
  const applicant = applicants[0];
  const { data: documents = [] } = useDocumentsByApplicant(applicant?.id || "");
  const { data: admission } = useAdmissionByApplicant(applicant?.id || "");

  if (error) {
    toast.error("Unable to load application data.");
  }

  const pendingDocuments = documents.filter(
    (d) => d.status === "PENDING" || d.status === "REJECTED" || d.status === "EXPIRED",
  );
  const verifiedDocuments = documents.filter((d) => d.status === "VERIFIED");

  const currentStageIndex = applicant
    ? STAGES.findIndex((s) => s.key === applicant.status)
    : -1;

  const checklist = applicant?.admissionChecklist;
  const completedSteps = checklist
    ? Object.values(checklist).filter(Boolean).length
    : 0;
  const totalSteps = Object.keys(checklist || {}).length;
  const progressPercent = totalSteps > 0 ? Math.round((completedSteps / totalSteps) * 100) : 0;

  let nextAction: { label: string; description: string; route: string } | null = null;

  if (!applicant) {
    nextAction = {
      label: "Submit Application",
      description: "Start your admission application",
      route: "/inquiries/new",
    };
  } else if (pendingDocuments.length > 0) {
    nextAction = {
      label: "Upload Documents",
      description: `You have ${pendingDocuments.length} document(s) pending`,
      route: "/documents/upload",
    };
  } else if (applicant.status === "NEW" || applicant.status === "DOCUMENTS_VERIFIED") {
    nextAction = {
      label: "Complete Application",
      description: "Your application is being processed",
      route: "/applicant/application",
    };
  } else if (applicant.status === "ELIGIBLE") {
    nextAction = {
      label: "Interview",
      description: "Eligibility check passed. Await interview.",
      route: "/applicant/eligibility",
    };
  } else if (applicant.status === "INTERVIEW_SCHEDULED" || applicant.status === "INTERVIEWED") {
    nextAction = {
      label: "View Interview Status",
      description: "Check your interview details",
      route: "/applicant/eligibility",
    };
  } else if (applicant.status === "SELECTED" || applicant.status === "OFFERED") {
    nextAction = {
      label: "View Offer Letter",
      description: "Your offer letter is available",
      route: "/applicant/offer-letter",
    };
  } else if (admission && admission.status === "PENDING") {
    nextAction = {
      label: "Complete Payment",
      description: "Pay admission fee to confirm seat",
      route: "/applicant/payment",
    };
  } else if (admission?.status === "CONFIRMED" || applicant.status === "ADMITTED") {
    nextAction = {
      label: "Student Portal",
      description: "Admission confirmed. Access student portal.",
      route: "/student/dashboard",
    };
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Admission Dashboard"
        description={`Welcome, ${user?.fullName || "Applicant"}`}
      />

      {!applicant ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <HiOutlineUserGroup className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-lg font-medium">No Application Found</p>
            <p className="text-sm text-muted-foreground mb-4">You haven't submitted an application yet.</p>
            <Button onClick={() => navigate({ to: "/student/application/new" })}>Start Application</Button>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Application Number</CardTitle>
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
                <CardTitle className="text-sm font-medium">Documents</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">{verifiedDocuments.length}/{documents.length}</p>
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
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Application Progress</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Completion</span>
                  <span className="text-sm text-muted-foreground">{progressPercent}%</span>
                </div>
                <div className="h-2 w-full rounded-full bg-secondary">
                  <div
                    className="h-2 rounded-full bg-primary transition-all"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
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
              </div>
            </CardContent>
          </Card>

          {pendingDocuments.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Pending Documents</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {pendingDocuments.map((doc) => (
                    <li key={doc.id} className="flex items-center gap-2 text-sm">
                      <HiOutlineDocumentText className="h-4 w-4 text-amber-500" />
                      {doc.name}
                      <Badge variant="outline" className="ml-auto">{doc.status}</Badge>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {nextAction && (
            <Card>
              <CardHeader>
                <CardTitle>Next Required Action</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{nextAction.label}</p>
                    <p className="text-sm text-muted-foreground">{nextAction.description}</p>
                  </div>
                  <Button onClick={() => navigate({ to: nextAction!.route })}>
                    {nextAction.label}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
}
