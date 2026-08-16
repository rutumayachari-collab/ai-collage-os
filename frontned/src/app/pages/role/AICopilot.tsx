"use client";

import { useState, useMemo } from "react";
import { PageHeader } from "@/app/components/common/PageHeader";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { aiService } from "@/app/services/ai.service";
import { useAuth } from "@/app/hooks/useAuth";
import type {
  AISummaryOutput,
  AIEligibilityOutput,
  AIRiskAnalysisOutput,
  AIScholarshipOutput,
  AICounselingNotesOutput,
  AIAdmissionEmailOutput,
  AIWhatsAppDraftOutput,
  AINextActionOutput,
} from "@/app/services/ai.service";
import type { UserRole } from "@/app/types/auth";

interface QuickPrompt {
  label: string;
  prompt: string;
  action: () => void;
}

const ROLE_PROMPTS: Record<UserRole, QuickPrompt[]> = {
  SUPER_ADMIN: [],
  ADMIN: [],
  HOD: [],
  FACULTY: [],
  STUDENT: [
    {
      label: "Help me plan my career",
      prompt:
        "Based on my current course and performance, suggest a career roadmap and skills to develop.",
      action: () => {},
    },
    {
      label: "What should I learn?",
      prompt: "Recommend learning paths and resources aligned with my academic goals.",
      action: () => {},
    },
    {
      label: "Explain my timetable",
      prompt:
        "Break down my weekly timetable and highlight important deadlines and preparation tips.",
      action: () => {},
    },
  ],
  PARENT: [],
  STAFF: [],
};

export function AICopilot() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const [applicantId, setApplicantId] = useState("");
  const [applicantName, setApplicantName] = useState("");
  const [courseInterest, setCourseInterest] = useState("");
  const [academicScore, setAcademicScore] = useState(0);
  const [documentsVerified, setDocumentsVerified] = useState(false);
  const [customQuery, setCustomQuery] = useState("");

  const summaryMutation = useMutation({
    mutationFn: () =>
      aiService.generateSummary({
        applicantId,
        applicantName,
        courseInterest,
        academicScore,
        documentsVerified,
      }),
    onSuccess: () => {
      toast.success("AI summary generated");
      queryClient.invalidateQueries();
    },
    onError: () => toast.error("Failed to generate summary"),
  });

  const eligibilityMutation = useMutation({
    mutationFn: () =>
      aiService.checkEligibility({
        applicantId,
        courseId: courseInterest,
        academicScore,
        documentsVerified,
      }),
    onSuccess: () => {
      toast.success("Eligibility checked");
      queryClient.invalidateQueries();
    },
    onError: () => toast.error("Failed to check eligibility"),
  });

  const riskMutation = useMutation({
    mutationFn: () =>
      aiService.analyzeRisk({
        applicantId,
        academicScore,
        attendancePercentage: 80,
        previousDefaults: false,
      }),
    onSuccess: () => {
      toast.success("Risk analysis completed");
      queryClient.invalidateQueries();
    },
    onError: () => toast.error("Failed to analyze risk"),
  });

  const scholarshipMutation = useMutation({
    mutationFn: () =>
      aiService.recommendScholarships({
        applicantId,
        academicScore,
        familyIncome: 300000,
        category: "GENERAL",
      }),
    onSuccess: () => {
      toast.success("Scholarship recommendations generated");
      queryClient.invalidateQueries();
    },
    onError: () => toast.error("Failed to recommend scholarships"),
  });

  const counselingMutation = useMutation({
    mutationFn: () =>
      aiService.generateCounselingNotes({
        applicantId,
        counselingNotes: "Student is interested in the selected course.",
        previousInteractions: ["Initial call", "Email follow-up"],
      }),
    onSuccess: () => {
      toast.success("Counseling notes generated");
      queryClient.invalidateQueries();
    },
    onError: () => toast.error("Failed to generate counseling notes"),
  });

  const emailMutation = useMutation({
    mutationFn: () =>
      aiService.generateAdmissionEmail({
        applicantId,
        applicantName,
        courseName: courseInterest,
        status: "APPROVED",
      }),
    onSuccess: () => {
      toast.success("Admission email generated");
      queryClient.invalidateQueries();
    },
    onError: () => toast.error("Failed to generate admission email"),
  });

  const nextActionMutation = useMutation({
    mutationFn: () =>
      aiService.recommendNextAction({
        applicantId,
        currentStage: "NEW",
        pendingActions: ["Contact applicant", "Schedule counseling"],
      }),
    onSuccess: () => {
      toast.success("Next action recommended");
      queryClient.invalidateQueries();
    },
    onError: () => toast.error("Failed to recommend next action"),
  });

  const role = user?.role || "ADMIN";
  const quickPrompts = useMemo(() => ROLE_PROMPTS[role] || ROLE_PROMPTS.ADMIN, [role]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="AI Copilot"
        description={`Personalized AI assistant for ${role.replace(/_/g, " ").toLowerCase()}s`}
      />

      <Card>
        <CardHeader>
          <CardTitle>Context</CardTitle>
          <CardDescription>Provide context for AI analysis (optional)</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium">Applicant ID</label>
              <Input
                value={applicantId}
                onChange={(e) => setApplicantId(e.target.value)}
                placeholder="APP-001"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Applicant Name</label>
              <Input
                value={applicantName}
                onChange={(e) => setApplicantName(e.target.value)}
                placeholder="John Doe"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Course Interest</label>
              <Input
                value={courseInterest}
                onChange={(e) => setCourseInterest(e.target.value)}
                placeholder="Computer Science"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Academic Score</label>
              <Input
                type="number"
                value={academicScore}
                onChange={(e) => setAcademicScore(Number(e.target.value))}
                min="0"
                max="100"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>
            Role-specific AI prompts for {role.replace(/_/g, " ").toLowerCase()}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {quickPrompts.map((qp) => (
              <Button key={qp.label} variant="outline" onClick={() => setCustomQuery(qp.prompt)}>
                {qp.label}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Ask AI</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            value={customQuery}
            onChange={(e) => setCustomQuery(e.target.value)}
            placeholder="Type your question here or use quick actions above..."
            rows={4}
          />
          <div className="flex gap-2">
            <Button onClick={() => summaryMutation.mutate()} disabled={summaryMutation.isPending}>
              {summaryMutation.isPending ? "Generating..." : "Generate Summary"}
            </Button>
            <Button
              variant="outline"
              onClick={() => eligibilityMutation.mutate()}
              disabled={eligibilityMutation.isPending}
            >
              {eligibilityMutation.isPending ? "Checking..." : "Check Eligibility"}
            </Button>
            <Button
              variant="outline"
              onClick={() => riskMutation.mutate()}
              disabled={riskMutation.isPending}
            >
              {riskMutation.isPending ? "Analyzing..." : "Analyze Risk"}
            </Button>
            <Button
              variant="outline"
              onClick={() => nextActionMutation.mutate()}
              disabled={nextActionMutation.isPending}
            >
              {nextActionMutation.isPending ? "Analyzing..." : "Recommend Action"}
            </Button>
          </div>

          {summaryMutation.data && (
            <div className="space-y-2 rounded-lg border p-4">
              <p className="text-sm font-medium">Summary:</p>
              <p className="text-sm text-muted-foreground">
                {(summaryMutation.data as AISummaryOutput).summary}
              </p>
              <p className="text-xs text-muted-foreground">
                Confidence:{" "}
                {((summaryMutation.data as AISummaryOutput).confidence * 100).toFixed(0)}%
              </p>
            </div>
          )}

          {eligibilityMutation.data && (
            <div className="space-y-2 rounded-lg border p-4">
              <Badge
                variant={
                  (eligibilityMutation.data as AIEligibilityOutput).isEligible
                    ? "default"
                    : "destructive"
                }
              >
                {(eligibilityMutation.data as AIEligibilityOutput).isEligible
                  ? "Eligible"
                  : "Not Eligible"}
              </Badge>
              <p className="text-sm">
                Score: {(eligibilityMutation.data as AIEligibilityOutput).score}
              </p>
              <ul className="list-disc list-inside text-sm text-muted-foreground">
                {(eligibilityMutation.data as AIEligibilityOutput).reasons.map((reason, idx) => (
                  <li key={idx}>{reason}</li>
                ))}
              </ul>
            </div>
          )}

          {riskMutation.data && (
            <div className="space-y-2 rounded-lg border p-4">
              <Badge
                variant={
                  (riskMutation.data as AIRiskAnalysisOutput).riskLevel === "LOW"
                    ? "default"
                    : (riskMutation.data as AIRiskAnalysisOutput).riskLevel === "MEDIUM"
                      ? "secondary"
                      : "destructive"
                }
              >
                {(riskMutation.data as AIRiskAnalysisOutput).riskLevel} Risk
              </Badge>
              <p className="text-sm">
                Risk Score: {(riskMutation.data as AIRiskAnalysisOutput).riskScore}
              </p>
              <ul className="list-disc list-inside text-sm text-muted-foreground">
                {(riskMutation.data as AIRiskAnalysisOutput).factors.map((factor, idx) => (
                  <li key={idx}>{factor}</li>
                ))}
              </ul>
            </div>
          )}

          {nextActionMutation.data && (
            <div className="space-y-2 rounded-lg border p-4">
              <p className="text-sm font-medium">Recommended Action:</p>
              <p className="text-sm text-muted-foreground">
                {(nextActionMutation.data as AINextActionOutput).recommendedAction}
              </p>
              <Badge
                variant={
                  (nextActionMutation.data as AINextActionOutput).priority === "HIGH"
                    ? "destructive"
                    : (nextActionMutation.data as AINextActionOutput).priority === "MEDIUM"
                      ? "secondary"
                      : "default"
                }
              >
                {(nextActionMutation.data as AINextActionOutput).priority} Priority
              </Badge>
              <p className="text-sm text-muted-foreground">
                {(nextActionMutation.data as AINextActionOutput).reasoning}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
