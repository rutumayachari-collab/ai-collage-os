"use client";

import { useState } from "react";
import { PageHeader } from "@/app/components/common/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/app/components/tables/DataTable";
import { StatusBadge } from "@/app/components/common/StatusBadge";
import { ErrorState } from "@/app/components/common/ErrorState";
import { useNavigate } from "@tanstack/react-router";
import { useExams } from "@/app/hooks/queries/useExams";
import { useAuth } from "@/app/hooks/useAuth";
import { HiOutlinePlus, HiOutlineAcademicCap } from "react-icons/hi2";
import type { Exam } from "@/app/types/exam";

const EmptyExamsState = () => (
  <div className="flex flex-col items-center justify-center py-12">
    <HiOutlineAcademicCap className="mb-4 h-12 w-12 text-muted-foreground/50" />
    <h3 className="text-lg font-semibold">No exams found</h3>
    <p className="mt-1 text-sm text-muted-foreground">Get started by creating a new exam.</p>
  </div>
);

export function AdminExams() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [search, setSearch] = useState("");

  const { data: exams = [], isLoading, error } = useExams({ search });

  const canCreate = user?.permissions.includes("exams:create");

  const columns = [
    { key: "name", header: "Exam Name" },
    { key: "code", header: "Code" },
    { key: "examType", header: "Type" },
    {
      key: "status",
      header: "Status",
      cell: (row: Exam) => <StatusBadge status={row.status} />,
    },
    {
      key: "scheduledAt",
      header: "Scheduled",
      cell: (row: Exam) => (row.scheduledAt ? new Date(row.scheduledAt).toLocaleDateString() : "-"),
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
        title="Unable to load exams"
        description="Please try again later."
        onRetry={() => {}}
      />
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Exams"
        description="Manage examinations"
        actions={
          canCreate && (
            <Button onClick={() => navigate({ to: "/admin" })}>
              <HiOutlinePlus className="mr-2 h-4 w-4" />
              New Exam
            </Button>
          )
        }
      />

      <DataTable<Exam>
        data={exams}
        columns={columns}
        keyExtractor={(row) => row.id}
        searchable
        searchPlaceholder="Search exams..."
        onSearchChange={setSearch}
        emptyState={{
          icon: HiOutlineAcademicCap,
          title: "No exams found",
          description: "Get started by creating a new exam.",
        }}
      />
    </div>
  );
}
