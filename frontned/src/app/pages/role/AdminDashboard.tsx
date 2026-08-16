"use client";

import { PageHeader } from "@/app/components/common/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "@tanstack/react-router";
import { HiOutlineExclamationTriangle } from "react-icons/hi2";

export function AdminDashboard() {
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Admin Dashboard"
        description="System overview and quick actions"
        actions={
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => navigate({ to: "/admin/analytics" })}>
              Analytics
            </Button>
            <Button onClick={() => navigate({ to: "/admin/reports" })}>Reports</Button>
          </div>
        }
      />

      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12 text-center">
          <HiOutlineExclamationTriangle className="h-10 w-10 text-muted-foreground mb-3" />
          <p className="text-sm font-medium">No data available</p>
          <p className="text-xs text-muted-foreground mt-1">
            Admin dashboard stats require backend integration.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <Button
            variant="outline"
            className="w-full justify-start"
            onClick={() => navigate({ to: "/admin/courses" })}
          >
            Manage Courses
          </Button>
          <Button
            variant="outline"
            className="w-full justify-start"
            onClick={() => navigate({ to: "/faculty" })}
          >
            Manage Faculty
          </Button>
          <Button
            variant="outline"
            className="w-full justify-start"
            onClick={() => navigate({ to: "/admin/departments" })}
          >
            Manage Departments
          </Button>
          <Button
            variant="outline"
            className="w-full justify-start"
            onClick={() => navigate({ to: "/settings" })}
          >
            System Settings
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
