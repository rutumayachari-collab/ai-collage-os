"use client";

import { useState } from "react";
import { PageHeader } from "@/app/components/common/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/app/components/tables/DataTable";
import { StatusBadge } from "@/app/components/common/StatusBadge";
import { ErrorState } from "@/app/components/common/ErrorState";
import { useNavigate } from "@tanstack/react-router";
import { useHostels } from "@/app/hooks/queries/useHostel";
import { useAuth } from "@/app/hooks/useAuth";
import { HiOutlinePlus, HiOutlineBuildingOffice } from "react-icons/hi2";
import type { Hostel } from "@/app/types/hostel";

export function AdminHostel() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [search, setSearch] = useState("");

  const { data: hostels = [], isLoading, error } = useHostels({ search });

  const canCreate = user?.permissions.includes("hostel:create");

  const columns = [
    { key: "name", header: "Hostel Name" },
    { key: "type", header: "Type" },
    { key: "warden", header: "Warden" },
    { key: "contactPhone", header: "Contact" },
    {
      key: "occupiedRooms",
      header: "Occupancy",
      cell: (row: Hostel) => `${row.occupiedRooms}/${row.totalRooms}`,
    },
    {
      key: "isActive",
      header: "Status",
      cell: (row: Hostel) => <StatusBadge status={row.isActive ? "ACTIVE" : "INACTIVE"} />,
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
        title="Unable to load hostels"
        description="Please try again later."
        onRetry={() => {}}
      />
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Hostels"
        description="Manage hostel facilities"
        actions={
          canCreate && (
            <Button onClick={() => navigate({ to: "/admin" })}>
              <HiOutlinePlus className="mr-2 h-4 w-4" />
              New Hostel
            </Button>
          )
        }
      />

      <DataTable<Hostel>
        data={hostels}
        columns={columns}
        keyExtractor={(row) => row.id}
        searchable
        searchPlaceholder="Search hostels..."
        onSearchChange={setSearch}
        emptyState={{
          icon: HiOutlineBuildingOffice,
          title: "No hostels found",
          description: "Get started by creating a new hostel.",
        }}
      />
    </div>
  );
}
