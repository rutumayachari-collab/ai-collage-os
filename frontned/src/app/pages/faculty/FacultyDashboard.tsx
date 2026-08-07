"use client";

import { PageHeader } from "@/app/components/common/PageHeader";
import { StatCard } from "@/app/components/common/StatCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ActivityFeed } from "@/app/components/common/ActivityFeed";
import { Button } from "@/components/ui/button";
import { useFacultyStats } from "@/app/hooks/queries/useFaculty";
import { useNavigate } from "@tanstack/react-router";
import {
  HiOutlineUserGroup,
  HiOutlineDocumentText,
  HiOutlineCheckCircle,
  HiOutlineAcademicCap,
  HiOutlineClock,
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
    title: "Eligibility check pending",
    description: "Arjun Kumar's eligibility review needed",
    timestamp: "1 hour ago",
    type: "warning" as const,
  },
  {
    id: "4",
    title: "Admission approved",
    description: "Meera Reddy's admission approved",
    timestamp: "2 hours ago",
    type: "success" as const,
  },
];

export function FacultyDashboard() {
  const navigate = useNavigate();
  const { data: stats, isLoading } = useFacultyStats();

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
      title: "Today's Applicants",
      value: stats?.todayApplicants || 0,
      description: "New applications today",
      icon: HiOutlineUserGroup as LucideIcon,
      onClick: () => navigate({ to: "/faculty/applicants" }),
    },
    {
      title: "Pending Verification",
      value: stats?.pendingVerification || 0,
      description: "Documents to verify",
      icon: HiOutlineDocumentText as LucideIcon,
      onClick: () => navigate({ to: "/faculty/verification" }),
    },
    {
      title: "Pending Eligibility",
      value: stats?.pendingEligibility || 0,
      description: "Eligibility checks pending",
      icon: HiOutlineCheckCircle as LucideIcon,
      onClick: () => navigate({ to: "/faculty/eligibility" }),
    },
    {
      title: "Admissions Approved",
      value: stats?.admissionsApproved || 0,
      description: "Total approvals",
      icon: HiOutlineAcademicCap as LucideIcon,
      onClick: () => navigate({ to: "/faculty/admissions" }),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Faculty Dashboard"
        description="Welcome to the faculty portal. Here's what needs your attention today."
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
              <CardTitle>Review Queues</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
              <Button
                variant="outline"
                className="h-auto flex-col items-start p-4"
                onClick={() => navigate({ to: "/faculty/applicants" })}
              >
                <HiOutlineUserGroup className="h-6 w-6 mb-2" />
                <span className="font-medium">Applicant Review Queue</span>
                <span className="text-sm text-muted-foreground">
                  {stats?.pendingReview || 0} pending
                </span>
              </Button>
              <Button
                variant="outline"
                className="h-auto flex-col items-start p-4"
                onClick={() => navigate({ to: "/faculty/verification" })}
              >
                <HiOutlineDocumentText className="h-6 w-6 mb-2" />
                <span className="font-medium">Verification Queue</span>
                <span className="text-sm text-muted-foreground">
                  {stats?.pendingVerification || 0} pending
                </span>
              </Button>
              <Button
                variant="outline"
                className="h-auto flex-col items-start p-4"
                onClick={() => navigate({ to: "/faculty/eligibility" })}
              >
                <HiOutlineCheckCircle className="h-6 w-6 mb-2" />
                <span className="font-medium">Eligibility Queue</span>
                <span className="text-sm text-muted-foreground">
                  {stats?.pendingEligibility || 0} pending
                </span>
              </Button>
              <Button
                variant="outline"
                className="h-auto flex-col items-start p-4"
                onClick={() => navigate({ to: "/faculty/admissions" })}
              >
                <HiOutlineAcademicCap className="h-6 w-6 mb-2" />
                <span className="font-medium">Admission Queue</span>
                <span className="text-sm text-muted-foreground">
                  {stats?.admissionsApproved || 0} approved
                </span>
              </Button>
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
