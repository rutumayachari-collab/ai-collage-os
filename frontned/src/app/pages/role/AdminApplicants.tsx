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
    {
      key: "status",
      header: "Status",
      cell: (row: Applicant) => <StatusBadge status={row.status} />,
    },
    {
      key: "eligibilityScore",
      header: "Eligibility",
      cell: (row: Applicant) =>
        row.aiEligibilityScore !== undefined ? `${row.aiEligibilityScore}%` : "Pending",
    },
    {
      key: "documentsVerified",
      header: "Documents",
      cell: (row: Applicant) => (
        <StatusBadge status={row.admissionChecklist?.documentsVerified ? "VERIFIED" : "PENDING"} />
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
      key: "actions",
      header: "Actions",
      cell: (row: Applicant) => (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate({ to: "/applicants/$id", params: { id: row.id } })}
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
        title="Unable to load applicants"
        description="Please try again later."
        onRetry={() => {}}
      />
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Applicants"
        description="Manage applicant records"
        actions={
          canCreate && (
            <Button onClick={() => navigate({ to: "/applicants/new" })}>
              <HiOutlinePlus className="mr-2 h-4 w-4" />
              New Applicant
            </Button>
          )
        }
      />

      <DataTable<Applicant>
        data={applicants}
        columns={columns}
        keyExtractor={(row) => row.id}
        searchable
        searchPlaceholder="Search applicants..."
        onSearchChange={setSearch}
      />

      <div className="flex gap-2">
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="rounded-md border px-3 py-1.5 text-sm"
        >
          <option value="ALL">All Status</option>
          <option value="NEW">New</option>
          <option value="DOCUMENTS_VERIFIED">Documents Verified</option>
          <option value="ELIGIBLE">Eligible</option>
          <option value="INTERVIEW_SCHEDULED">Interview Scheduled</option>
          <option value="INTERVIEWED">Interviewed</option>
          <option value="SELECTED">Selected</option>
          <option value="OFFERED">Offered</option>
          <option value="ADMITTED">Admitted</option>
          <option value="REJECTED">Rejected</option>
        </select>
      </div>
    </div>
  );
}
