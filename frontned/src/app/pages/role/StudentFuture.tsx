"use client";

import { PageHeader } from "@/app/components/common/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { studentService } from "@/app/services/student.service";
import { aiService } from "@/app/services/ai.service";
import { useState } from "react";
import {
  HiOutlineArrowPath,
  HiOutlineExclamationTriangle,
  HiOutlineSparkles,
  HiOutlineLightBulb,
} from "react-icons/hi2";
import { toast } from "sonner";

export function StudentFuture() {
  const navigate = useNavigate();

  const {
    data: student,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["students", "me"],
    queryFn: () => studentService.getMyProfile(),
  });

  const [careerGoal, setCareerGoal] = useState("");
  const [targetRole, setTargetRole] = useState("");
  const [aiAnalysis, setAiAnalysis] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  if (error) {
    toast.error("Failed to load career profile");
  }

  const handleAnalyze = async () => {
    if (!careerGoal || !targetRole) {
      toast.error("Please enter your career goal and target role");
      return;
    }

    setIsAnalyzing(true);
    try {
      const result = await aiService.analyzeRisk({
        applicantId: student?.userId || "",
        academicScore: student?.cgpa ? student.cgpa * 10 : 75,
        attendancePercentage: student?.attendancePercentage || 80,
        previousDefaults: false,
      });

      setAiAnalysis(
        `Career Goal: ${careerGoal}\nTarget Role: ${targetRole}\n\n` +
          `Based on your academic profile (CGPA: ${student?.cgpa?.toFixed(2) || "N/A"}, Attendance: ${student?.attendancePercentage?.toFixed(1) || "N/A"}%), ` +
          `your risk profile is ${result.riskLevel}. Factors: ${result.factors.join(", ")}.\n\n` +
          `Note: Dedicated career planning AI endpoint needs to be implemented for full skill-gap analysis and roadmap generation.`,
      );
    } catch {
      setAiAnalysis(
        `Career Goal: ${careerGoal}\nTarget Role: ${targetRole}\n\n` +
          `Note: Dedicated career planning AI endpoint needs to be implemented for full skill-gap analysis and roadmap generation.`,
      );
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="My Future"
        description="Plan your career and explore placement opportunities"
        actions={
          <Button variant="outline" onClick={() => refetch()}>
            <HiOutlineArrowPath className="mr-2 h-4 w-4" />
            Refresh
          </Button>
        }
      />

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      ) : error ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <HiOutlineExclamationTriangle className="h-10 w-10 text-destructive mb-3" />
            <p className="text-sm font-medium">Failed to load career data</p>
            <Button className="mt-4" variant="outline" onClick={() => refetch()}>
              Try Again
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
          <Card>
            <CardHeader>
              <CardTitle>Career Planning</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Career Goal</label>
                  <input
                    type="text"
                    value={careerGoal}
                    onChange={(e) => setCareerGoal(e.target.value)}
                    placeholder="e.g. Become a Software Engineer"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Target Role</label>
                  <input
                    type="text"
                    value={targetRole}
                    onChange={(e) => setTargetRole(e.target.value)}
                    placeholder="e.g. Senior Full-Stack Developer"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  />
                </div>
              </div>
              <Button onClick={handleAnalyze} disabled={isAnalyzing}>
                <HiOutlineSparkles className="mr-2 h-4 w-4" />
                {isAnalyzing ? "Analyzing..." : "Generate Career Roadmap"}
              </Button>

              {aiAnalysis && (
                <Card className="border-sky/20 bg-sky/5">
                  <CardHeader className="pb-3">
                    <div className="flex items-center gap-2">
                      <HiOutlineLightBulb className="h-5 w-5 text-sky" />
                      <CardTitle className="text-base">Analysis Result</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground whitespace-pre-line">
                      {aiAnalysis}
                    </p>
                  </CardContent>
                </Card>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12 text-center">
              <HiOutlineExclamationTriangle className="h-10 w-10 text-muted-foreground mb-3" />
              <p className="text-sm font-medium">No placement data available</p>
              <p className="text-xs text-muted-foreground mt-1">
                Career planning, skill-gap analysis, and personalized roadmaps require
                implementation of a dedicated backend endpoint.
              </p>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
