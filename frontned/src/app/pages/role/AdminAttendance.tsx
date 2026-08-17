"use client";

import { useState } from "react";
import { PageHeader } from "@/app/components/common/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/app/components/tables/DataTable";
import { StatusBadge } from "@/app/components/common/StatusBadge";
import { ErrorState } from "@/app/components/common/ErrorState";
import { useNavigate } from "@tanstack/react-router";
import { useAttendanceStatistics } from "@/app/hooks/queries/useAttendance";
import { useAuth } from "@/app/hooks/useAuth";
import { HiOutlineCheckCircle, HiOutlineXCircle } from "react-icons/hi2";
import type { AttendanceStatistics } from "@/app/types/attendance";

export function AdminAttendance() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [search, setSearch] = useState("");

  const { data: stats, isLoading, error } = useAttendanceStatistics();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (error) {
    return (
      <ErrorState
        title="Unable to load attendance data"
        description="Please try again later."
        onRetry={() => {}}
      />
    );
  }

  const overall = (stats as AttendanceStatistics)?.overall;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Attendance"
        description="Monitor attendance across courses"
        actions={
          <Button onClick={() => navigate({ to: "/faculty" })}>
            <HiOutlineCheckCircle className="mr-2 h-4 w-4" />
            Mark Attendance
          </Button>
        }
      />

      {overall ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total Records</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{overall.totalRecords}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Present</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-emerald-600">{overall.presentCount}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Absent</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-red-600">{overall.absentCount}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Overall %</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{overall.overallPercentage}%</p>
            </CardContent>
          </Card>
        </div>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <HiOutlineCheckCircle className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-lg font-medium">No Attendance Data</p>
            <p className="text-sm text-muted-foreground">No attendance records available yet.</p>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Attendance Analytics</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Detailed subject-wise and student-wise attendance breakdowns are available through the
            faculty portal.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
