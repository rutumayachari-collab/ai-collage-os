"use client";

import { PageHeader } from "@/app/components/common/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "@tanstack/react-router";
import { useAuth } from "@/app/hooks/useAuth";
import { useStudent } from "@/app/hooks/queries/useStudent";
import {
  HiOutlineAcademicCap,
  HiOutlineDocumentText,
  HiOutlineCurrencyRupee,
  HiOutlineBell,
  HiOutlineCalendar,
  HiOutlineClock,
} from "react-icons/hi2";
import { type LucideIcon } from "lucide-react";

export function StudentDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { data: student, isLoading } = useStudent(user?.id || "");

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Student Dashboard"
        description={`Welcome back, ${user?.fullName || "Student"}`}
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Student ID</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{student?.studentId || "N/A"}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Department</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{student?.department?.name || "N/A"}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">CGPA</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{student?.cgpa?.toFixed(2) || "N/A"}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Attendance</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{student?.attendancePercentage?.toFixed(1) || "N/A"}%</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Upcoming Classes</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                No upcoming classes scheduled.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Upcoming Exams</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                No upcoming exams scheduled.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Pending Assignments</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                No pending assignments.
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Fee Status</CardTitle>
            </CardHeader>
            <CardContent>
              <Badge variant={student?.feeStatus === "PAID" ? "default" : "secondary"}>
                {student?.feeStatus || "Pending"}
              </Badge>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Important Notifications</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                No new notifications.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
