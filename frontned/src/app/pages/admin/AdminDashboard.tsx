"use client";

import { PageHeader } from "@/app/components/common/PageHeader";
import { StatCard } from "@/app/components/common/StatCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ActivityFeed } from "@/app/components/common/ActivityFeed";
import { Button } from "@/components/ui/button";
import { useAdminStats } from "@/app/hooks/queries/useAdmin";
import { useNavigate } from "@tanstack/react-router";
import {
  HiOutlineUserGroup,
  HiOutlineDocumentText,
  HiOutlineCheckCircle,
  HiOutlineAcademicCap,
  HiOutlineCurrencyRupee,
} from "react-icons/hi2";
import { type LucideIcon } from "lucide-react";

const ACTIVITIES = [
  {
    id: "1",
    title: "New applicant submitted",
    description: "Rahul Sharma applied for Computer Science",
    timestamp: "2 min ago",
    type: "info" as const,
  },
  {
    id: "2",
    title: "Document verified",
    description: "Priya Patel's marksheet verified",
    timestamp: "15 min ago",
    type: "success" as const,
  },
  {
    id: "3",
    title: "Admission approved",
    description: "Meera Reddy's admission approved",
    timestamp: "1 hour ago",
    type: "success" as const,
  },
  {
    id: "4",
    title: "Payment pending",
    description: "Arjun Kumar fee payment overdue",
    timestamp: "2 hours ago",
    type: "warning" as const,
  },
];

export function AdminDashboard() {
  const navigate = useNavigate();
  const { data: stats, isLoading } = useAdminStats();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  const statCards: {
    title: string;
    value: string | number;
    description: string;
    icon: LucideIcon;
    onClick?: () => void;
  }[] = [
    {
      title: "Total Inquiries",
      value: stats?.totalInquiries || 0,
      description: "All time inquiries",
      icon: HiOutlineUserGroup as LucideIcon,
      onClick: () => navigate({ to: "/inquiries" }),
    },
    {
      title: "Total Applicants",
      value: stats?.totalApplicants || 0,
      description: "All applications",
      icon: HiOutlineDocumentText as LucideIcon,
      onClick: () => navigate({ to: "/applicants" }),
    },
    {
      title: "Admissions Approved",
      value: stats?.admissionsApproved || 0,
      description: "Total approvals",
      icon: HiOutlineCheckCircle as LucideIcon,
      onClick: () => navigate({ to: "/admissions" }),
    },
    {
      title: "Revenue",
      value: `₹${(stats?.revenue || 0).toLocaleString()}`,
      description: "Total revenue",
      icon: HiOutlineCurrencyRupee as LucideIcon,
    },
  ];

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

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat) => (
          <div key={stat.title} onClick={stat.onClick} className="cursor-pointer">
            <StatCard {...stat} />
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>System Health</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Pending Verifications</p>
                <p className="text-2xl font-bold">{stats?.pendingVerifications || 0}</p>
              </div>
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Pending Eligibility</p>
                <p className="text-2xl font-bold">{stats?.pendingEligibility || 0}</p>
              </div>
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Total Students</p>
                <p className="text-2xl font-bold">{stats?.totalStudents || 0}</p>
              </div>
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Total Faculty</p>
                <p className="text-2xl font-bold">{stats?.totalFaculty || 0}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <div>
          <ActivityFeed activities={ACTIVITIES} title="Recent Activities" />
        </div>
      </div>
    </div>
  );
}
