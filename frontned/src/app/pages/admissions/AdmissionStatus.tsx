"use client";

import { useParams, useNavigate } from "@tanstack/react-router";
import { PageHeader } from "@/app/components/common/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Timeline } from "@/app/components/common/Timeline";
import { StatusBadge } from "@/app/components/common/StatusBadge";
import { AIInsightCard } from "@/app/components/common/AIInsightCard";
import { useAdmission, useAdmissionStages } from "@/app/hooks/queries/useAdmissions";
import { HiOutlineCheckCircle, HiOutlineClock, HiOutlineSparkles } from "react-icons/hi2";

export function AdmissionStatus() {
  const params = useParams({ from: "/admissions/$id" });
  const navigate = useNavigate();
  const { data: admission, isLoading, error } = useAdmission(params.id);
  const { data: stages = [] } = useAdmissionStages(params.id);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (error || !admission) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <p className="text-destructive">Failed to load admission status</p>
        <Button className="mt-4" onClick={() => navigate({ to: "/dashboard" })}>
          Back to Dashboard
        </Button>
      </div>
    );
  }

  const currentStage = stages.find((s) => s.status === "current");
  const completedStages = stages.filter((s) => s.status === "completed");
  const pendingStages = stages.filter((s) => s.status === "pending");

  const timelineEvents = [
    ...completedStages.map((stage) => ({
      id: stage.id,
      title: stage.name,
      description: stage.description,
      timestamp: stage.completedAt || "",
      status: "completed" as const,
    })),
    ...(currentStage
      ? [
          {
            id: currentStage.id,
            title: currentStage.name,
            description: currentStage.description || "Current stage",
            timestamp: new Date().toISOString(),
            status: "current" as const,
          },
        ]
      : []),
    ...pendingStages.map((stage) => ({
      id: stage.id,
      title: stage.name,
      description: stage.description || "Pending",
      timestamp: "",
      status: "pending" as const,
    })),
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Admission Status - ${admission.applicantName}`}
        description={`Admission #${admission.id.slice(-8)}`}
        breadcrumb={[
          { label: "Admissions", href: "/admissions" },
          { label: admission.id.slice(-8) },
        ]}
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Current Stage</CardTitle>
            </CardHeader>
            <CardContent>
              {currentStage ? (
                <div className="flex items-center gap-3">
                  <div className="rounded-full bg-primary/10 p-3">
                    <HiOutlineClock className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-lg">{currentStage.name}</p>
                    {currentStage.description && (
                      <p className="text-sm text-muted-foreground">{currentStage.description}</p>
                    )}
                  </div>
                </div>
              ) : (
                <p className="text-muted-foreground">No active stage</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Admission Timeline</CardTitle>
            </CardHeader>
            <CardContent>
              <Timeline events={timelineEvents} />
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Status Overview</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground">Admission Status</p>
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
                <p className="text-sm text-muted-foreground">Eligibility</p>
                <StatusBadge status={admission.eligibilityStatus} />
              </div>
            </CardContent>
          </Card>

          {admission.aiRecommendation && (
            <AIInsightCard
              title="AI Recommendation"
              insight={admission.aiRecommendation}
              confidence={85}
              recommendation="Based on profile analysis and historical data."
            />
          )}

          <Card>
            <CardHeader>
              <CardTitle>Pending Actions</CardTitle>
            </CardHeader>
            <CardContent>
              {pendingStages.length > 0 ? (
                <ul className="space-y-2">
                  {pendingStages.map((stage) => (
                    <li key={stage.id} className="flex items-center gap-2 text-sm">
                      <HiOutlineClock className="h-4 w-4 text-amber-500" />
                      {stage.name}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-muted-foreground">No pending actions</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
