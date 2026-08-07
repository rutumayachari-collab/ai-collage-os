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

export function EligibilityQueue() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const { data: items = [], isLoading } = useReviewQueue("eligibility");

  const columns = [
    { key: "applicantName", header: "Applicant" },
    { key: "course", header: "Course" },
    {
      key: "score",
      header: "Score",
      cell: (row: ReviewItem) => (row.score ? `${row.score}%` : "-"),
    },
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
      label: "Check Eligibility",
      onClick: () =>
        navigate({ to: "/eligibility/$applicantId", params: { applicantId: row.applicantId } }),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader title="Eligibility Queue" description="Review and verify applicant eligibility" />

      <DataTable
        data={items}
        columns={columns}
        keyExtractor={(row) => row.id}
        isLoading={isLoading}
        searchable
        searchPlaceholder="Search eligibility..."
        onSearchChange={setSearch}
        actions={actions}
        emptyState={{
          title: "No eligibility checks pending",
          description: "All applicants have been reviewed.",
        }}
      />
    </div>
  );
}
