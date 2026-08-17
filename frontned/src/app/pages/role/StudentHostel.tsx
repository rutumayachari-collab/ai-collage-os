"use client";

import { PageHeader } from "@/app/components/common/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "@tanstack/react-router";
import { useHostels } from "@/app/hooks/queries/useHostel";
import { useAuth } from "@/app/hooks/useAuth";
import { HiOutlineBuildingOffice } from "react-icons/hi2";

export function StudentHostel() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: hostels = [], isLoading, error } = useHostels({ studentId: user?.id });

  if (error) {
    return (
      <div className="space-y-6">
        <PageHeader title="Hostel" description="View your hostel allocation" />
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <HiOutlineBuildingOffice className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-lg font-medium">Unable to load hostel information</p>
            <p className="text-sm text-muted-foreground">Please try again later.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Hostel" description="View your hostel allocation" />

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      ) : hostels.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <HiOutlineBuildingOffice className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-lg font-medium">No Hostel Allocated</p>
            <p className="text-sm text-muted-foreground">
              You have not been allocated a hostel yet.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {hostels.map((hostel) => (
            <Card key={hostel.id}>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">{hostel.name}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <p className="text-sm text-muted-foreground">Type: {hostel.type}</p>
                <p className="text-sm text-muted-foreground">Warden: {hostel.warden}</p>
                <p className="text-sm text-muted-foreground">Contact: {hostel.contactPhone}</p>
                <p className="text-sm text-muted-foreground">
                  Occupancy: {hostel.occupiedRooms}/{hostel.totalRooms}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
