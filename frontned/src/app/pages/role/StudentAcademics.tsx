"use client";

import { PageHeader } from "@/app/components/common/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { studentService } from "@/app/services/student.service";
import { useAuth } from "@/app/hooks/useAuth";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  HiOutlineAcademicCap,
  HiOutlineChartBar,
  HiOutlineDocumentText,
  HiOutlineExclamationTriangle,
  HiOutlineArrowPath,
} from "react-icons/hi2";
import { toast } from "sonner";

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8"];

export function StudentAcademics() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const {
    data: student,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["students", "me"],
    queryFn: () => studentService.getMyProfile(),
  });

  if (error) {
    toast.error("Failed to load academic profile");
  }

  const cgpaData = student?.cgpa
    ? [
        { name: "CGPA", value: student.cgpa, fill: "#0088FE" },
        { name: "Remaining", value: Math.max(0, 10 - student.cgpa), fill: "#e2e8f0" },
      ]
    : [];

  const backendNotice = (
    <Card className="border-dashed">
      <CardContent className="flex items-start gap-3 py-4">
        <HiOutlineExclamationTriangle className="h-5 w-5 text-amber-500 mt-0.5 shrink-0" />
        <div>
          <p className="text-sm font-medium">Backend integration needed</p>
          <p className="text-xs text-muted-foreground mt-1">
            The following endpoints need implementation to display full academic records:
            <code className="ml-1 rounded bg-muted px-1 py-0.5 text-xs">
              GET /students/me/subjects, GET /students/me/faculty, GET /students/me/marks, GET
              /students/me/credits
            </code>
          </p>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Academics"
        description="View your academic records and performance"
        actions={
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => refetch()}>
              <HiOutlineArrowPath className="mr-2 h-4 w-4" />
              Refresh
            </Button>
            <Button variant="outline" onClick={() => navigate({ to: "/student/courses" })}>
              View Courses
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
            <p className="text-sm font-medium">Failed to load academic data</p>
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
                <CardTitle className="text-sm font-medium">CGPA</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">{student?.cgpa?.toFixed(2) || "N/A"}</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Semester</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">{student?.semester || "N/A"}</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Department</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-base font-bold truncate">{student?.department?.name || "N/A"}</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Student ID</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-base font-bold">{student?.studentId || "N/A"}</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>CGPA Overview</CardTitle>
              </CardHeader>
              <CardContent>
                {cgpaData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                      <Pie
                        data={cgpaData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                        label={({ name, value }) => `${name}: ${value}`}
                      >
                        {cgpaData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.fill} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-8">
                    CGPA data not available
                  </p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Academic Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between rounded-md border p-3">
                  <div>
                    <p className="font-medium text-sm">Current Semester</p>
                    <p className="text-xs text-muted-foreground">
                      Semester {student?.semester || "N/A"}
                    </p>
                  </div>
                  <Badge variant={student?.semester ? "default" : "secondary"}>
                    {student?.semester ? "Active" : "N/A"}
                  </Badge>
                </div>
                <div className="flex items-center justify-between rounded-md border p-3">
                  <div>
                    <p className="font-medium text-sm">CGPA</p>
                    <p className="text-xs text-muted-foreground">Cumulative Grade Point Average</p>
                  </div>
                  <p className="text-lg font-bold">{student?.cgpa?.toFixed(2) || "N/A"}</p>
                </div>
                <div className="flex items-center justify-between rounded-md border p-3">
                  <div>
                    <p className="font-medium text-sm">Department</p>
                    <p className="text-xs text-muted-foreground">
                      {student?.department?.code || "N/A"}
                    </p>
                  </div>
                  <p className="text-sm font-medium">{student?.department?.name || "N/A"}</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {backendNotice}

          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                <Button variant="outline" onClick={() => navigate({ to: "/student/timetable" })}>
                  View Timetable
                </Button>
                <Button variant="outline" onClick={() => navigate({ to: "/student/attendance" })}>
                  View Attendance
                </Button>
                <Button variant="outline" onClick={() => navigate({ to: "/student/exams" })}>
                  View Exams
                </Button>
                <Button variant="outline" onClick={() => navigate({ to: "/student/assignments" })}>
                  View Assignments
                </Button>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
