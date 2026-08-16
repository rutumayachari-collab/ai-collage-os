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
import { useCourses } from "@/app/hooks/queries/useCourses";
import { useCreateCourse } from "@/app/hooks/queries/useCourses";
import { useDeleteCourse } from "@/app/hooks/queries/useCourses";
import { useAuth } from "@/app/hooks/useAuth";
import { HiOutlinePlus, HiOutlinePencil, HiOutlineTrash } from "react-icons/hi2";
import { toast } from "sonner";
import type { Course } from "@/app/types/course";

export function AdminCourses() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: courses = [], isLoading, error } = useCourses();
  const createMutation = useCreateCourse();
  const deleteMutation = useDeleteCourse();
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const canCreate = user?.permissions.includes("courses:create");
  const canDelete = user?.permissions.includes("courses:delete");

  const columns = [
    { key: "name", header: "Course Name" },
    { key: "code", header: "Code" },
    {
      key: "department",
      header: "Department",
      cell: (row: Course) => row.department?.name || "-",
    },
    { key: "duration", header: "Duration" },
    { key: "seats", header: "Seats" },
    {
      key: "fees",
      header: "Fees",
      cell: (row: Course) => `₹${row.fees.toLocaleString()}`,
    },
    {
      key: "status",
      header: "Status",
      cell: (row: Course) => <StatusBadge status={row.status} />,
    },
    {
      key: "createdAt",
      header: "Created",
      cell: (row: Course) => new Date(row.createdAt).toLocaleDateString(),
    },
    {
      key: "actions",
      header: "Actions",
      cell: (row: Course) => (
        <div className="flex gap-1">
          <Button
            size="sm"
            variant="outline"
            onClick={() => navigate({ to: `/courses/${row.id}` })}
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
      toast.success("Course deleted");
    } catch {
      toast.error("Failed to delete course");
    } finally {
      setDeleteId(null);
    }
  };

  if (error) {
    return (
      <div className="space-y-6">
        <PageHeader title="Courses" description="Manage courses" />
        <ErrorState title="Failed to load courses" description={error.message} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Courses"
        description="Manage courses"
        actions={
          canCreate ? (
            <Button onClick={() => navigate({ to: "/admin/courses/new" })}>
              <HiOutlinePlus className="mr-2 h-4 w-4" />
              Add Course
            </Button>
          ) : undefined
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Courses</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{courses.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Active</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              {courses.filter((c) => c.status === "ACTIVE").length}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Seats</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{courses.reduce((acc, c) => acc + c.seats, 0)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Departments</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              {new Set(courses.map((c) => c.departmentId).filter(Boolean)).size}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Courses</CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable
            data={courses}
            columns={columns}
            keyExtractor={(row) => row.id}
            isLoading={isLoading}
            emptyState={{
              title: "No courses found",
              description: "Get started by adding a new course.",
              action: canCreate
                ? {
                    label: "Add Course",
                     onClick: () => navigate({ to: "/admin/courses/new" }),
                  }
                : undefined,
            }}
          />
        </CardContent>
      </Card>

      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={(open) => !open && setDeleteId(null)}
        title="Delete Course"
        description="Are you sure you want to delete this course? This action cannot be undone."
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
        confirmText="Delete"
        variant="destructive"
      />
    </div>
  );
}
