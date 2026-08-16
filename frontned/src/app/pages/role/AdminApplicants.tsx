"use client";

import { useState } from "react";
import { PageHeader } from "@/app/components/common/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/app/components/tables/DataTable";
import { StatusBadge } from "@/app/components/common/StatusBadge";
import { ErrorState } from "@/app/components/common/ErrorState";
import { useNavigate } from "@tanstack/react-router";
import { useApplicants } from "@/app/hooks/queries/useApplicants";
import { useAdmissions } from "@/app/hooks/queries/useAdmissions";
import { useDocuments } from "@/app/hooks/queries/useDocuments";
import { useEligibilityByApplicant } from "@/app/hooks/queries/useEligibility";
import { usePayments } from "@/app/hooks/queries/usePayments";
import { useAuth } from "@/app/hooks/useAuth";
import {
  HiOutlineEye,
  HiOutlineUserGroup,
  HiOutlineCheckCircle,
  HiOutlineXCircle,
  HiOutlineDocumentText,
  HiOutlineCurrencyRupee,
  HiOutlineAcademicCap,
  HiOutlineMagnifyingGlass,
  HiOutlinePlus,
} from "react-icons/hi2";
import type { Applicant } from "@/app/types/applicant";
import type { Admission } from "@/app/types/admission";

export function AdminApplicants() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");

  const {
    data: applicants = [],
    isLoading,
    error,
  } = useApplicants({ search, status: statusFilter });
  const { data: admissions = [] } = useAdmissions();

  const canCreate = user?.permissions.includes("applications:create");

  const columns = [
    {
      key: "name",
      header: "Name",
      cell: (row: Applicant) => `${row.firstName} ${row.lastName}`,
    },
    { key: "email", header: "Email" },
    { key: "phone", header: "Phone" },
    { key: "courseName", header: "Course" },
    {
      key: "status",
      header: "Status",
      cell: (row: Applicant) => <StatusBadge status={row.status} />,
    },
    {
      key: "eligibilityScore",
      header: "Eligibility",
      cell: (row: Applicant) =>
        row.eligibilityScore !== undefined ? `${row.eligibilityScore}%` : "Pending",
    },
    {
      key: "documentsVerified",
      header: "Documents",
      cell: (row: Applicant) => (
        <StatusBadge status={row.documentsVerified ? "VERIFIED" : "PENDING"} />
      ),
    },
    {
      key: "paymentStatus",
      header: "Payment",
      cell: (row: Applicant) => {
        const admission = admissions.find((a: Admission) => a.applicantId === row.id);
        return <StatusBadge status={admission?.feeStatus || "PENDING"} />;
      },
    },
    {
      key: "counsellor",
      header: "Counsellor",
      cell: () => "-",
    },
    {
      key: "createdAt",
      header: "Created",
      cell: (row: Applicant) => new Date(row.createdAt).toLocaleDateString(),
    },
    {
      key: "updatedAt",
      header: "Updated",
      cell: (row: Applicant) => new Date(row.updatedAt).toLocaleDateString(),
    },
    {
      key: "actions",
      header: "Actions",
      cell: (row: Applicant) => (
        <div className="flex flex-wrap gap-1">
          <Button
            size="sm"
            variant="outline"
            onClick={() => navigate({ to: "/applicants/$id", params: { id: row.id } })}
          >
            View
          </Button>
        </div>
      ),
    },
  ];

  if (error) {
    return (
      <div className="space-y-6">
        <PageHeader title="Applicants" description="Manage all applications" />
        <ErrorState title="Failed to load applicants" description={error.message} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Applicants"
        description="Manage all applications"
        actions={
          canCreate ? (
            <Button onClick={() => navigate({ to: "/applicants/new" })}>
              <HiOutlinePlus className="mr-2 h-4 w-4" />
              New Applicant
            </Button>
          ) : undefined
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Applicants</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{applicants.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              {
                applicants.filter((a) => a.status === "SUBMITTED" || a.status === "UNDER_REVIEW")
                  .length
              }
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Admitted</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              {applicants.filter((a) => a.status === "ADMITTED").length}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Documents Verified</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              {applicants.filter((a) => a.documentsVerified).length}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Applicants</CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable
            data={applicants}
            columns={columns}
            keyExtractor={(row) => row.id}
            isLoading={isLoading}
            searchable
            searchPlaceholder="Search applicants..."
            onSearchChange={setSearch}
            emptyState={{
              title: "No applicants found",
              description: "Get started by creating a new applicant.",
              action: canCreate
                ? {
                    label: "New Applicant",
                    onClick: () => navigate({ to: "/applicants/new" }),
                  }
                : undefined,
            }}
          />
        </CardContent>
      </Card>
    </div>
  );
}
