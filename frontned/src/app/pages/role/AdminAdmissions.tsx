"use client";

import { useState } from "react";
import { PageHeader } from "@/app/components/common/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/app/components/tables/DataTable";
import { StatusBadge } from "@/app/components/common/StatusBadge";
import { ErrorState } from "@/app/components/common/ErrorState";
import { useNavigate } from "@tanstack/react-router";
import { useAdmissions } from "@/app/hooks/queries/useAdmissions";
import { useAuth } from "@/app/hooks/useAuth";
import { HiOutlinePlus, HiOutlineCheckCircle, HiOutlineXCircle } from "react-icons/hi2";
import type { Admission } from "@/app/types/admission";

export function AdminAdmissions() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");

  const {
    data: admissions = [],
    isLoading,
    error,
  } = useAdmissions({ search, status: statusFilter });

  const canCreate = user?.permissions.includes("admissions:create");

  const columns = [
    { key: "applicantName", header: "Applicant" },
    { key: "courseName", header: "Course" },
    { key: "stage", header: "Stage" },
    {
      key: "eligibilityStatus",
      header: "Eligibility",
      cell: (row: Admission) => <StatusBadge status={row.eligibilityStatus} />,
    },
    {
      key: "feeStatus",
      header: "Fee Status",
      cell: (row: Admission) => <StatusBadge status={row.feeStatus} />,
    },
    {
      key: "status",
      header: "Status",
      cell: (row: Admission) => <StatusBadge status={row.status} />,
    },
    {
      key: "createdAt",
      header: "Created",
      cell: (row: Admission) => new Date(row.createdAt).toLocaleDateString(),
    },
    {
      key: "actions",
      header: "Actions",
      cell: (row: Admission) => (
        <div className="flex gap-1">
          <Button
            size="sm"
            variant="outline"
            onClick={() => navigate({ to: `/admissions/${row.id}` })}
          >
            View
          </Button>
          <Button
            size="sm"
            variant="default"
            onClick={() => navigate({ to: `/admissions/${row.id}`, search: { action: "approve" } })}
          >
            Approve
          </Button>
          <Button
            size="sm"
            variant="destructive"
            onClick={() => navigate({ to: `/admissions/${row.id}`, search: { action: "reject" } })}
          >
            Reject
          </Button>
        </div>
      ),
    },
  ];

  if (error) {
    return (
      <div className="space-y-6">
        <PageHeader title="Admissions" description="Admissions pipeline" />
        <ErrorState title="Failed to load admissions" description={error.message} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Admissions"
        description="Admissions pipeline"
        actions={
          canCreate ? (
            <Button onClick={() => navigate({ to: "/admin/admissions/new" })}>
              <HiOutlinePlus className="mr-2 h-4 w-4" />
              New Admission
            </Button>
          ) : undefined
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Admissions</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{admissions.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              {admissions.filter((a) => a.status === "PENDING").length}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Approved</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              {admissions.filter((a) => a.status === "APPROVED").length}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Rejected</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              {admissions.filter((a) => a.status === "REJECTED").length}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Admissions Pipeline</CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable
            data={admissions}
            columns={columns}
            keyExtractor={(row) => row.id}
            isLoading={isLoading}
            searchable
            searchPlaceholder="Search admissions..."
            onSearchChange={setSearch}
            emptyState={{
              title: "No admissions found",
              description: "Admissions will appear here as they are processed.",
            }}
          />
        </CardContent>
      </Card>
    </div>
  );
}
