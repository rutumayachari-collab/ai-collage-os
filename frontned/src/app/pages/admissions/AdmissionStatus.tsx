"use client";

import { useParams, useNavigate } from "@tanstack/react-router";
import { PageHeader } from "@/app/components/common/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/app/components/common/StatusBadge";
import { useAdmission } from "@/app/hooks/queries/useAdmissions";

export function AdmissionStatus() {
  const params = useParams({ from: "/admissions/$id" });
  const navigate = useNavigate();
  const { data: admission, isLoading, error } = useAdmission(params.id);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (error || !admission) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <p className="text-destructive">Failed to load admission status</p>
        <Button className="mt-4" onClick={() => navigate({ to: "/dashboard" })}>
          Back to Dashboard
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Admission Status`}
        description={`Admission #${admission.id.slice(-8)}`}
        breadcrumb={[
          { label: "Admissions", href: "/admissions" },
          { label: admission.id.slice(-8) },
        ]}
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Admission Details</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Detailed stage tracking will be available when the backend provides admission stage
                data.
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Status Overview</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground">Admission Status</p>
                <StatusBadge status={admission.status} />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
