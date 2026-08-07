"use client";

import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { PageHeader } from "@/app/components/common/PageHeader";
import { DataTable } from "@/app/components/tables/DataTable";
import { StatusBadge } from "@/app/components/common/StatusBadge";
import { Button } from "@/components/ui/button";
import { useInquiries } from "@/app/hooks/queries/useInquiries";
import { useAuth } from "@/app/hooks/useAuth";
import { HiOutlineMagnifyingGlass, HiOutlinePlus } from "react-icons/hi2";
import type { Inquiry } from "@/app/types/inquiry";

export function InquiryList() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const { data: inquiries = [], isLoading } = useInquiries({ page, limit: 10, search });

  const canCreate = user?.permissions.includes("inquiries:create");

  const columns = [
    { key: "firstName", header: "First Name" },
    { key: "lastName", header: "Last Name" },
    { key: "email", header: "Email" },
    { key: "phone", header: "Phone" },
    { key: "courseInterest", header: "Course Interest" },
    {
      key: "status",
      header: "Status",
      cell: (row: Inquiry) => <StatusBadge status={row.status} />,
    },
    {
      key: "createdAt",
      header: "Created",
      cell: (row: Inquiry) => new Date(row.createdAt).toLocaleDateString(),
    },
  ];

  const actions = (row: Inquiry) => [
    {
      label: "View",
      onClick: () => navigate({ to: "/inquiries/$id", params: { id: row.id } }),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Inquiries"
        description="Manage student inquiries and leads"
        actions={
          canCreate ? (
            <Button onClick={() => navigate({ to: "/inquiries/new" })}>
              <HiOutlinePlus className="mr-2 h-4 w-4" />
              New Inquiry
            </Button>
          ) : undefined
        }
      />

      <DataTable
        data={inquiries}
        columns={columns}
        keyExtractor={(row) => row.id}
        isLoading={isLoading}
        searchable
        searchPlaceholder="Search inquiries..."
        onSearchChange={setSearch}
        actions={actions}
        emptyState={{
          title: "No inquiries found",
          description: "Get started by creating a new inquiry.",
          action: canCreate
            ? {
                label: "New Inquiry",
                onClick: () => navigate({ to: "/inquiries/new" }),
              }
            : undefined,
        }}
      />
    </div>
  );
}
