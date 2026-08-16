"use client";

import { useState } from "react";
import { PageHeader } from "@/app/components/common/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/app/components/tables/DataTable";
import { StatusBadge } from "@/app/components/common/StatusBadge";
import { ErrorState } from "@/app/components/common/ErrorState";
import { useNavigate } from "@tanstack/react-router";
import { useEligibility } from "@/app/hooks/queries/useEligibility";
import { useApplicants } from "@/app/hooks/queries/useApplicants";
import { useAuth } from "@/app/hooks/useAuth";
import { HiOutlineCheckCircle, HiOutlineXCircle, HiOutlineMagnifyingGlass } from "react-icons/hi2";
import type { Eligibility } from "@/app/types/eligibility";

export function AdminEligibility() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");

  const {
    data: eligibility = [],
    isLoading,
    error,
  } = useEligibility({ search, status: statusFilter });
  const { data: applicants = [] } = useApplicants();

  const canUpdate = user?.permissions.includes("eligibility:update");

  const columns = [
    {
      key: "applicantName",
      header: "Applicant",
      cell: (row: Eligibility) => row.applicantName || row.applicantId,
    },
    {
      key: "courseName",
      header: "Course",
      cell: (row: Eligibility) => row.courseName || "-",
    },
    {
      key: "score",
      header: "Score",
      cell: (row: Eligibility) => `${row.score}%`,
    },
    {
      key: "status",
      header: "Status",
      cell: (row: Eligibility) => <StatusBadge status={row.status} />,
    },
    {
      key: "criteria",
      header: "Criteria Met",
      cell: (row: Eligibility) => {
        const total = Object.keys(row.criteria).length;
        const met = Object.values(row.criteria).filter(Boolean).length;
        return `${met}/${total}`;
      },
    },
    {
      key: "reviewedBy",
      header: "Reviewed By",
      cell: (row: Eligibility) => row.reviewedBy || "-",
    },
    {
      key: "createdAt",
      header: "Submitted",
      cell: (row: Eligibility) => new Date(row.createdAt).toLocaleDateString(),
    },
    {
      key: "actions",
      header: "Actions",
      cell: (row: Eligibility) => (
        <div className="flex gap-1">
          <Button
            size="sm"
            variant="outline"
            onClick={() => navigate({ to: `/eligibility/${row.id}` })}
          >
            View
          </Button>
          {canUpdate && (
            <>
              <Button
                size="sm"
                variant="default"
                onClick={() =>
                  navigate({ to: `/eligibility/${row.id}`, search: { action: "approve" } })
                }
              >
                Approve
              </Button>
              <Button
                size="sm"
                variant="destructive"
                onClick={() =>
                  navigate({ to: `/eligibility/${row.id}`, search: { action: "reject" } })
                }
              >
                Reject
              </Button>
            </>
          )}
        </div>
      ),
    },
  ];

  if (error) {
    return (
      <div className="space-y-6">
        <PageHeader title="Eligibility" description="Eligibility checks" />
        <ErrorState title="Failed to load eligibility checks" description={error.message} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Eligibility" description="Eligibility checks" />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Checks</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{eligibility.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Eligible</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              {eligibility.filter((e) => e.status === "ELIGIBLE").length}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Not Eligible</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              {eligibility.filter((e) => e.status === "NOT_ELIGIBLE").length}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              {eligibility.filter((e) => e.status === "PENDING").length}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Eligibility Checks</CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable
            data={eligibility}
            columns={columns}
            keyExtractor={(row) => row.id}
            isLoading={isLoading}
            searchable
            searchPlaceholder="Search eligibility checks..."
            onSearchChange={setSearch}
            emptyState={{
              title: "No eligibility checks found",
              description: "Eligibility checks will appear here.",
            }}
          />
        </CardContent>
      </Card>
    </div>
  );
}
