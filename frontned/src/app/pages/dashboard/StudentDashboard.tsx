"use client";

import { PageHeader } from "@/app/components/common/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatCard } from "@/app/components/common/StatCard";
import { StatusBadge } from "@/app/components/common/StatusBadge";
import { DataTable } from "@/app/components/tables/DataTable";
import { Timeline } from "@/app/components/common/Timeline";
import { AIInsightCard } from "@/app/components/common/AIInsightCard";
import { Button } from "@/components/ui/button";
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
} from "react-icons/hi2";
import { type LucideIcon } from "lucide-react";

export function StudentDashboard() {
  const { user } = useAuth();
  const { data: applicants = [] } = useApplicants({ studentId: user?.id });
  const applicant = applicants[0];
  const { data: documents = [] } = useDocumentsByApplicant(applicant?.id || "");
  const { data: admission } = useAdmissionByApplicant(applicant?.id || "");

  const pendingDocuments = documents.filter(
    (d) => d.status === "PENDING" || d.status === "REJECTED",
  );
  const verifiedDocuments = documents.filter((d) => d.status === "VERIFIED");

  const notifications = [
    {
      id: "1",
      title: "Document verified",
      description: "Your marksheet has been verified",
      time: "2 hours ago",
    },
    {
      id: "2",
      title: "Application under review",
      description: "Your application is being reviewed",
      time: "1 day ago",
    },
    {
      id: "3",
      title: "Fee payment pending",
      description: "Application fee payment is pending",
      time: "3 days ago",
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Student Dashboard"
        description={`Welcome back, ${user?.firstName || "Student"}`}
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Application Status"
          value={admission?.status || "Not Started"}
          description={applicant ? `Applied for ${applicant.courseName}` : "No application yet"}
          icon={HiOutlineAcademicCap as LucideIcon}
        />
        <StatCard
          title="Documents"
          value={`${verifiedDocuments.length}/${documents.length}`}
          description={
            pendingDocuments.length > 0 ? `${pendingDocuments.length} pending` : "All verified"
          }
          icon={HiOutlineDocumentText as LucideIcon}
        />
        <StatCard
          title="Fee Status"
          value={admission?.feeStatus || "Pending"}
          description="Application fee"
          icon={HiOutlineCurrencyRupee as LucideIcon}
        />
        <StatCard
          title="Notifications"
          value={notifications.length.toString()}
          description="Unread notifications"
          icon={HiOutlineBell as LucideIcon}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Application Progress</CardTitle>
            </CardHeader>
            <CardContent>
              {applicant ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Profile Completion</span>
                    <span className="text-sm text-muted-foreground">80%</span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-secondary">
                    <div className="h-2 w-4/5 rounded-full bg-primary" />
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="flex items-center gap-2">
                      <HiOutlineCheckCircle className="h-5 w-5 text-emerald-500" />
                      <span className="text-sm">Profile completed</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <HiOutlineCheckCircle className="h-5 w-5 text-emerald-500" />
                      <span className="text-sm">Documents uploaded</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {verifiedDocuments.length === documents.length ? (
                        <HiOutlineCheckCircle className="h-5 w-5 text-emerald-500" />
                      ) : (
                        <HiOutlineClock className="h-5 w-5 text-amber-500" />
                      )}
                      <span className="text-sm">Documents verified</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {admission ? (
                        <HiOutlineCheckCircle className="h-5 w-5 text-emerald-500" />
                      ) : (
                        <HiOutlineClock className="h-5 w-5 text-amber-500" />
                      )}
                      <span className="text-sm">Admission decision</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground mb-4">
                    You haven't submitted an application yet.
                  </p>
                  <Button onClick={() => (window.location.href = "/inquiries/new")}>
                    Start Application
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {admission && (
            <Card>
              <CardHeader>
                <CardTitle>Admission Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Current Status</p>
                    <StatusBadge status={admission.status} />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Course</p>
                    <p className="font-medium">{admission.courseName}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Fee Status</p>
                    <StatusBadge status={admission.feeStatus} />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Eligibility Status</p>
                    <StatusBadge status={admission.eligibilityStatus} />
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="space-y-6">
          {pendingDocuments.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Missing Documents</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {pendingDocuments.map((doc) => (
                    <li key={doc.id} className="flex items-center gap-2 text-sm">
                      <HiOutlineDocumentText className="h-4 w-4 text-amber-500" />
                      {doc.name}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle>Notifications</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-4">
                {notifications.map((notification) => (
                  <li key={notification.id} className="flex gap-3">
                    <div className="mt-1">
                      <HiOutlineBell className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">{notification.title}</p>
                      <p className="text-xs text-muted-foreground">{notification.description}</p>
                      <p className="text-xs text-muted-foreground">{notification.time}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <AIInsightCard
            title="AI Recommendation"
            insight="Based on your profile and course selection, you have a strong chance of admission."
            confidence={88}
            recommendation="Complete your document uploads to improve your chances."
          />
        </div>
      </div>
    </div>
  );
}
