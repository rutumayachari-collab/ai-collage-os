"use client";

import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { PageHeader } from "@/app/components/common/PageHeader";
import { DataTable } from "@/app/components/tables/DataTable";
import { StatusBadge } from "@/app/components/common/StatusBadge";
import { Button } from "@/components/ui/button";
import { useReviewQueue } from "@/app/hooks/queries/useFaculty";
import { HiOutlineMagnifyingGlass } from "react-icons/hi2";
import type { ReviewItem } from "@/app/types/faculty";

export function AdmissionQueue() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const { data: items = [], isLoading } = useReviewQueue("admissions");

  const columns = [
    { key: "applicantName", header: "Applicant" },
    { key: "course", header: "Course" },
    {
      key: "status",
      header: "Status",
      cell: (row: ReviewItem) => <StatusBadge status={row.status} />,
    },
    {
      key: "submittedAt",
      header: "Submitted",
      cell: (row: ReviewItem) => new Date(row.submittedAt).toLocaleDateString(),
    },
  ];

  const actions = (row: ReviewItem) => [
    {
      label: "View Admission",
      onClick: () => navigate({ to: "/admissions/$id", params: { id: row.applicantId } }),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader title="Admission Queue" description="Review and process admission applications" />

      <DataTable
        data={items}
        columns={columns}
        keyExtractor={(row) => row.id}
        isLoading={isLoading}
        searchable
        searchPlaceholder="Search admissions..."
        onSearchChange={setSearch}
        actions={actions}
        emptyState={{
          title: "No admissions pending",
          description: "All applications have been processed.",
        }}
      />
    </div>
  );
}
