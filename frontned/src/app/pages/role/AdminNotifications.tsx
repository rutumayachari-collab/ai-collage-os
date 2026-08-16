"use client";

import { useState } from "react";
import { PageHeader } from "@/app/components/common/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/app/components/tables/DataTable";
import { StatusBadge } from "@/app/components/common/StatusBadge";
import { ErrorState } from "@/app/components/common/ErrorState";
import { useNavigate } from "@tanstack/react-router";
import { useNotifications } from "@/app/hooks/queries/useNotifications";
import { useNotificationStats } from "@/app/hooks/queries/useNotifications";
import { useAuth } from "@/app/hooks/useAuth";
import { HiOutlineBell, HiOutlineMagnifyingGlass } from "react-icons/hi2";
import type { Notification } from "@/app/types/notification";

export function AdminNotifications() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");

  const {
    data: notificationsData,
    isLoading,
    error,
  } = useNotifications({ search, status: statusFilter });
  const { data: stats } = useNotificationStats(user?.id);

  const notifications = notificationsData?.items || [];
  const canSend = user?.permissions.includes("notifications:create");

  const columns = [
    {
      key: "recipient",
      header: "Recipient",
      cell: (row: Notification) => row.recipient.userRole,
    },
    {
      key: "subject",
      header: "Subject",
      cell: (row: Notification) => row.payload.subject,
    },
    { key: "channel", header: "Channel" },
    {
      key: "priority",
      header: "Priority",
      cell: (row: Notification) => <StatusBadge status={row.payload.priority} />,
    },
    {
      key: "type",
      header: "Type",
      cell: (row: Notification) => <StatusBadge status={row.payload.type} />,
    },
    {
      key: "status",
      header: "Status",
      cell: (row: Notification) => <StatusBadge status={row.status} />,
    },
    {
      key: "createdAt",
      header: "Sent At",
      cell: (row: Notification) => new Date(row.createdAt).toLocaleString(),
    },
    {
      key: "actions",
      header: "Actions",
      cell: (row: Notification) => (
        <Button
          size="sm"
          variant="outline"
          onClick={() => navigate({ to: `/notifications/${row.notificationId}` })}
        >
          View
        </Button>
      ),
    },
  ];

  if (error) {
    return (
      <div className="space-y-6">
        <PageHeader title="Notifications" description="Notification management" />
        <ErrorState title="Failed to load notifications" description={error.message} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Notifications"
        description="Notification management"
        actions={
          canSend ? (
            <Button onClick={() => navigate({ to: "/admin/notifications/new" })}>
              <HiOutlineBell className="mr-2 h-4 w-4" />
              Send Notification
            </Button>
          ) : undefined
        }
      />

      {stats && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{stats.total}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Unread</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{stats.unread}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Read</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{stats.read}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Failed</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{stats.failed}</p>
            </CardContent>
          </Card>
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>All Notifications</CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable
            data={notifications}
            columns={columns}
            keyExtractor={(row) => row.notificationId}
            isLoading={isLoading}
            searchable
            searchPlaceholder="Search notifications..."
            onSearchChange={setSearch}
            emptyState={{
              title: "No notifications found",
              description: "Notifications will appear here.",
            }}
          />
        </CardContent>
      </Card>
    </div>
  );
}
