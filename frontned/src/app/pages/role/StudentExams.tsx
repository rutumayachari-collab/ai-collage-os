"use client";

import { PageHeader } from "@/app/components/common/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "@tanstack/react-router";
import { useExams } from "@/app/hooks/queries/useExams";
import { useAuth } from "@/app/hooks/useAuth";
import { HiOutlineAcademicCap, HiOutlineClock } from "react-icons/hi2";

function getStatusVariant(status: string) {
  switch (status) {
    case "RESULTS_PUBLISHED":
      return "default";
    case "COMPLETED":
      return "default";
    case "ONGOING":
      return "default";
    case "SCHEDULED":
      return "secondary";
    case "CANCELLED":
      return "destructive";
    default:
      return "outline";
  }
}

export function StudentExams() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: exams = [], isLoading, error } = useExams({ studentId: user?.id });

  if (error) {
    return (
      <div className="space-y-6">
        <PageHeader title="Exams" description="View your exam schedule and results" />
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <HiOutlineAcademicCap className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-lg font-medium">Unable to load exams</p>
            <p className="text-sm text-muted-foreground">Please try again later.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Exams" description="View your exam schedule and results" />

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      ) : exams.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <HiOutlineAcademicCap className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-lg font-medium">No Exams Found</p>
            <p className="text-sm text-muted-foreground">Your exam schedule will appear here.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {exams.map((exam) => (
            <Card key={exam.id}>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium">{exam.name}</CardTitle>
                  <Badge variant={getStatusVariant(exam.status)}>
                    {exam.status.replace(/_/g, " ")}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                <p className="text-sm text-muted-foreground">Code: {exam.code}</p>
                <p className="text-sm text-muted-foreground">Type: {exam.examType}</p>
                <p className="text-sm text-muted-foreground">
                  Max Marks: {exam.maxMarks} | Passing: {exam.passingMarks}
                </p>
                {exam.scheduledAt && (
                  <p className="text-sm text-muted-foreground">
                    Scheduled: {new Date(exam.scheduledAt).toLocaleString()}
                  </p>
                )}
                <p className="text-sm text-muted-foreground">
                  Duration: {exam.durationMinutes} minutes
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
