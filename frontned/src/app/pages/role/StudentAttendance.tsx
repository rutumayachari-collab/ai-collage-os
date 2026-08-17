"use client";

import { PageHeader } from "@/app/components/common/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { attendanceService } from "@/app/services/attendance.service";
import { useAuth } from "@/app/hooks/useAuth";
import { HiOutlineCheckCircle, HiOutlineXCircle } from "react-icons/hi2";

export function StudentAttendance() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const {
    data: attendance = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ["attendance", "me"],
    queryFn: () => attendanceService.getMyAttendance(),
  });

  if (error) {
    return (
      <div className="space-y-6">
        <PageHeader title="Attendance" description="View your attendance records" />
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <HiOutlineXCircle className="h-12 w-12 text-destructive mb-4" />
            <p className="text-lg font-medium">Unable to load attendance</p>
            <p className="text-sm text-muted-foreground">Please try again later.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const presentCount = attendance.filter((a) => a.status === "PRESENT").length;
  const absentCount = attendance.filter((a) => a.status === "ABSENT").length;
  const lateCount = attendance.filter((a) => a.status === "LATE").length;
  const total = attendance.length;
  const percentage = total > 0 ? Math.round(((presentCount + lateCount) / total) * 100) : 0;

  return (
    <div className="space-y-6">
      <PageHeader title="Attendance" description="View your attendance records" />

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Present</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-emerald-600">{presentCount}</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Absent</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-red-600">{absentCount}</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Late</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-amber-600">{lateCount}</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Percentage</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">{percentage}%</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Attendance Records</CardTitle>
            </CardHeader>
            <CardContent>
              {attendance.length === 0 ? (
                <p className="text-sm text-muted-foreground">No attendance records found.</p>
              ) : (
                <div className="space-y-2">
                  {attendance.slice(0, 20).map((record) => (
                    <div
                      key={record.id}
                      className="flex items-center justify-between rounded-md border p-3"
                    >
                      <div>
                        <p className="font-medium">{record.subjectName || record.subjectId}</p>
                        <p className="text-sm text-muted-foreground">
                          {record.date ? new Date(record.date).toLocaleDateString() : "N/A"}
                        </p>
                      </div>
                      <Badge
                        variant={
                          record.status === "PRESENT"
                            ? "default"
                            : record.status === "LATE"
                              ? "secondary"
                              : "destructive"
                        }
                      >
                        {record.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
