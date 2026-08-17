"use client";

import { PageHeader } from "@/app/components/common/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "@tanstack/react-router";
import { useTransportAssignments } from "@/app/hooks/queries/useTransport";
import { useAuth } from "@/app/hooks/useAuth";
import { HiOutlineMap } from "react-icons/hi2";

export function StudentTransport() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const {
    data: assignments = [],
    isLoading,
    error,
  } = useTransportAssignments({ studentId: user?.id });

  if (error) {
    return (
      <div className="space-y-6">
        <PageHeader title="Transport" description="View your transport allocation" />
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <HiOutlineMap className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-lg font-medium">Unable to load transport information</p>
            <p className="text-sm text-muted-foreground">Please try again later.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Transport" description="View your transport allocation" />

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      ) : assignments.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <HiOutlineMap className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-lg font-medium">No Transport Allocated</p>
            <p className="text-sm text-muted-foreground">
              You have not been assigned to any transport route.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {assignments.map((assignment) => (
            <Card key={assignment.id}>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium">{assignment.routeName}</CardTitle>
                  <Badge variant={assignment.status === "ACTIVE" ? "default" : "secondary"}>
                    {assignment.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                <p className="text-sm text-muted-foreground">Stop: {assignment.stopName}</p>
                <p className="text-sm text-muted-foreground">
                  Vehicle: {assignment.vehicleNumber || "N/A"}
                </p>
                <p className="text-sm text-muted-foreground">
                  Boarding: {assignment.boardingPoint}
                </p>
                <p className="text-sm text-muted-foreground">Fee: ₹{assignment.feeAmount}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
