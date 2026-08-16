"use client";

import { PageHeader } from "@/app/components/common/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "@tanstack/react-router";
import { HiOutlineSparkles, HiOutlineExclamationTriangle } from "react-icons/hi2";

export function CounsellorDashboard() {
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Counsellor Dashboard"
        description="Welcome to the counsellor portal"
        actions={
          <Button onClick={() => navigate({ to: "/outreach" })}>
            <HiOutlineSparkles className="mr-2 h-4 w-4" />
            Calling Agent
          </Button>
        }
      />

      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12 text-center">
          <HiOutlineExclamationTriangle className="h-10 w-10 text-muted-foreground mb-3" />
          <p className="text-sm font-medium">No data available</p>
          <p className="text-xs text-muted-foreground mt-1">
            Counsellor dashboard stats require backend integration.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Review Queues</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <Button
            variant="outline"
            className="h-auto flex-col items-start p-4"
            onClick={() => navigate({ to: "/inquiries" })}
          >
            <HiOutlineSparkles className="h-6 w-6 mb-2" />
            <span className="font-medium">Inquiries</span>
            <span className="text-sm text-muted-foreground">Manage leads</span>
          </Button>
          <Button
            variant="outline"
            className="h-auto flex-col items-start p-4"
            onClick={() => navigate({ to: "/applicants" })}
          >
            <HiOutlineSparkles className="h-6 w-6 mb-2" />
            <span className="font-medium">Applicants</span>
            <span className="text-sm text-muted-foreground">Review applications</span>
          </Button>
          <Button
            variant="outline"
            className="h-auto flex-col items-start p-4"
            onClick={() => navigate({ to: "/faculty/eligibility" })}
          >
            <HiOutlineSparkles className="h-6 w-6 mb-2" />
            <span className="font-medium">Eligibility</span>
            <span className="text-sm text-muted-foreground">Check eligibility</span>
          </Button>
          <Button
            variant="outline"
            className="h-auto flex-col items-start p-4"
            onClick={() => navigate({ to: "/documents" })}
          >
            <HiOutlineSparkles className="h-6 w-6 mb-2" />
            <span className="font-medium">Documents</span>
            <span className="text-sm text-muted-foreground">Verify documents</span>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
