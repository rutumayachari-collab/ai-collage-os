"use client";

import { PageHeader } from "@/app/components/common/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "@tanstack/react-router";
import { useAuth } from "@/app/hooks/useAuth";
import { useApplicants } from "@/app/hooks/queries/useApplicants";
import { useApplicantFeeSummary } from "@/app/hooks/queries/useApplicants";
import { useApplicantInterview } from "@/app/hooks/queries/useApplicants";
import { useApplicantOfferLetter } from "@/app/hooks/queries/useApplicants";
import { useApplicantTimeline } from "@/app/hooks/queries/useApplicants";
import {
  HiOutlineCheckCircle,
  HiOutlineClock,
  HiOutlineAcademicCap,
  HiOutlineCurrencyRupee,
} from "react-icons/hi2";
import { toast } from "sonner";

function getStatusVariant(status?: string): "default" | "secondary" | "destructive" | "outline" {
  switch (status) {
    case "ADMITTED":
    case "PAID":
    case "ACCEPTED":
      return "default";
    case "REJECTED":
    case "CANCELLED":
    case "REFUNDED":
      return "destructive";
    default:
      return "secondary";
  }
}

export function ApplicantAdmission() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { data: applicants = [], isLoading, error } = useApplicants({ search: user?.email || "" });
  const applicant = applicants[0];
  const { data: feeSummary } = useApplicantFeeSummary(applicant?.id || "");
  const { data: interview } = useApplicantInterview(applicant?.id || "");
  const { data: offerLetter } = useApplicantOfferLetter(applicant?.id || "");
  const { data: timeline = [] } = useApplicantTimeline(applicant?.id || "");

  if (error) {
    toast.error("Unable to load admission data.");
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
        <PageHeader title="Admission Status" description="Track your admission progress" />
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <HiOutlineAcademicCap className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-lg font-medium">No Application Found</p>
            <p className="text-sm text-muted-foreground">Submit an application to track admission status.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Admission Status"
        description="Track your admission progress"
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Application Status</CardTitle>
          </CardHeader>
          <CardContent>
            <Badge variant={getStatusVariant(applicant.status)}>{applicant.status.replace(/_/g, " ")}</Badge>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Payment Status</CardTitle>
          </CardHeader>
          <CardContent>
            <Badge variant={getStatusVariant(feeSummary?.paymentStatus)}>
              {feeSummary?.paymentStatus || "Pending"}
            </Badge>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Interview</CardTitle>
          </CardHeader>
          <CardContent>
            <Badge variant={interview ? "default" : "secondary"}>
              {interview ? (interview.recommendation || "Scheduled") : "Not Scheduled"}
            </Badge>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Offer Letter</CardTitle>
          </CardHeader>
          <CardContent>
            <Badge variant={offerLetter?.status === "ACCEPTED" ? "default" : offerLetter ? "secondary" : "outline"}>
              {offerLetter?.status || "Not Generated"}
            </Badge>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Fee Summary</CardTitle>
        </CardHeader>
        <CardContent>
          {feeSummary ? (
            <div className="grid gap-4 sm:grid-cols-3">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Fee</p>
                <p className="text-2xl font-bold">₹{feeSummary.totalFee?.toLocaleString() || "0"}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Paid Amount</p>
                <p className="text-2xl font-bold text-emerald-600">₹{feeSummary.paidAmount?.toLocaleString() || "0"}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Pending Amount</p>
                <p className="text-2xl font-bold text-amber-600">₹{feeSummary.pendingAmount?.toLocaleString() || "0"}</p>
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Fee summary not available yet.</p>
          )}
        </CardContent>
      </Card>

      {interview && (
        <Card>
          <CardHeader>
            <CardTitle>Interview Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Scheduled At</p>
                <p className="text-base">{interview.scheduledAt ? new Date(interview.scheduledAt).toLocaleString() : "N/A"}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Recommendation</p>
                <Badge variant={interview.recommendation === "RECOMMENDED" ? "default" : "secondary"}>
                  {interview.recommendation || "PENDING"}
                </Badge>
              </div>
              {interview.score !== undefined && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Score</p>
                  <p className="text-base">{interview.score}/100</p>
                </div>
              )}
              {interview.panelMembers && interview.panelMembers.length > 0 && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Panel Members</p>
                  <p className="text-base">{interview.panelMembers.join(", ")}</p>
                </div>
              )}
            </div>
            {interview.remarks && (
              <div>
                <p className="text-sm font-medium text-muted-foreground">Remarks</p>
                <p className="text-base">{interview.remarks}</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {offerLetter && (
        <Card>
          <CardHeader>
            <CardTitle>Offer Letter</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Status</p>
                <Badge variant={getStatusVariant(offerLetter.status)}>{offerLetter.status}</Badge>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Generated At</p>
                <p className="text-base">{offerLetter.generatedAt ? new Date(offerLetter.generatedAt).toLocaleDateString() : "N/A"}</p>
              </div>
              {offerLetter.validUntil && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Valid Until</p>
                  <p className="text-base">{new Date(offerLetter.validUntil).toLocaleDateString()}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {timeline.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Admission Timeline</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {timeline.slice(-5).reverse().map((event) => (
                <li key={event.eventId} className="flex items-start gap-3 text-sm">
                  <HiOutlineClock className="h-4 w-4 text-muted-foreground mt-0.5" />
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

      <div className="flex gap-2">
        <Button variant="outline" onClick={() => navigate({ to: "/applicant/application" })}>
          View Application
        </Button>
        <Button variant="outline" onClick={() => navigate({ to: "/applicant/eligibility" })}>
          View Eligibility
        </Button>
      </div>
    </div>
  );
}
