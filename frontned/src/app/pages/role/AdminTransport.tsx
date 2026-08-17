"use client";

import { useState } from "react";
import { PageHeader } from "@/app/components/common/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/app/components/tables/DataTable";
import { StatusBadge } from "@/app/components/common/StatusBadge";
import { ErrorState } from "@/app/components/common/ErrorState";
import { useNavigate } from "@tanstack/react-router";
import { useTransports, useCreateTransport } from "@/app/hooks/queries/useTransport";
import { useAuth } from "@/app/hooks/useAuth";
import { HiOutlineMap } from "react-icons/hi2";
import type { TransportRoute } from "@/app/types/transport";

export function AdminTransport() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [search, setSearch] = useState("");

  const { data: transports = [], isLoading, error } = useTransports();
  const createTransport = useCreateTransport();

  const routes: TransportRoute[] = transports.flatMap((t) => {
    const transport = t as Record<string, unknown>;
    const routeList = transport?.routes as TransportRoute[] | undefined;
    return routeList || [];
  });

  const filteredRoutes = search
    ? routes.filter(
        (r) =>
          r.routeName?.toLowerCase().includes(search.toLowerCase()) ||
          r.routeCode?.toLowerCase().includes(search.toLowerCase()) ||
          r.startPoint?.toLowerCase().includes(search.toLowerCase()) ||
          r.endPoint?.toLowerCase().includes(search.toLowerCase()),
      )
    : routes;

  const canCreate = user?.permissions.includes("transport:create");

  const columns = [
    { key: "routeName", header: "Route Name" },
    { key: "routeCode", header: "Code" },
    { key: "startPoint", header: "Start" },
    { key: "endPoint", header: "End" },
    {
      key: "isActive",
      header: "Status",
      cell: (row: TransportRoute) => <StatusBadge status={row.isActive ? "ACTIVE" : "INACTIVE"} />,
    },
  ];

  const handleCreateTransport = async () => {
    await createTransport.mutateAsync({
      transportId: `TRANSPORT-${Date.now()}`,
      routes: [],
      vehicles: [],
      drivers: [],
      stops: [],
      studentAssignments: [],
      transportFees: [],
    });
  };

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
        title="Unable to load transport data"
        description="Please try again later."
        onRetry={() => {}}
      />
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Transport"
        description="Manage transport routes and vehicles"
        actions={
          canCreate && (
            <Button onClick={handleCreateTransport}>
              <HiOutlineMap className="mr-2 h-4 w-4" />
              New Transport
            </Button>
          )
        }
      />

      <DataTable<TransportRoute>
        data={filteredRoutes}
        columns={columns}
        keyExtractor={(row) => row.routeId || Math.random().toString()}
        searchable
        searchPlaceholder="Search routes..."
        onSearchChange={setSearch}
        emptyState={{
          icon: HiOutlineMap,
          title: "No routes found",
          description: "Get started by creating a new transport.",
        }}
      />
    </div>
  );
}
