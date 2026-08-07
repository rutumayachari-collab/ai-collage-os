"use client";

import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { PageHeader } from "@/app/components/common/PageHeader";
import { DataTable } from "@/app/components/tables/DataTable";
import { StatusBadge } from "@/app/components/common/StatusBadge";
import { Button } from "@/components/ui/button";
import { useApplicants } from "@/app/hooks/queries/useApplicants";
import { useAuth } from "@/app/hooks/useAuth";
import { HiOutlineMagnifyingGlass, HiOutlinePlus } from "react-icons/hi2";
import type { Applicant } from "@/app/types/applicant";

export function ApplicantList() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const { data: applicants = [], isLoading } = useApplicants({ page, limit: 10, search });

  const canCreate = user?.permissions.includes("applications:create");

  const columns = [
    { key: "firstName", header: "First Name" },
    { key: "lastName", header: "Last Name" },
    { key: "email", header: "Email" },
    { key: "phone", header: "Phone" },
    { key: "courseName", header: "Course" },
    {
      key: "status",
      header: "Status",
      cell: (row: Applicant) => <StatusBadge status={row.status} />,
    },
    {
      key: "documentsVerified",
      header: "Documents",
      cell: (row: Applicant) => (
        <StatusBadge status={row.documentsVerified ? "VERIFIED" : "PENDING"} />
      ),
    },
    {
      key: "createdAt",
      header: "Applied",
      cell: (row: Applicant) => new Date(row.createdAt).toLocaleDateString(),
    },
  ];

  const actions = (row: Applicant) => [
    {
      label: "View",
      onClick: () => navigate({ to: "/applicants/$id", params: { id: row.id } }),
    },
    {
      label: "Documents",
      onClick: () => navigate({ to: "/documents", search: { applicantId: row.id } }),
    },
    {
      label: "Admission Status",
      onClick: () => navigate({ to: "/admissions/$id", params: { id: row.id } }),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Applicants"
        description="Manage student applications"
        actions={
          canCreate ? (
            <Button onClick={() => navigate({ to: "/applicants/new" })}>
              <HiOutlinePlus className="mr-2 h-4 w-4" />
              New Applicant
            </Button>
          ) : undefined
        }
      />

      <DataTable
        data={applicants}
        columns={columns}
        keyExtractor={(row) => row.id}
        isLoading={isLoading}
        searchable
        searchPlaceholder="Search applicants..."
        onSearchChange={setSearch}
        actions={actions}
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
    </div>
  );
}
