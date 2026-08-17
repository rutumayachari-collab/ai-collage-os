"use client";

import { useState } from "react";
import { PageHeader } from "@/app/components/common/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/app/components/tables/DataTable";
import { StatusBadge } from "@/app/components/common/StatusBadge";
import { ErrorState } from "@/app/components/common/ErrorState";
import { useNavigate } from "@tanstack/react-router";
import { useStudents } from "@/app/hooks/queries/useStudent";
import { useAuth } from "@/app/hooks/useAuth";
import { useAdminStats } from "@/app/hooks/queries/useAdmin";
import { HiOutlinePlus, HiOutlineUserGroup } from "react-icons/hi2";
import type { Student } from "@/app/types/student";

export function AdminStudents() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: stats, isLoading: statsLoading, error: statsError } = useAdminStats();
  const [search, setSearch] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState<string>("");

  const {
    data: students = [],
    isLoading,
    error,
  } = useStudents({ search, departmentId: departmentFilter || undefined });

  const canCreate = user?.permissions.includes("students:create");

  const columns = [
    {
      key: "name",
      header: "Name",
      cell: (row: Student) => `${row.firstName} ${row.lastName}`,
    },
    { key: "email", header: "Email" },
    { key: "studentId", header: "Student ID" },
    {
      key: "department",
      header: "Department",
      cell: (row: Student) => row.department?.name || "-",
    },
    { key: "semester", header: "Semester" },
    {
      key: "attendancePercentage",
      header: "Attendance",
      cell: (row: Student) => `${row.attendancePercentage?.toFixed(1) ?? "N/A"}%`,
    },
    {
      key: "cgpa",
      header: "CGPA",
      cell: (row: Student) => (row.cgpa !== undefined ? row.cgpa.toFixed(2) : "N/A"),
    },
    {
      key: "feeStatus",
      header: "Fee Status",
      cell: (row: Student) => <StatusBadge status={row.feeStatus || "PENDING"} />,
    },
    {
      key: "status",
      header: "Status",
      cell: (row: Student) => <StatusBadge status={row.status || "ACTIVE"} />,
    },
    {
      key: "actions",
      header: "Actions",
      cell: (row: Student) => (
        <Button size="sm" variant="outline" onClick={() => navigate({ to: `/students/${row.id}` })}>
          View
        </Button>
      ),
    },
  ];

  if (statsError || error) {
    return (
      <div className="space-y-6">
        <PageHeader title="Students" description="Manage students" />
        <ErrorState
          title="Failed to load data"
          description={error?.message || statsError?.message}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Students"
        description="Manage students"
        actions={
          canCreate ? (
            <Button onClick={() => navigate({ to: "/admin/students/new" })}>
              <HiOutlinePlus className="mr-2 h-4 w-4" />
              Add Student
            </Button>
          ) : undefined
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Students</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{stats?.totalStudents || students.length || "0"}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Active</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              {students.filter((s) => (s.status || "ACTIVE") === "ACTIVE").length}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Departments</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              {new Set(students.map((s) => s.department?.name).filter(Boolean)).size}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Admissions</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{stats?.admissionsApproved || "0"}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Students</CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable
            data={students}
            columns={columns}
            keyExtractor={(row) => row.id}
            isLoading={isLoading || statsLoading}
            searchable
            searchPlaceholder="Search students..."
            onSearchChange={setSearch}
            emptyState={{
              title: "No students found",
              description: "Get started by adding a new student.",
              action: canCreate
                ? {
                    label: "Add Student",
                    onClick: () => navigate({ to: "/admin/students/new" }),
                  }
                : undefined,
            }}
          />
        </CardContent>
      </Card>
    </div>
  );
}
