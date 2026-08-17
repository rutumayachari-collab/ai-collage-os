"use client";

import { PageHeader } from "@/app/components/common/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DataTable } from "@/app/components/tables/DataTable";
import { useNavigate } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import {
  HiOutlineCalendar,
  HiOutlineUserGroup,
  HiOutlineCheckCircle,
  HiOutlineClock,
  HiOutlinePlus,
} from "react-icons/hi2";

type FollowUpRow = {
  id: string;
  candidateName: string;
  phone: string;
  scheduledDate: string;
  scheduledTime: string;
  type: string;
  status: string;
  notes: string;
};

export function CounsellorFollowups() {
  const navigate = useNavigate();
  const [filter, setFilter] = useState<"all" | "pending" | "completed">("all");

  const followups: FollowUpRow[] = useMemo(
    () => [
      {
        id: "1",
        candidateName: "Rahul Sharma",
        phone: "+91 98765 43210",
        scheduledDate: "2025-08-15",
        scheduledTime: "10:00 AM",
        type: "Call",
        status: "PENDING",
        notes: "Follow up on admission interest",
      },
      {
        id: "2",
        candidateName: "Priya Patel",
        phone: "+91 87654 32109",
        scheduledDate: "2025-08-15",
        scheduledTime: "02:00 PM",
        type: "Call",
        status: "PENDING",
        notes: "Discuss scholarship options",
      },
      {
        id: "3",
        candidateName: "Amit Kumar",
        phone: "+91 76543 21098",
        scheduledDate: "2025-08-16",
        scheduledTime: "11:00 AM",
        type: "Meeting",
        status: "SCHEDULED",
        notes: "Campus visit follow up",
      },
      {
        id: "4",
        candidateName: "Sneha Gupta",
        phone: "+91 65432 10987",
        scheduledDate: "2025-08-14",
        scheduledTime: "04:00 PM",
        type: "Call",
        status: "COMPLETED",
        notes: "Initial inquiry discussion",
      },
    ],
    [],
  );

  const filtered = followups.filter((f) => {
    if (filter === "all") return true;
    if (filter === "pending") return f.status === "PENDING" || f.status === "SCHEDULED";
    return f.status === "COMPLETED";
  });

  const getStatusVariant = (status: string) => {
    switch (status) {
      case "SCHEDULED":
        return "secondary";
      case "PENDING":
        return "outline";
      case "COMPLETED":
        return "default";
      case "CANCELLED":
        return "destructive";
      default:
        return "outline";
    }
  };

  const columns = [
    {
      key: "candidateName",
      header: "Candidate",
      cell: (row: FollowUpRow) => (
        <div>
          <p className="font-medium text-sm">{row.candidateName}</p>
          <p className="text-xs text-muted-foreground">{row.phone}</p>
        </div>
      ),
    },
    {
      key: "scheduledDate",
      header: "Date",
      cell: (row: FollowUpRow) => (
        <span className="text-xs text-muted-foreground">
          {new Date(row.scheduledDate).toLocaleDateString()}
        </span>
      ),
    },
    {
      key: "scheduledTime",
      header: "Time",
      cell: (row: FollowUpRow) => <span className="text-xs">{row.scheduledTime}</span>,
    },
    {
      key: "type",
      header: "Type",
      cell: (row: FollowUpRow) => <Badge variant="outline">{row.type}</Badge>,
    },
    {
      key: "status",
      header: "Status",
      cell: (row: FollowUpRow) => (
        <Badge variant={getStatusVariant(row.status)}>{row.status}</Badge>
      ),
    },
    {
      key: "notes",
      header: "Notes",
      cell: (row: FollowUpRow) => (
        <span className="text-xs text-muted-foreground truncate max-w-[200px] block">
          {row.notes}
        </span>
      ),
    },
    {
      key: "actions",
      header: "Actions",
      cell: (row: FollowUpRow) => (
        <div className="flex items-center gap-1">
          {(row.status === "PENDING" || row.status === "SCHEDULED") && (
            <Button size="sm" variant="outline" onClick={() => navigate({ to: "/outreach" })}>
              <HiOutlineCheckCircle className="mr-1 h-4 w-4" />
              Complete
            </Button>
          )}
          {row.status === "COMPLETED" && (
            <Badge variant="default" className="text-xs">
              Done
            </Badge>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Follow-ups"
        description="Manage your follow-up schedule"
        actions={
          <Button onClick={() => navigate({ to: "/inquiries/new" })}>
            <HiOutlinePlus className="mr-2 h-4 w-4" />
            Schedule Follow-up
          </Button>
        }
      />

      <div className="flex items-center gap-2">
        <Button
          size="sm"
          variant={filter === "all" ? "default" : "outline"}
          onClick={() => setFilter("all")}
        >
          All
        </Button>
        <Button
          size="sm"
          variant={filter === "pending" ? "default" : "outline"}
          onClick={() => setFilter("pending")}
        >
          Pending
        </Button>
        <Button
          size="sm"
          variant={filter === "completed" ? "default" : "outline"}
          onClick={() => setFilter("completed")}
        >
          Completed
        </Button>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium">Follow-up Schedule</CardTitle>
            <span className="text-xs text-muted-foreground">
              {filtered.length} {filtered.length === 1 ? "item" : "items"}
            </span>
          </div>
        </CardHeader>
        <CardContent>
          <DataTable
            data={filtered}
            columns={columns}
            keyExtractor={(row) => row.id}
            searchable
            searchPlaceholder="Search follow-ups..."
            emptyState={{
              icon: HiOutlineCalendar,
              title: "No follow-ups found",
              description: "Schedule a new follow-up to get started.",
              action: {
                label: "Schedule Follow-up",
                onClick: () => navigate({ to: "/inquiries/new" }),
              },
            }}
          />
        </CardContent>
      </Card>

      <Card className="border-amber-500/30 bg-amber-500/5">
        <CardHeader>
          <CardTitle className="text-sm font-medium text-amber-600">
            Backend Integration Note
          </CardTitle>
        </CardHeader>
        <CardContent className="text-xs text-muted-foreground space-y-1">
          <p>
            • <strong>Follow-up API</strong>: The dedicated inquiry follow-up scheduling endpoint is
            not yet available. The current UI displays static follow-up data for demonstration.
          </p>
          <p>
            • <strong>Create/Update/Delete Follow-ups</strong>: Requires a new backend service and
            endpoint (e.g., POST /inquiries/:id/followups, GET /inquiries/followups).
          </p>
          <p>
            • <strong>Reminders</strong>: Push notification or email reminder triggers for upcoming
            follow-ups require backend scheduling support.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
