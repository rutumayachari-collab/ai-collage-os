"use client";

import { useParams, useNavigate } from "@tanstack/react-router";
import { PageHeader } from "@/app/components/common/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Timeline } from "@/app/components/common/Timeline";
import { StatusBadge } from "@/app/components/common/StatusBadge";
import { useInquiry } from "@/app/hooks/queries/useInquiries";

const STATUS_EVENTS: Record<string, { title: string; description: string }> = {
  NEW: { title: "Inquiry Created", description: "New inquiry received from website" },
  CONTACTED: { title: "Contacted", description: "Initial contact made with student" },
  QUALIFIED: { title: "Qualified", description: "Student qualified for application" },
  CONVERTED: { title: "Converted to Applicant", description: "Student submitted application" },
  CLOSED: { title: "Closed", description: "Inquiry closed" },
};

export function InquiryDetail() {
  const params = useParams({ from: "/inquiries/$id" });
  const navigate = useNavigate();
  const { data: inquiry, isLoading, error } = useInquiry(params.id);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (error || !inquiry) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <p className="text-destructive">Failed to load inquiry details</p>
        <Button className="mt-4" onClick={() => navigate({ to: "/inquiries" })}>
          Back to Inquiries
        </Button>
      </div>
    );
  }

  const events = [
    {
      id: "1",
      title: "Inquiry Created",
      description: `Inquiry created for ${inquiry.firstName} ${inquiry.lastName}`,
      timestamp: inquiry.createdAt,
      status: "completed" as const,
    },
    ...(inquiry.status !== "NEW"
      ? [
          {
            id: "2",
            title: STATUS_EVENTS[inquiry.status]?.title || "Status Updated",
            description:
              STATUS_EVENTS[inquiry.status]?.description || `Status changed to ${inquiry.status}`,
            timestamp: inquiry.updatedAt,
            status: "completed" as const,
          },
        ]
      : []),
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title={`${inquiry.firstName} ${inquiry.lastName}`}
        description={`Inquiry #${inquiry.id.slice(-8)}`}
        breadcrumb={[{ label: "Inquiries", href: "/inquiries" }, { label: inquiry.id.slice(-8) }]}
        actions={
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => navigate({ to: "/inquiries/$id/edit", params: { id: inquiry.id } })}
            >
              Edit
            </Button>
            <Button onClick={() => navigate({ to: "/applicants/new" })}>
              Convert to Applicant
            </Button>
          </div>
        }
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Inquiry Details</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
              <div>
                <p className="text-sm text-muted-foreground">Email</p>
                <p className="font-medium">{inquiry.email}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Phone</p>
                <p className="font-medium">{inquiry.phone}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Course Interest</p>
                <p className="font-medium">{inquiry.courseInterest}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Status</p>
                <StatusBadge status={inquiry.status} />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Source</p>
                <p className="font-medium capitalize">{inquiry.source}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Created</p>
                <p className="font-medium">{new Date(inquiry.createdAt).toLocaleString()}</p>
              </div>
              {inquiry.assignedTo && (
                <div>
                  <p className="text-sm text-muted-foreground">Assigned To</p>
                  <p className="font-medium">{inquiry.assignedTo}</p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Notes</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                {inquiry.notes || "No notes added yet."}
              </p>
            </CardContent>
          </Card>
        </div>

        <div>
          <Card>
            <CardHeader>
              <CardTitle>Timeline</CardTitle>
            </CardHeader>
            <CardContent>
              <Timeline events={events} />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
