"use client";

import { useState } from "react";
import { PageHeader } from "@/app/components/common/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/app/components/tables/DataTable";
import { StatusBadge } from "@/app/components/common/StatusBadge";
import { ErrorState } from "@/app/components/common/ErrorState";
import { useNavigate } from "@tanstack/react-router";
import { useFeeStructures } from "@/app/hooks/queries/useFees";
import { useAuth } from "@/app/hooks/useAuth";
import { HiOutlinePlus, HiOutlineCurrencyRupee } from "react-icons/hi2";
import type { FeeStructure } from "@/app/types/fee";

export function AdminFees() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [search, setSearch] = useState("");

  const { data: structures = [], isLoading, error } = useFeeStructures({ search });

  const canCreate = user?.permissions.includes("fees:create");

  const columns = [
    { key: "courseName", header: "Course" },
    { key: "departmentId", header: "Department" },
    { key: "academicYear", header: "Academic Year" },
    { key: "semester", header: "Semester" },
    {
      key: "totalAmount",
      header: "Total Amount",
      cell: (row: FeeStructure) => `₹${row.totalAmount.toLocaleString()}`,
    },
    {
      key: "isActive",
      header: "Status",
      cell: (row: FeeStructure) => <StatusBadge status={row.isActive ? "ACTIVE" : "INACTIVE"} />,
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
        title="Unable to load fee structures"
        description="Please try again later."
        onRetry={() => {}}
      />
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Fee Structures"
        description="Manage course fee structures"
        actions={
          canCreate && (
            <Button onClick={() => navigate({ to: "/admin" })}>
              <HiOutlinePlus className="mr-2 h-4 w-4" />
              New Fee Structure
            </Button>
          )
        }
      />

      <DataTable<FeeStructure>
        data={structures}
        columns={columns}
        keyExtractor={(row) => row.id}
        searchable
        searchPlaceholder="Search fee structures..."
        onSearchChange={setSearch}
        emptyState={{
          icon: HiOutlineCurrencyRupee,
          title: "No fee structures found",
          description: "Get started by creating a new fee structure.",
        }}
      />
    </div>
  );
}
