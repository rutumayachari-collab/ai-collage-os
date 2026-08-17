"use client";

import { useState } from "react";
import { PageHeader } from "@/app/components/common/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/app/components/tables/DataTable";
import { StatusBadge } from "@/app/components/common/StatusBadge";
import { ErrorState } from "@/app/components/common/ErrorState";
import { useNavigate } from "@tanstack/react-router";
import { useDrives } from "@/app/hooks/queries/usePlacement";
import { useAuth } from "@/app/hooks/useAuth";
import { HiOutlinePlus, HiOutlineBriefcase } from "react-icons/hi2";
import type { Drive } from "@/app/types/placement";

export function AdminPlacements() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [search, setSearch] = useState("");

  const { data: drives = [], isLoading, error } = useDrives({ search });

  const canCreate = user?.permissions.includes("placement:create");

  const columns = [
    { key: "driveName", header: "Drive Name" },
    { key: "companyName", header: "Company" },
    {
      key: "driveDate",
      header: "Drive Date",
      cell: (row: Drive) => new Date(row.driveDate).toLocaleDateString(),
    },
    {
      key: "status",
      header: "Status",
      cell: (row: Drive) => <StatusBadge status={row.status} />,
    },
    { key: "driveType", header: "Type" },
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
        title="Unable to load placement drives"
        description="Please try again later."
        onRetry={() => {}}
      />
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Placements"
        description="Manage placement drives"
        actions={
          canCreate && (
            <Button onClick={() => navigate({ to: "/admin" })}>
              <HiOutlinePlus className="mr-2 h-4 w-4" />
              New Drive
            </Button>
          )
        }
      />

      <DataTable<Drive>
        data={drives}
        columns={columns}
        keyExtractor={(row) => row.id}
        searchable
        searchPlaceholder="Search drives..."
        onSearchChange={setSearch}
        emptyState={{
          icon: HiOutlineBriefcase,
          title: "No drives found",
          description: "Get started by creating a new drive.",
        }}
      />
    </div>
  );
}
