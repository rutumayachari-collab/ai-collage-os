"use client";

import { PageHeader } from "@/app/components/common/PageHeader";
import { StatCard } from "@/app/components/common/StatCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ActivityFeed } from "@/app/components/common/ActivityFeed";
import { AIInsightCard } from "@/app/components/common/AIInsightCard";
import { type LucideIcon } from "lucide-react";
import {
  HiOutlineUserGroup,
  HiOutlineDocumentText,
  HiOutlineCheckCircle,
  HiOutlineAcademicCap,
} from "react-icons/hi2";

const STATS = [
  {
    title: "Total Inquiries",
    value: "1,234",
    icon: HiOutlineUserGroup as LucideIcon,
    description: "Active inquiries this month",
  },
  {
    title: "Applications",
    value: "856",
    icon: HiOutlineDocumentText as LucideIcon,
    description: "Applications received",
  },
  {
    title: "Verified",
    value: "642",
    icon: HiOutlineCheckCircle as LucideIcon,
    description: "Documents verified",
  },
  {
    title: "Admitted",
    value: "312",
    icon: HiOutlineAcademicCap as LucideIcon,
    description: "Students admitted",
  },
];

const ACTIVITIES = [
  {
    id: "1",
    title: "New inquiry received",
    description: "Priya Sharma submitted a new inquiry",
    timestamp: "2 min ago",
    type: "info" as const,
  },
  {
    id: "2",
    title: "Document verified",
    description: "Arjun Kumar's documents verified",
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
    description: "Vikram Joshi fee payment overdue",
    timestamp: "2 hours ago",
    type: "warning" as const,
  },
  {
    id: "5",
    title: "Document rejected",
    description: "Rahul Singh's document rejected",
    timestamp: "3 hours ago",
    type: "error" as const,
  },
];

export function DashboardPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Dashboard"
        description="Welcome to AI-CollegeOS. Here's what's happening today."
      />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {STATS.map((stat) => (
          <StatCard key={stat.title} {...stat} />
        ))}
      </div>
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <ActivityFeed activities={ACTIVITIES} />
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
    </div>
  );
}
