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
      cell: (row: Admission) => <StatusBadge status={row.eligibilityStatus || "PENDING"} />,
    },
    {
      key: "feeStatus",
      header: "Fee Status",
      cell: (row: Admission) => <StatusBadge status={row.feeStatus || "PENDING"} />,
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
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate({ to: "/admissions/$id", params: { id: row.id } })}
        >
          View
        </Button>
      ),
    },
  ];

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
        title="Unable to load admissions"
        description="Please try again later."
        onRetry={() => {}}
      />
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Admissions"
        description="Manage admission applications"
        actions={
          canCreate && (
            <Button onClick={() => navigate({ to: "/admin/admissions/new" })}>
              <HiOutlinePlus className="mr-2 h-4 w-4" />
              New Admission
            </Button>
          )
        }
      />

      <DataTable<Admission>
        data={admissions}
        columns={columns}
        keyExtractor={(row) => row.id}
        searchable
        searchPlaceholder="Search admissions..."
        onSearchChange={setSearch}
      />

      <div className="flex gap-2">
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="rounded-md border px-3 py-1.5 text-sm"
        >
          <option value="ALL">All Status</option>
          <option value="PENDING">Pending</option>
          <option value="APPROVED">Approved</option>
          <option value="REJECTED">Rejected</option>
          <option value="CONFIRMED">Confirmed</option>
        </select>
      </div>
    </div>
  );
}
