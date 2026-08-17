"use client";

import { useState } from "react";
import { PageHeader } from "@/app/components/common/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/app/components/tables/DataTable";
import { StatusBadge } from "@/app/components/common/StatusBadge";
import { ErrorState } from "@/app/components/common/ErrorState";
import { useNavigate } from "@tanstack/react-router";
import { useBooks } from "@/app/hooks/queries/useLibrary";
import { useAuth } from "@/app/hooks/useAuth";
import { HiOutlinePlus, HiOutlineBookOpen } from "react-icons/hi2";
import type { Book } from "@/app/types/library";

export function AdminLibrary() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [search, setSearch] = useState("");

  const { data: books = [], isLoading, error } = useBooks({ search });

  const canCreate = user?.permissions.includes("library:create");

  const columns = [
    { key: "title", header: "Title" },
    { key: "author", header: "Author" },
    { key: "isbn", header: "ISBN" },
    {
      key: "availableCopies",
      header: "Available",
      cell: (row: Book) => `${row.availableCopies}/${row.totalCopies}`,
    },
    {
      key: "isActive",
      header: "Status",
      cell: (row: Book) => <StatusBadge status={row.isActive ? "ACTIVE" : "INACTIVE"} />,
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
        title="Unable to load books"
        description="Please try again later."
        onRetry={() => {}}
      />
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Library"
        description="Manage library books"
        actions={
          canCreate && (
            <Button onClick={() => navigate({ to: "/admin" })}>
              <HiOutlinePlus className="mr-2 h-4 w-4" />
              Add Book
            </Button>
          )
        }
      />

      <DataTable<Book>
        data={books}
        columns={columns}
        keyExtractor={(row) => row.id}
        searchable
        searchPlaceholder="Search books..."
        onSearchChange={setSearch}
        emptyState={{
          icon: HiOutlineBookOpen,
          title: "No books found",
          description: "Get started by adding a new book.",
        }}
      />
    </div>
  );
}
