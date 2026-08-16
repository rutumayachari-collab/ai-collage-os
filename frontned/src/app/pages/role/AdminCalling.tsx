"use client";

import { useState, useEffect } from "react";
import { PageHeader } from "@/app/components/common/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { StatusBadge } from "@/app/components/common/StatusBadge";
import { ErrorState } from "@/app/components/common/ErrorState";
import { EmptyState } from "@/app/components/common/EmptyState";
import { useNavigate } from "@tanstack/react-router";
import { useAdminStats } from "@/app/hooks/queries/useAdmin";
import {
  HiOutlinePhone,
  HiOutlineChartBar,
  HiOutlineUserGroup,
  HiOutlineCheckCircle,
  HiOutlineArrowTrendingUp,
  HiOutlineExclamationTriangle,
  HiOutlineSparkles,
} from "react-icons/hi2";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { callingAgentService } from "@/app/services/calling-agent.service";
import type { CallingCampaign, CallAnalytics, CallOutcomeRecord } from "@/app/types/outreach";

export function AdminCalling() {
  const navigate = useNavigate();
  const { data: stats, isLoading: statsLoading, error: statsError } = useAdminStats();
  const [campaigns, setCampaigns] = useState<CallingCampaign[]>([]);
  const [analytics, setAnalytics] = useState<CallAnalytics | null>(null);
  const [callHistory, setCallHistory] = useState<CallOutcomeRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("campaigns");

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [campaignsData, historyData] = await Promise.all([
        callingAgentService.listCampaigns(),
        callingAgentService.getCallHistory(undefined, 1, 50),
      ]);
      setCampaigns(campaignsData);
      setCallHistory(historyData.items);

      if (campaignsData.length > 0) {
        const analyticsData = await callingAgentService.getAnalytics(campaignsData[0].id);
        setAnalytics(analyticsData);
      }
    } catch (err) {
      toast.error("Failed to load calling data");
    } finally {
      setLoading(false);
    }
  };

  if (statsError) {
    toast.error("Failed to load admin stats");
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  const totalCalls = callHistory.length;
  const successfulCalls = callHistory.filter(
    (c) => c.outcome === "INTERESTED" || c.outcome === "APPLICATION_INITIATED",
  ).length;
  const conversionRate = totalCalls > 0 ? Math.round((successfulCalls / totalCalls) * 100) : 0;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Calling Management"
        description="AI calling campaigns, performance, and analytics"
        actions={
          <Button onClick={() => navigate({ to: "/outreach" })}>
            <HiOutlinePhone className="mr-2 h-4 w-4" />
            Open Calling Agent
          </Button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Active Campaigns</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              {campaigns.filter((c) => c.status === "ACTIVE").length}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Calls</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{totalCalls}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{conversionRate}%</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Pending Callbacks</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              {callHistory.filter((c) => c.outcome === "CALLBACK_REQUESTED").length}
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList>
          <TabsTrigger value="campaigns">Campaigns</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="counsellor">Counsellor Performance</TabsTrigger>
          <TabsTrigger value="outcomes">Call Outcomes</TabsTrigger>
        </TabsList>

        <TabsContent value="campaigns" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Calling Campaigns</CardTitle>
            </CardHeader>
            <CardContent>
              {campaigns.length === 0 ? (
                <EmptyState
                  icon={HiOutlinePhone}
                  title="No campaigns"
                  description="Create a calling campaign to get started."
                  action={{
                    label: "Create Campaign",
                    onClick: () => navigate({ to: "/outreach" }),
                  }}
                />
              ) : (
                <div className="space-y-4">
                  {campaigns.map((campaign) => (
                    <div
                      key={campaign.id}
                      className="flex items-center justify-between rounded-lg border p-4"
                    >
                      <div>
                        <p className="font-medium">{campaign.name}</p>
                        <p className="text-sm text-muted-foreground">{campaign.collegeName}</p>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="text-sm font-medium">Leads: {campaign.totalLeads}</p>
                          <p className="text-sm text-muted-foreground">
                            Calls: {campaign.completedCalls}/{campaign.totalLeads}
                          </p>
                        </div>
                        <StatusBadge status={campaign.status} />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          {analytics ? (
            <div className="grid gap-6 lg:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Call Volume</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Total Leads</span>
                      <span className="font-bold">{analytics.totalLeads}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Calls Attempted</span>
                      <span className="font-bold">{analytics.callsAttempted}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Calls Completed</span>
                      <span className="font-bold">{analytics.callsCompleted}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Pending Calls</span>
                      <span className="font-bold">{analytics.pendingCalls}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Conversion Funnel</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Contacted</span>
                      <span className="font-bold">{analytics.conversionFunnel.contacted}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Interested</span>
                      <span className="font-bold">{analytics.conversionFunnel.interested}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Counselling</span>
                      <span className="font-bold">{analytics.conversionFunnel.counselling}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Campus Visit</span>
                      <span className="font-bold">{analytics.conversionFunnel.campusVisit}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Application Started</span>
                      <span className="font-bold">
                        {analytics.conversionFunnel.applicationStarted}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Outcome Breakdown</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {Object.entries(analytics.outcomeBreakdown).map(([key, value]) => (
                      <div key={key} className="flex justify-between">
                        <span>{key.replace(/_/g, " ")}</span>
                        <span className="font-bold">{value}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Sentiment & Intent</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <p className="text-sm font-medium">Sentiment Breakdown</p>
                    {Object.entries(analytics.sentimentBreakdown).map(([key, value]) => (
                      <div key={key} className="flex justify-between">
                        <span>{key}</span>
                        <span className="font-bold">{value}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            <EmptyState
              icon={HiOutlineChartBar}
              title="No analytics available"
              description="Analytics will appear once campaigns have call data."
            />
          )}
        </TabsContent>

        <TabsContent value="counsellor" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Counsellor Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <EmptyState
                icon={HiOutlineUserGroup}
                title="No counsellor data"
                description="Counsellor performance metrics will appear here."
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="outcomes" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Recent Call Outcomes</CardTitle>
            </CardHeader>
            <CardContent>
              {callHistory.length === 0 ? (
                <EmptyState
                  icon={HiOutlinePhone}
                  title="No call outcomes"
                  description="Call outcomes will appear here."
                />
              ) : (
                <div className="space-y-2">
                  {callHistory.slice(0, 20).map((call) => (
                    <div
                      key={call.id}
                      className="flex items-center justify-between rounded-lg border p-3"
                    >
                      <div>
                        <p className="font-medium">{call.studentName}</p>
                        <p className="text-sm text-muted-foreground">
                          {call.courseInterest} • {call.durationSeconds}s
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <StatusBadge status={call.outcome} />
                        <StatusBadge status={call.sentiment} />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
