"use client";

import { PageHeader } from "@/app/components/common/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { studentService } from "@/app/services/student.service";
import { HiOutlineArrowPath, HiOutlineExclamationTriangle } from "react-icons/hi2";
import { toast } from "sonner";

export function StudentCampus() {
  const navigate = useNavigate();

  const { isLoading, error, refetch } = useQuery({
    queryKey: ["students", "me"],
    queryFn: () => studentService.getMyProfile(),
  });

  if (error) {
    toast.error("Failed to load campus profile");
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="My Campus"
        description="Explore campus life, facilities, and resources"
        actions={
          <Button variant="outline" onClick={() => refetch()}>
            <HiOutlineArrowPath className="mr-2 h-4 w-4" />
            Refresh
          </Button>
        }
      />

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      ) : error ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <HiOutlineExclamationTriangle className="h-10 w-10 text-destructive mb-3" />
            <p className="text-sm font-medium">Failed to load campus data</p>
            <Button className="mt-4" variant="outline" onClick={() => refetch()}>
              Try Again
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <HiOutlineExclamationTriangle className="h-10 w-10 text-muted-foreground mb-3" />
            <p className="text-sm font-medium">No campus data available</p>
            <p className="text-xs text-muted-foreground mt-1">
              Campus facility data requires implementation of the relevant endpoints.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
