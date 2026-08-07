"use client";

import { useState } from "react";
import { useParams } from "@tanstack/react-router";
import { PageHeader } from "@/app/components/common/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAICopilotInsight } from "@/app/hooks/queries/useFaculty";
import { ApplicantSummary } from "@/app/components/ai/AICopilot";
import { AdmissionProbability } from "@/app/components/ai/AICopilot";
import { RiskScore } from "@/app/components/ai/AICopilot";
import { MissingDocuments } from "@/app/components/ai/AICopilot";
import { ScholarshipRecommendation } from "@/app/components/ai/AICopilot";
import { RecommendedCourse } from "@/app/components/ai/AICopilot";
import { RecommendedNextAction } from "@/app/components/ai/AICopilot";
import { GenerateEmail } from "@/app/components/ai/AICopilot";
import { GenerateWhatsApp } from "@/app/components/ai/AICopilot";
import { GenerateCounselingNotes } from "@/app/components/ai/AICopilot";
import { GenerateAdmissionSummary } from "@/app/components/ai/AICopilot";
import { Loader2 } from "lucide-react";

export function AICopilotPage() {
  const params = useParams({ from: "/faculty/ai-copilot/$applicantId" });
  const [selectedApplicant, setSelectedApplicant] = useState(params.applicantId || "");
  const { data: insight, isLoading } = useAICopilotInsight(selectedApplicant);

  return (
    <div className="space-y-6">
      <PageHeader
        title="AI Admission Copilot"
        description="AI-powered insights and recommendations for applicant review"
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : insight ? (
            <Tabs defaultValue="overview" className="space-y-6">
              <TabsList>
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="actions">Actions</TabsTrigger>
                <TabsTrigger value="generate">Generate</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-6">
                <div className="grid gap-6 lg:grid-cols-2">
                  <ApplicantSummary insight={insight} />
                  <AdmissionProbability probability={insight.admissionProbability} />
                  <RiskScore score={insight.riskScore} />
                  <MissingDocuments documents={insight.missingDocuments} />
                  <ScholarshipRecommendation recommendation={insight.scholarshipRecommendation} />
                  <RecommendedCourse course={insight.recommendedCourse} />
                </div>
              </TabsContent>

              <TabsContent value="actions" className="space-y-6">
                <RecommendedNextAction action={insight.recommendedNextAction} />
              </TabsContent>

              <TabsContent value="generate" className="space-y-6">
                <div className="grid gap-6 lg:grid-cols-2">
                  <GenerateEmail applicantName={insight.applicantName} context={insight.summary} />
                  <GenerateWhatsApp
                    applicantName={insight.applicantName}
                    context={insight.recommendedNextAction}
                  />
                  <GenerateCounselingNotes
                    applicantName={insight.applicantName}
                    notes={insight.recommendedNextAction}
                  />
                  <GenerateAdmissionSummary
                    applicantName={insight.applicantName}
                    summary={insight.summary}
                  />
                </div>
              </TabsContent>
            </Tabs>
          ) : (
            <Card>
              <CardContent className="py-20 text-center">
                <p className="text-muted-foreground">Select an applicant to view AI insights</p>
              </CardContent>
            </Card>
          )}
        </div>

        <div>
          <Card>
            <CardHeader>
              <CardTitle>Select Applicant</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Choose an applicant to view AI-powered insights and recommendations.
              </p>
              <Button
                className="w-full"
                onClick={() => setSelectedApplicant("sample-applicant-id")}
              >
                Load Sample Applicant
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
