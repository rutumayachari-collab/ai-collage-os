"use client";

import { useState } from "react";
import { PageHeader } from "@/app/components/common/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/app/components/tables/DataTable";
import { StatusBadge } from "@/app/components/common/StatusBadge";
import { ErrorState } from "@/app/components/common/ErrorState";
import { useNavigate } from "@tanstack/react-router";
import { useDocuments } from "@/app/hooks/queries/useDocuments";
import { useAuth } from "@/app/hooks/useAuth";
import { useApplicants } from "@/app/hooks/queries/useApplicants";
import { HiOutlineCheckCircle, HiOutlineXCircle, HiOutlineMagnifyingGlass } from "react-icons/hi2";
import type { Document } from "@/app/types/document";

export function AdminDocuments() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");

  const { data: documents = [], isLoading, error } = useDocuments({ search, status: statusFilter });
  const { data: applicants = [] } = useApplicants();

  const canVerify = user?.permissions.includes("documents:verify");

  const columns = [
    {
      key: "applicantName",
      header: "Applicant",
      cell: (row: Document) => {
        const applicant = applicants.find((a) => a.id === row.applicantId);
        return applicant ? `${applicant.firstName} ${applicant.lastName}` : row.applicantId;
      },
    },
    { key: "name", header: "Document Name" },
    { key: "type", header: "Type" },
    {
      key: "status",
      header: "Status",
      cell: (row: Document) => <StatusBadge status={row.status} />,
    },
    {
      key: "ocrStatus",
      header: "OCR Status",
      cell: (row: Document) => <StatusBadge status={row.ocrStatus || "PENDING"} />,
    },
    {
      key: "priority",
      header: "Priority",
      cell: (row: Document) => row.priority || "-",
    },
    {
      key: "createdAt",
      header: "Uploaded",
      cell: (row: Document) => new Date(row.createdAt).toLocaleDateString(),
    },
    {
      key: "actions",
      header: "Actions",
      cell: (row: Document) => (
        <div className="flex gap-1">
          <Button
            size="sm"
            variant="outline"
            onClick={() => navigate({ to: `/documents/${row.id}` })}
          >
            View
          </Button>
          {canVerify && row.status === "PENDING" && (
            <Button
              size="sm"
              variant="default"
              onClick={() => navigate({ to: `/documents/${row.id}/verify` })}
            >
              Verify
            </Button>
          )}
        </div>
      ),
    },
  ];

  if (error) {
    return (
      <div className="space-y-6">
        <PageHeader title="Documents" description="Document verifications" />
        <ErrorState title="Failed to load documents" description={error.message} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Documents" description="Document verifications" />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Documents</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{documents.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              {documents.filter((d) => d.status === "PENDING").length}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Verified</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              {documents.filter((d) => d.status === "VERIFIED").length}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Rejected</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              {documents.filter((d) => d.status === "REJECTED").length}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Document Verifications</CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable
            data={documents}
            columns={columns}
            keyExtractor={(row) => row.id}
            isLoading={isLoading}
            searchable
            searchPlaceholder="Search documents..."
            onSearchChange={setSearch}
            emptyState={{
              title: "No documents found",
              description: "Uploaded documents will appear here for verification.",
            }}
          />
        </CardContent>
      </Card>
    </div>
  );
}
