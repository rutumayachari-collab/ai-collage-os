"use client";

import { PageHeader } from "@/app/components/common/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "@tanstack/react-router";
import { useApplications } from "@/app/hooks/queries/usePlacement";
import { useAuth } from "@/app/hooks/useAuth";
import { HiOutlineBriefcase } from "react-icons/hi2";

export function StudentPlacements() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: applications = [], isLoading, error } = useApplications({ studentId: user?.id });

  if (error) {
    return (
      <div className="space-y-6">
        <PageHeader title="Placements" description="View your placement applications" />
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <HiOutlineBriefcase className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-lg font-medium">Unable to load placement data</p>
            <p className="text-sm text-muted-foreground">Please try again later.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Placements" description="View your placement applications" />

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      ) : applications.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <HiOutlineBriefcase className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-lg font-medium">No Applications</p>
            <p className="text-sm text-muted-foreground">You have not applied to any drives yet.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {applications.map((application) => (
            <Card key={application.id}>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium">
                    {application.companyName || application.driveName}
                  </CardTitle>
                  <Badge
                    variant={
                      application.status === "SELECTED"
                        ? "default"
                        : application.status === "REJECTED"
                          ? "destructive"
                          : "secondary"
                    }
                  >
                    {application.status.replace(/_/g, " ")}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                <p className="text-sm text-muted-foreground">
                  Applied: {new Date(application.appliedDate).toLocaleDateString()}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
