"use client";

import { useState } from "react";
import { useSearch, useNavigate } from "@tanstack/react-router";
import { PageHeader } from "@/app/components/common/PageHeader";
import { DataTable } from "@/app/components/tables/DataTable";
import { StatusBadge } from "@/app/components/common/StatusBadge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useDocuments, useDocumentsByApplicant } from "@/app/hooks/queries/useDocuments";
import { useAuth } from "@/app/hooks/useAuth";
import { HiOutlineMagnifyingGlass, HiOutlineCloudArrowUp, HiOutlineEye } from "react-icons/hi2";
import type { Document } from "@/app/types/document";

export function DocumentList() {
  const navigate = useNavigate();
  const search = useSearch({ from: "/documents" }) as { applicantId?: string };
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");

  const { data: documents = [], isLoading } = useDocuments({
    search: searchQuery,
    applicantId: search.applicantId,
  });

  const canUpload = user?.permissions.includes("documents:create");
  const canVerify = user?.permissions.includes("documents:verify");

  const columns = [
    { key: "name", header: "Document Name" },
    {
      key: "type",
      header: "Type",
      cell: (row: Document) => (
        <span className="capitalize">{row.type.toLowerCase().replace("_", " ")}</span>
      ),
    },
    {
      key: "applicantName",
      header: "Applicant",
    },
    {
      key: "status",
      header: "Status",
      cell: (row: Document) => <StatusBadge status={row.status} />,
    },
    {
      key: "createdAt",
      header: "Uploaded",
      cell: (row: Document) => new Date(row.createdAt).toLocaleDateString(),
    },
  ];

  const actions = (row: Document) => [
    {
      label: "View",
      onClick: () => window.open(row.url, "_blank"),
    },
    ...(canVerify && row.status === "UPLOADED"
      ? [
          {
            label: "Verify",
            onClick: async () => {
              await fetch(`/api/v1/documents/${row.id}/verify`, { method: "POST" });
            },
          },
        ]
      : []),
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Documents"
        description="Manage uploaded documents and verification"
        actions={
          canUpload ? (
            <Button onClick={() => navigate({ to: "/documents/upload" })}>
              <HiOutlineCloudArrowUp className="mr-2 h-4 w-4" />
              Upload Document
            </Button>
          ) : undefined
        }
      />

      <DataTable
        data={documents}
        columns={columns}
        keyExtractor={(row) => row.id}
        isLoading={isLoading}
        searchable
        searchPlaceholder="Search documents..."
        onSearchChange={setSearchQuery}
        actions={actions}
        emptyState={{
          title: "No documents found",
          description: "Upload documents to get started.",
          action: canUpload
            ? {
                label: "Upload Document",
                onClick: () => navigate({ to: "/documents/upload" }),
              }
            : undefined,
        }}
      />
    </div>
  );
}
