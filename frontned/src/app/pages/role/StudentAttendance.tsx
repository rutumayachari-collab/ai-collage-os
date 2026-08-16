"use client";

import { PageHeader } from "@/app/components/common/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { studentService } from "@/app/services/student.service";
import {
  HiOutlineCheckCircle,
  HiOutlineXCircle,
  HiOutlineClock,
  HiOutlineCalendar,
  HiOutlineExclamationTriangle,
  HiOutlineArrowPath,
} from "react-icons/hi2";
import { toast } from "sonner";

export function StudentAttendance() {
  const navigate = useNavigate();

  const { data: student, isLoading, error, refetch } = useQuery({
    queryKey: ["students", "me"],
    queryFn: () => studentService.getMyProfile(),
  });

  if (error) {
    toast.error("Failed to load attendance data");
  }

  const overallAttendance = student?.attendancePercentage ?? null;
  const isGoodStanding = overallAttendance !== null && overallAttendance >= 75;

  const getAttendanceVariant = (percentage: number | null) => {
    if (percentage === null) return "outline";
    if (percentage >= 90) return "default";
    if (percentage >= 75) return "secondary";
    return "destructive";
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Attendance"
        description="View your attendance records"
        actions={
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => refetch()}>
              <HiOutlineArrowPath className="mr-2 h-4 w-4" />
              Refresh
            </Button>
            <Button variant="outline" onClick={() => navigate({ to: "/student/academics" })}>
              View Academics
            </Button>
          </div>
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
            <p className="text-sm font-medium">Failed to load attendance data</p>
            <Button className="mt-4" variant="outline" onClick={() => refetch()}>
              Try Again
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Overall Attendance</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">
                  {overallAttendance !== null ? `${overallAttendance.toFixed(1)}%` : "N/A"}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Status</CardTitle>
              </CardHeader>
              <CardContent>
                {overallAttendance !== null ? (
                  <Badge variant={getAttendanceVariant(overallAttendance)}>
                    {isGoodStanding ? "Good Standing" : "Low Attendance"}
                  </Badge>
                ) : (
                  <p className="text-sm text-muted-foreground">No data</p>
                )}
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Minimum Required</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">75%</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Classes Attended</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">
                  {overallAttendance !== null ? `${Math.round(overallAttendance * 0.4)}` : "N/A"}
                </p>
                <p className="text-xs text-muted-foreground">Estimated from percentage</p>
              </CardContent>
            </Card>
          </div>

          <Card className="border-dashed">
            <CardContent className="flex items-start gap-3 py-4">
              <HiOutlineExclamationTriangle className="h-5 w-5 text-amber-500 mt-0.5 shrink-0" />
              <div>
                <p className="text-sm font-medium">Backend integration needed</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Subject-wise attendance breakdown requires implementation of{" "}
                  <code className="rounded bg-muted px-1 py-0.5 text-xs">
                    GET /students/me/attendance/subjects
                  </code>
                  .
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Attendance Risk Assessment</CardTitle>
            </CardHeader>
            <CardContent>
              {overallAttendance !== null ? (
                <div className="space-y-3">
                  <div className="flex items-center justify-between rounded-md border p-3">
                    <div>
                      <p className="font-medium text-sm">Overall Risk</p>
                      <p className="text-xs text-muted-foreground">
                        Based on your current attendance of {overallAttendance.toFixed(1)}%
                      </p>
                    </div>
                    <Badge variant={getAttendanceVariant(overallAttendance)}>
                      {isGoodStanding ? "Low Risk" : "High Risk"}
                    </Badge>
                  </div>
                  <div className="w-full h-3 rounded-full bg-secondary">
                    <div
                      className="h-3 rounded-full bg-primary transition-all"
                      style={{ width: `${Math.min(overallAttendance, 100)}%` }}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground text-center">
                    {overallAttendance >= 90
                      ? "Excellent attendance. Keep it up!"
                      : overallAttendance >= 75
                        ? "Attendance is satisfactory. Stay above 75%."
                        : "Warning: Attendance is below the required 75% threshold."}
                  </p>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">
                  Attendance data not available from backend.
                </p>
              )}
            </CardContent>
          </Card>

          <div className="flex gap-2">
            <Button variant="outline" onClick={() => navigate({ to: "/student/timetable" })}>
              View Timetable
            </Button>
            <Button variant="outline" onClick={() => navigate({ to: "/student/exams" })}>
              View Exams
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
