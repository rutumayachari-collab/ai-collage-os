"use client";

import { PageHeader } from "@/app/components/common/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DataTable } from "@/app/components/tables/DataTable";
import { StatusBadge } from "@/app/components/common/StatusBadge";
import { useNavigate } from "@tanstack/react-router";
import { useInquiries } from "@/app/hooks/queries/useInquiries";
import { useAuth } from "@/app/hooks/useAuth";
import { toast } from "sonner";
import {
  HiOutlineUserGroup,
  HiOutlinePhone,
  HiOutlineEnvelope,
  HiOutlineAcademicCap,
  HiOutlineCalendar,
  HiOutlineChatBubbleLeftRight,
  HiOutlineDocumentText,
} from "react-icons/hi2";

type InquiryRow = {
  id: string;
  name: string;
  email: string;
  phone: string;
  course: string;
  status: string;
  lastContact: string;
  nextFollowUp: string;
  assignedCounsellor: string;
};

export function CounsellorLeads() {
  const navigate = useNavigate();
  const { data: inquiries, isLoading, error, refetch } = useInquiries();
  const { user } = useAuth();

  const rows: InquiryRow[] = (inquiries ?? []).map((inq) => ({
    id: inq.id,
    name: `${inq.firstName} ${inq.lastName}`,
    email: inq.email,
    phone: inq.phone,
    course: inq.courseInterest,
    status: inq.status,
    lastContact: inq.updatedAt,
    nextFollowUp: "Not scheduled",
    assignedCounsellor: inq.assignedTo || "Unassigned",
  }));

  const columns = [
    {
      key: "name",
      header: "Name",
      cell: (row: InquiryRow) => (
        <div className="flex items-center gap-2">
          <div className="rounded-md bg-primary/10 p-1.5">
            <HiOutlineUserGroup className="h-4 w-4 text-primary" />
          </div>
          <div>
            <p className="font-medium text-sm">{row.name}</p>
            <p className="text-xs text-muted-foreground">{row.email}</p>
          </div>
        </div>
      ),
    },
    {
      key: "phone",
      header: "Phone",
      cell: (row: InquiryRow) => <span className="font-mono text-xs">{row.phone}</span>,
    },
    {
      key: "course",
      header: "Course",
      cell: (row: InquiryRow) => <span className="text-sm">{row.course}</span>,
    },
    {
      key: "status",
      header: "Status",
      cell: (row: InquiryRow) => <StatusBadge status={row.status} />,
    },
    {
      key: "lastContact",
      header: "Last Contact",
      cell: (row: InquiryRow) => (
        <span className="text-xs text-muted-foreground">
          {row.lastContact ? new Date(row.lastContact).toLocaleDateString() : "N/A"}
        </span>
      ),
    },
    {
      key: "nextFollowUp",
      header: "Next Follow-up",
      cell: (row: InquiryRow) => (
        <span className="text-xs text-muted-foreground">{row.nextFollowUp}</span>
      ),
    },
    {
      key: "assignedCounsellor",
      header: "Assigned Counsellor",
      cell: (row: InquiryRow) => (
        <span className="text-xs">{row.assignedCounsellor}</span>
      ),
    },
    {
      key: "actions",
      header: "Actions",
      cell: (row: InquiryRow) => (
        <div className="flex items-center gap-1">
          <Button size="sm" variant="ghost" onClick={() => navigate({ to: `/inquiries/${row.id}` })}>
            <HiOutlineDocumentText className="h-4 w-4" />
          </Button>
          <Button size="sm" variant="ghost" onClick={() => navigate({ to: "/outreach" })}>
            <HiOutlinePhone className="h-4 w-4" />
          </Button>
          <Button size="sm" variant="ghost" onClick={() => navigate({ to: "/counsellor/followups" })}>
            <HiOutlineCalendar className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];

  if (error) {
    return (
      <div className="space-y-6">
        <PageHeader title="Leads" description="Manage your leads and inquiries" />
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-sm text-destructive">Failed to load leads. Please try again.</p>
            <Button className="mt-4" onClick={() => refetch()}>
              Retry
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Leads"
        description="Manage your leads and inquiries"
        actions={
          <Button onClick={() => navigate({ to: "/inquiries/new" })}>
            <HiOutlineUserGroup className="mr-2 h-4 w-4" />
            Add Lead
          </Button>
        }
      />

      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium">All Leads</CardTitle>
            <span className="text-xs text-muted-foreground">
              {rows.length} {rows.length === 1 ? "lead" : "leads"}
            </span>
          </div>
        </CardHeader>
        <CardContent>
          <DataTable
            data={rows}
            columns={columns}
            keyExtractor={(row) => row.id}
            isLoading={isLoading}
            searchable
            searchPlaceholder="Search leads..."
            emptyState={{
              icon: HiOutlineUserGroup,
              title: "No leads found",
              description: "Get started by adding a new lead inquiry.",
              action: {
                label: "Add Lead",
                onClick: () => navigate({ to: "/inquiries/new" }),
              },
            }}
          />
        </CardContent>
      </Card>

      <Card className="border-amber-500/30 bg-amber-500/5">
        <CardHeader>
          <CardTitle className="text-sm font-medium text-amber-600">Backend Integration Notes</CardTitle>
        </CardHeader>
        <CardContent className="text-xs text-muted-foreground space-y-1">
          <p>• <strong>Lead Score</strong>: Backend does not provide lead scores. The Inquiry type has no leadScore field.</p>
          <p>• <strong>Last Contact</strong>: Displayed from the updatedAt timestamp. A dedicated lastContactAt field is not available.</p>
          <p>• <strong>Next Follow-up</strong>: The inquiry follow-up scheduling endpoint is not yet available.</p>
          <p>• <strong>Assigned Counsellor</strong>: Displayed from the assignedTo field on Inquiry.</p>
          <p>• <strong>Status Mapping</strong>: Backend uses NEW | CONTACTED | QUALIFIED | CONVERTED | CLOSED. The requested statuses (Interested, Application Started, Application Submitted, Not Interested, Lost) require a backend enum update.</p>
        </CardContent>
      </Card>
    </div>
  );
}
