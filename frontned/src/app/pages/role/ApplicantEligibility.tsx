"use client";

import { PageHeader } from "@/app/components/common/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "@tanstack/react-router";
import { useAuth } from "@/app/hooks/useAuth";
import { useApplicants } from "@/app/hooks/queries/useApplicants";
import { HiOutlineCheckCircle, HiOutlineXCircle, HiOutlineAcademicCap } from "react-icons/hi2";
import { toast } from "sonner";

export function ApplicantEligibility() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { data: applicants = [], isLoading, error } = useApplicants({ search: user?.email || "" });
  const applicant = applicants[0];

  if (error) {
    toast.error("Unable to load application data.");
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
        <PageHeader title="Eligibility" description="Check your eligibility status" />
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <HiOutlineAcademicCap className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-lg font-medium">No Application Found</p>
            <p className="text-sm text-muted-foreground">
              Submit an application to check eligibility.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const aiScore = applicant.aiEligibilityScore;
  const hasScore = aiScore !== undefined && aiScore !== null;
  const isEligible = hasScore && aiScore >= 60;
  const docsVerified = applicant.admissionChecklist?.documentsVerified;

  return (
    <div className="space-y-6">
      <PageHeader title="Eligibility" description="Check your eligibility status" />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">AI Eligibility Score</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{hasScore ? `${aiScore}/100` : "Not Available"}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Eligibility Status</CardTitle>
          </CardHeader>
          <CardContent>
            {hasScore ? (
              <Badge variant={isEligible ? "default" : "destructive"}>
                {isEligible ? "Eligible" : "Not Eligible"}
              </Badge>
            ) : (
              <Badge variant="outline">Pending Review</Badge>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Documents Verified</CardTitle>
          </CardHeader>
          <CardContent>
            <Badge variant={docsVerified ? "default" : "secondary"}>
              {docsVerified ? "Verified" : "Pending"}
            </Badge>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Application Status</CardTitle>
          </CardHeader>
          <CardContent>
            <Badge variant="outline">{applicant.status.replace(/_/g, " ")}</Badge>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Eligibility Details</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {hasScore ? (
              <div className="flex items-center gap-3">
                {isEligible ? (
                  <HiOutlineCheckCircle className="h-6 w-6 text-emerald-500" />
                ) : (
                  <HiOutlineXCircle className="h-6 w-6 text-red-500" />
                )}
                <div>
                  <p className="font-medium">
                    {isEligible
                      ? "You are eligible for admission"
                      : "You are not eligible for admission"}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {isEligible
                      ? "Your eligibility score meets the required threshold."
                      : "Your eligibility score does not meet the required threshold. Please contact the admission office for more details."}
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <HiOutlineAcademicCap className="h-6 w-6 text-amber-500" />
                <div>
                  <p className="font-medium">Eligibility check not yet performed</p>
                  <p className="text-sm text-muted-foreground">
                    The admission committee will review your application and update your eligibility
                    status.
                  </p>
                </div>
              </div>
            )}
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Application Number</p>
                <p className="text-base">{applicant.applicationNumber || "N/A"}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Preferred Course</p>
                <p className="text-base">{applicant.preferredCourseId || "N/A"}</p>
              </div>
            </div>
            {applicant.aiRecommendedNextAction && (
              <div>
                <p className="text-sm font-medium text-muted-foreground">Recommended Next Action</p>
                <p className="text-base">{applicant.aiRecommendedNextAction}</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="flex gap-2">
        <Button variant="outline" onClick={() => navigate({ to: "/applicant/documents" })}>
          View Documents
        </Button>
        <Button variant="outline" onClick={() => navigate({ to: "/applicant/application" })}>
          View Application
        </Button>
      </div>
    </div>
  );
}
