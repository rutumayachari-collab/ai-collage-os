import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
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

const API_BASE = import.meta.env.VITE_API_URL || "";

type AISummaryOutput = {
  summary: string;
  confidence: number;
  generatedAt: string;
};

type AIEligibilityOutput = {
  isEligible: boolean;
  score: number;
  reasons: string[];
  generatedAt: string;
};

type AIRiskAnalysisOutput = {
  riskScore: number;
  riskLevel: "LOW" | "MEDIUM" | "HIGH";
  factors: string[];
  generatedAt: string;
};

type AIScholarshipOutput = {
  recommendedScholarships: Array<{ name: string; amount: number; eligibility: boolean }>;
  generatedAt: string;
};

type AICounselingNotesOutput = {
  structuredNotes: string;
  keyPoints: string[];
  nextSteps: string[];
  generatedAt: string;
};

type AIAdmissionEmailOutput = {
  subject: string;
  body: string;
  generatedAt: string;
};

type AIWhatsAppDraftOutput = {
  draft: string;
  characterCount: number;
  generatedAt: string;
};

type AINextActionOutput = {
  recommendedAction: string;
  priority: "HIGH" | "MEDIUM" | "LOW";
  reasoning: string;
  generatedAt: string;
};

export function AICopilot() {
  const queryClient = useQueryClient();
  const [applicantId, setApplicantId] = useState("");
  const [applicantName, setApplicantName] = useState("");
  const [courseInterest, setCourseInterest] = useState("");
  const [academicScore, setAcademicScore] = useState(0);
  const [documentsVerified, setDocumentsVerified] = useState(false);

  const summaryMutation = useMutation({
    mutationFn: async (): Promise<AISummaryOutput> => {
      const res = await fetch(`${API_BASE}/ai/summary`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          applicantId,
          applicantName,
          courseInterest,
          academicScore,
          documentsVerified,
        }),
      });
      if (!res.ok) throw new Error("Failed to generate summary");
      return res.json();
    },
    onSuccess: () => {
      toast.success("AI summary generated");
      queryClient.invalidateQueries();
    },
    onError: () => toast.error("Failed to generate summary"),
  });

  const eligibilityMutation = useMutation({
    mutationFn: async (): Promise<AIEligibilityOutput> => {
      const res = await fetch(`${API_BASE}/ai/eligibility`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          applicantId,
          courseId: courseInterest,
          academicScore,
          documentsVerified,
        }),
      });
      if (!res.ok) throw new Error("Failed to check eligibility");
      return res.json();
    },
    onSuccess: () => {
      toast.success("Eligibility checked");
      queryClient.invalidateQueries();
    },
    onError: () => toast.error("Failed to check eligibility"),
  });

  const riskMutation = useMutation({
    mutationFn: async (): Promise<AIRiskAnalysisOutput> => {
      const res = await fetch(`${API_BASE}/ai/risk-analysis`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          applicantId,
          academicScore,
          attendancePercentage: 80,
          previousDefaults: false,
        }),
      });
      if (!res.ok) throw new Error("Failed to analyze risk");
      return res.json();
    },
    onSuccess: () => {
      toast.success("Risk analysis completed");
      queryClient.invalidateQueries();
    },
    onError: () => toast.error("Failed to analyze risk"),
  });

  const scholarshipMutation = useMutation({
    mutationFn: async (): Promise<AIScholarshipOutput> => {
      const res = await fetch(`${API_BASE}/ai/scholarship-recommendation`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          applicantId,
          academicScore,
          familyIncome: 300000,
          category: "GENERAL",
        }),
      });
      if (!res.ok) throw new Error("Failed to recommend scholarships");
      return res.json();
    },
    onSuccess: () => {
      toast.success("Scholarship recommendations generated");
      queryClient.invalidateQueries();
    },
    onError: () => toast.error("Failed to recommend scholarships"),
  });

  const counselingMutation = useMutation({
    mutationFn: async (): Promise<AICounselingNotesOutput> => {
      const res = await fetch(`${API_BASE}/ai/counseling-notes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          applicantId,
          counselingNotes: "Student is interested in Computer Science.",
          previousInteractions: ["Initial call", "Email follow-up"],
        }),
      });
      if (!res.ok) throw new Error("Failed to generate counseling notes");
      return res.json();
    },
    onSuccess: () => {
      toast.success("Counseling notes generated");
      queryClient.invalidateQueries();
    },
    onError: () => toast.error("Failed to generate counseling notes"),
  });

  const emailMutation = useMutation({
    mutationFn: async (): Promise<AIAdmissionEmailOutput> => {
      const res = await fetch(`${API_BASE}/ai/admission-email`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          applicantId,
          applicantName,
          courseName: courseInterest,
          status: "APPROVED",
        }),
      });
      if (!res.ok) throw new Error("Failed to generate admission email");
      return res.json();
    },
    onSuccess: () => {
      toast.success("Admission email generated");
      queryClient.invalidateQueries();
    },
    onError: () => toast.error("Failed to generate admission email"),
  });

  const whatsappMutation = useMutation({
    mutationFn: async (): Promise<AIWhatsAppDraftOutput> => {
      const res = await fetch(`${API_BASE}/ai/whatsapp-draft`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          applicantId,
          applicantName,
          message: "Your application has been received.",
        }),
      });
      if (!res.ok) throw new Error("Failed to generate WhatsApp draft");
      return res.json();
    },
    onSuccess: () => {
      toast.success("WhatsApp draft generated");
      queryClient.invalidateQueries();
    },
    onError: () => toast.error("Failed to generate WhatsApp draft"),
  });

  const nextActionMutation = useMutation({
    mutationFn: async (): Promise<AINextActionOutput> => {
      const res = await fetch(`${API_BASE}/ai/next-action`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          applicantId,
          currentStage: "NEW",
          pendingActions: ["Contact applicant", "Schedule counseling"],
        }),
      });
      if (!res.ok) throw new Error("Failed to recommend next action");
      return res.json();
    },
    onSuccess: () => {
      toast.success("Next action recommended");
      queryClient.invalidateQueries();
    },
    onError: () => toast.error("Failed to recommend next action"),
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">AI Admission Copilot</h1>
        <p className="text-muted-foreground">
          Connect AI to backend APIs for intelligent admission automation
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Applicant Context</CardTitle>
          <CardDescription>Provide applicant details for AI analysis</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium">Applicant ID</label>
              <input
                type="text"
                value={applicantId}
                onChange={(e) => setApplicantId(e.target.value)}
                className="w-full rounded-md border px-3 py-2"
                placeholder="APP-001"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Applicant Name</label>
              <input
                type="text"
                value={applicantName}
                onChange={(e) => setApplicantName(e.target.value)}
                className="w-full rounded-md border px-3 py-2"
                placeholder="John Doe"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Course Interest</label>
              <input
                type="text"
                value={courseInterest}
                onChange={(e) => setCourseInterest(e.target.value)}
                className="w-full rounded-md border px-3 py-2"
                placeholder="Computer Science"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Academic Score</label>
              <input
                type="number"
                value={academicScore}
                onChange={(e) => setAcademicScore(Number(e.target.value))}
                className="w-full rounded-md border px-3 py-2"
                min="0"
                max="100"
              />
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="documentsVerified"
                checked={documentsVerified}
                onChange={(e) => setDocumentsVerified(e.target.checked)}
              />
              <label htmlFor="documentsVerified" className="text-sm font-medium">
                Documents Verified
              </label>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="summary" className="space-y-4">
        <TabsList>
          <TabsTrigger value="summary">Summary</TabsTrigger>
          <TabsTrigger value="eligibility">Eligibility</TabsTrigger>
          <TabsTrigger value="risk">Risk Analysis</TabsTrigger>
          <TabsTrigger value="scholarship">Scholarships</TabsTrigger>
          <TabsTrigger value="counseling">Counseling</TabsTrigger>
          <TabsTrigger value="email">Email</TabsTrigger>
          <TabsTrigger value="whatsapp">WhatsApp</TabsTrigger>
          <TabsTrigger value="nextAction">Next Action</TabsTrigger>
        </TabsList>

        <TabsContent value="summary" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Applicant Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button onClick={() => summaryMutation.mutate()} disabled={summaryMutation.isPending}>
                {summaryMutation.isPending ? "Generating..." : "Generate Summary"}
              </Button>
              {summaryMutation.data && (
                <div className="space-y-2">
                  <p className="text-sm font-medium">Summary:</p>
                  <p className="text-sm text-muted-foreground">{summaryMutation.data.summary}</p>
                  <p className="text-xs text-muted-foreground">
                    Confidence: {(summaryMutation.data.confidence * 100).toFixed(0)}%
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="eligibility" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Eligibility Check</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button
                onClick={() => eligibilityMutation.mutate()}
                disabled={eligibilityMutation.isPending}
              >
                {eligibilityMutation.isPending ? "Checking..." : "Check Eligibility"}
              </Button>
              {eligibilityMutation.data && (
                <div className="space-y-2">
                  <Badge variant={eligibilityMutation.data.isEligible ? "default" : "destructive"}>
                    {eligibilityMutation.data.isEligible ? "Eligible" : "Not Eligible"}
                  </Badge>
                  <p className="text-sm">Score: {eligibilityMutation.data.score}</p>
                  <ul className="list-disc list-inside text-sm text-muted-foreground">
                    {eligibilityMutation.data.reasons.map((reason, idx) => (
                      <li key={idx}>{reason}</li>
                    ))}
                  </ul>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="risk" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Risk Analysis</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button onClick={() => riskMutation.mutate()} disabled={riskMutation.isPending}>
                {riskMutation.isPending ? "Analyzing..." : "Analyze Risk"}
              </Button>
              {riskMutation.data && (
                <div className="space-y-2">
                  <Badge
                    variant={
                      riskMutation.data.riskLevel === "LOW"
                        ? "default"
                        : riskMutation.data.riskLevel === "MEDIUM"
                          ? "secondary"
                          : "destructive"
                    }
                  >
                    {riskMutation.data.riskLevel} Risk
                  </Badge>
                  <p className="text-sm">Risk Score: {riskMutation.data.riskScore}</p>
                  <ul className="list-disc list-inside text-sm text-muted-foreground">
                    {riskMutation.data.factors.map((factor, idx) => (
                      <li key={idx}>{factor}</li>
                    ))}
                  </ul>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="scholarship" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Scholarship Recommendations</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button
                onClick={() => scholarshipMutation.mutate()}
                disabled={scholarshipMutation.isPending}
              >
                {scholarshipMutation.isPending ? "Generating..." : "Get Recommendations"}
              </Button>
              {scholarshipMutation.data && (
                <div className="space-y-2">
                  {scholarshipMutation.data.recommendedScholarships.map((scholarship, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between rounded-md border p-3"
                    >
                      <div>
                        <p className="font-medium">{scholarship.name}</p>
                        <p className="text-sm text-muted-foreground">
                          Amount: ₹{scholarship.amount.toLocaleString()}
                        </p>
                      </div>
                      <Badge variant={scholarship.eligibility ? "default" : "secondary"}>
                        {scholarship.eligibility ? "Eligible" : "Not Eligible"}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="counseling" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Counseling Notes</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button
                onClick={() => counselingMutation.mutate()}
                disabled={counselingMutation.isPending}
              >
                {counselingMutation.isPending ? "Generating..." : "Generate Notes"}
              </Button>
              {counselingMutation.data && (
                <div className="space-y-2">
                  <p className="text-sm font-medium">Structured Notes:</p>
                  <p className="text-sm text-muted-foreground">
                    {counselingMutation.data.structuredNotes}
                  </p>
                  <div>
                    <p className="text-sm font-medium">Key Points:</p>
                    <ul className="list-disc list-inside text-sm text-muted-foreground">
                      {counselingMutation.data.keyPoints.map((point, idx) => (
                        <li key={idx}>{point}</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Next Steps:</p>
                    <ul className="list-disc list-inside text-sm text-muted-foreground">
                      {counselingMutation.data.nextSteps.map((step, idx) => (
                        <li key={idx}>{step}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="email" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Admission Email</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button onClick={() => emailMutation.mutate()} disabled={emailMutation.isPending}>
                {emailMutation.isPending ? "Generating..." : "Generate Email"}
              </Button>
              {emailMutation.data && (
                <div className="space-y-2">
                  <p className="text-sm font-medium">Subject:</p>
                  <p className="text-sm text-muted-foreground">{emailMutation.data.subject}</p>
                  <p className="text-sm font-medium">Body:</p>
                  <Textarea
                    value={emailMutation.data.body}
                    readOnly
                    className="font-mono text-xs"
                  />
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="whatsapp" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>WhatsApp Draft</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button
                onClick={() => whatsappMutation.mutate()}
                disabled={whatsappMutation.isPending}
              >
                {whatsappMutation.isPending ? "Generating..." : "Generate Draft"}
              </Button>
              {whatsappMutation.data && (
                <div className="space-y-2">
                  <p className="text-sm font-medium">Draft:</p>
                  <p className="text-sm text-muted-foreground">{whatsappMutation.data.draft}</p>
                  <p className="text-xs text-muted-foreground">
                    Character Count: {whatsappMutation.data.characterCount}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="nextAction" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Next Action Recommendation</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button
                onClick={() => nextActionMutation.mutate()}
                disabled={nextActionMutation.isPending}
              >
                {nextActionMutation.isPending ? "Analyzing..." : "Recommend Action"}
              </Button>
              {nextActionMutation.data && (
                <div className="space-y-2">
                  <p className="text-sm font-medium">Recommended Action:</p>
                  <p className="text-sm text-muted-foreground">
                    {nextActionMutation.data.recommendedAction}
                  </p>
                  <Badge
                    variant={
                      nextActionMutation.data.priority === "HIGH"
                        ? "destructive"
                        : nextActionMutation.data.priority === "MEDIUM"
                          ? "secondary"
                          : "default"
                    }
                  >
                    {nextActionMutation.data.priority} Priority
                  </Badge>
                  <p className="text-sm text-muted-foreground">
                    {nextActionMutation.data.reasoning}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
