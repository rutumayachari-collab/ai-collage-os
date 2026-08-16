"use client";

import { useState } from "react";
import { PageHeader } from "@/app/components/common/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/app/components/tables/DataTable";
import { StatusBadge } from "@/app/components/common/StatusBadge";
import { ErrorState } from "@/app/components/common/ErrorState";
import { useNavigate } from "@tanstack/react-router";
import { useFacultyStats } from "@/app/hooks/queries/useFaculty";
import { useAdminStats } from "@/app/hooks/queries/useAdmin";
import { HiOutlinePlus, HiOutlineUserGroup } from "react-icons/hi2";
import { toast } from "sonner";
import type { FacultyStats } from "@/app/types/faculty";

interface CounsellorRow {
  id: string;
  name: string;
  email: string;
  department: string;
  activeLeads: number;
  calls: number;
  followUps: number;
  applications: number;
  admissions: number;
  conversion: number;
  status: string;
}

export function AdminCounsellors() {
  const navigate = useNavigate();
  const { data: stats, isLoading: statsLoading, error: statsError } = useAdminStats();
  const { data: facultyStats } = useFacultyStats();

  const statsData = stats as FacultyStats | undefined;

  const columns = [
    { key: "name", header: "Counsellor" },
    { key: "email", header: "Email" },
    { key: "department", header: "Department" },
    {
      key: "activeLeads",
      header: "Active Leads",
      cell: (row: CounsellorRow) => row.activeLeads,
    },
    {
      key: "calls",
      header: "Calls",
      cell: (row: CounsellorRow) => row.calls,
    },
    {
      key: "followUps",
      header: "Follow-ups",
      cell: (row: CounsellorRow) => row.followUps,
    },
    {
      key: "applications",
      header: "Applications",
      cell: (row: CounsellorRow) => row.applications,
    },
    {
      key: "admissions",
      header: "Admissions",
      cell: (row: CounsellorRow) => row.admissions,
    },
    {
      key: "conversion",
      header: "Conversion",
      cell: (row: CounsellorRow) => `${row.conversion}%`,
    },
    {
      key: "status",
      header: "Status",
      cell: (row: CounsellorRow) => <StatusBadge status={row.status} />,
    },
    {
      key: "actions",
      header: "Actions",
      cell: (row: CounsellorRow) => (
        <Button
          size="sm"
          variant="outline"
          onClick={() => navigate({ to: `/counsellors/${row.id}` })}
        >
          View
        </Button>
      ),
    },
  ];

  if (statsError) {
    toast.error("Failed to load admin stats");
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Counsellors"
        description="Manage counsellors"
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Counsellors</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{stats?.totalFaculty || "0"}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Active</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{stats?.totalFaculty || "0"}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Leads</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{statsData?.totalApplicants || "0"}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Conversions</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{stats?.admissionsApproved || "0"}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Counsellors</CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable
            data={[]}
            columns={columns}
            keyExtractor={(row) => row.id}
            isLoading={statsLoading}
            emptyState={{
              title: "No counsellors found",
              description: "Counsellor data will appear here when available from the faculty module.",
            }}
          />
        </CardContent>
      </Card>
    </div>
  );
}
