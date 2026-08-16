"use client";

import { useState } from "react";
import { PageHeader } from "@/app/components/common/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/app/components/tables/DataTable";
import { StatusBadge } from "@/app/components/common/StatusBadge";
import { ErrorState } from "@/app/components/common/ErrorState";
import { ConfirmDialog } from "@/app/components/common/ConfirmDialog";
import { useNavigate } from "@tanstack/react-router";
import { useDepartments } from "@/app/hooks/queries/useDepartments";
import { useDeleteDepartment } from "@/app/hooks/queries/useDepartments";
import { useAuth } from "@/app/hooks/useAuth";
import { HiOutlinePlus, HiOutlineTrash } from "react-icons/hi2";
import { toast } from "sonner";
import type { Department } from "@/app/types/department";

export function AdminDepartments() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: departments = [], isLoading, error } = useDepartments();
  const deleteMutation = useDeleteDepartment();
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const canCreate = user?.permissions.includes("departments:create");
  const canDelete = user?.permissions.includes("departments:delete");

  const columns = [
    { key: "name", header: "Department Name" },
    { key: "code", header: "Code" },
    {
      key: "headName",
      header: "Head",
      cell: (row: Department) => row.headName || "-",
    },
    {
      key: "description",
      header: "Description",
      cell: (row: Department) => row.description || "-",
    },
    {
      key: "createdAt",
      header: "Created",
      cell: (row: Department) => new Date(row.createdAt).toLocaleDateString(),
    },
    {
      key: "actions",
      header: "Actions",
      cell: (row: Department) => (
        <div className="flex gap-1">
          <Button
            size="sm"
            variant="outline"
            onClick={() => navigate({ to: `/departments/${row.id}` })}
          >
            View
          </Button>
          {canDelete && (
            <Button size="sm" variant="destructive" onClick={() => setDeleteId(row.id)}>
              <HiOutlineTrash className="h-4 w-4" />
            </Button>
          )}
        </div>
      ),
    },
  ];

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteMutation.mutateAsync(deleteId);
      toast.success("Department deleted");
    } catch {
      toast.error("Failed to delete department");
    } finally {
      setDeleteId(null);
    }
  };

  if (error) {
    return (
      <div className="space-y-6">
        <PageHeader title="Departments" description="Manage departments" />
        <ErrorState title="Failed to load departments" description={error.message} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Departments"
        description="Manage departments"
        actions={
          canCreate ? (
            <Button onClick={() => navigate({ to: "/admin/departments/new" })}>
              <HiOutlinePlus className="mr-2 h-4 w-4" />
              Add Department
            </Button>
          ) : undefined
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Departments</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{departments.length}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Departments</CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable
            data={departments}
            columns={columns}
            keyExtractor={(row) => row.id}
            isLoading={isLoading}
            emptyState={{
              title: "No departments found",
              description: "Get started by adding a new department.",
              action: canCreate
                ? {
                    label: "Add Department",
                     onClick: () => navigate({ to: "/admin/departments/new" }),
                  }
                : undefined,
            }}
          />
        </CardContent>
      </Card>

      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={(open) => !open && setDeleteId(null)}
        title="Delete Department"
        description="Are you sure you want to delete this department? This action cannot be undone."
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
        confirmText="Delete"
        variant="destructive"
      />
    </div>
  );
}
