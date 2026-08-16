"use client";

import { PageHeader } from "@/app/components/common/PageHeader";
import { StatCard } from "@/app/components/common/StatCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ActivityFeed } from "@/app/components/common/ActivityFeed";
import { AIInsightCard } from "@/app/components/common/AIInsightCard";
import { EcosystemCanvas } from "@/app/components/three/ecosystem-canvas";
import { type LucideIcon } from "lucide-react";
import {
  HiOutlineUserGroup,
  HiOutlineDocumentText,
  HiOutlineCheckCircle,
  HiOutlineAcademicCap,
} from "react-icons/hi2";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAdminStats } from "@/app/hooks/queries/useAdmin";

export function DashboardPage() {
  const { data: stats, isLoading } = useAdminStats();

  const statsCards = [
    {
      title: "Total Inquiries",
      value: stats?.totalInquiries ?? 0,
      icon: HiOutlineUserGroup as LucideIcon,
      description: "Active inquiries",
    },
    {
      title: "Applications",
      value: stats?.totalApplicants ?? 0,
      icon: HiOutlineDocumentText as LucideIcon,
      description: "Applications received",
    },
    {
      title: "Verified",
      value: stats?.pendingVerifications ?? 0,
      icon: HiOutlineCheckCircle as LucideIcon,
      description: "Documents pending review",
    },
    {
      title: "Admitted",
      value: stats?.admissionsApproved ?? 0,
      icon: HiOutlineAcademicCap as LucideIcon,
      description: "Students admitted",
    },
  ];

  const activities = stats
    ? [
        {
          id: "1",
          title: "Admissions pipeline",
          description: `${stats.admissionsApproved} admissions approved and ${stats.pendingEligibility} pending eligibility reviews`,
          timestamp: "Live",
          type: "success" as const,
        },
        {
          id: "2",
          title: "Verification queue",
          description: `${stats.pendingVerifications} document verifications require attention`,
          timestamp: "Live",
          type: "warning" as const,
        },
        {
          id: "3",
          title: "Enrollment snapshot",
          description: `${stats.totalStudents} active students across ${stats.totalFaculty} faculty members`,
          timestamp: "Live",
          type: "info" as const,
        },
      ]
    : [];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Command Center"
        description="Welcome to NEXORA AI CAMPUSOS. Here's what's happening today."
      />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statsCards.map((stat) => (
          <StatCard key={stat.title} {...stat} />
        ))}
      </div>
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="ecosystem">3D Ecosystem</TabsTrigger>
        </TabsList>
        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <div className="text-sm text-muted-foreground">Loading activity feed...</div>
                  ) : (
                    <ActivityFeed activities={activities} />
                  )}
                </CardContent>
              </Card>
            </div>
            <div>
              <AIInsightCard
                title="AI Recommendation"
                insight="Based on current trends, admission volume is expected to increase by 15% next week."
                confidence={85}
                recommendation="Consider adding temporary review staff."
              />
            </div>
          </div>
        </TabsContent>
        <TabsContent value="ecosystem">
          <Card className="panel">
            <CardHeader>
              <CardTitle>AI Ecosystem</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[500px] w-full">
                <EcosystemCanvas />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
