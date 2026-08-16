"use client";

import { PageHeader } from "@/app/components/common/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  useAdmissionFunnel,
  useRevenue,
  useScholarshipDistribution,
  useAdmissionTimeline,
  useProcessingTime,
  useAIAccuracy,
} from "@/app/hooks/queries/useAdmin";
import { HiOutlineExclamationTriangle } from "react-icons/hi2";
import { Loader2 } from "lucide-react";

export function AdminAnalytics() {
  const { data: funnel, isLoading: funnelLoading } = useAdmissionFunnel();
  const { data: revenue = [], isLoading: revenueLoading } = useRevenue();
  const { data: scholarships = [], isLoading: scholarshipLoading } = useScholarshipDistribution();
  const { data: timeline = [], isLoading: timelineLoading } = useAdmissionTimeline();
  const { data: processing = [], isLoading: processingLoading } = useProcessingTime();
  const { data: aiAccuracy = [], isLoading: aiLoading } = useAIAccuracy();

  const isLoading =
    funnelLoading ||
    revenueLoading ||
    scholarshipLoading ||
    timelineLoading ||
    processingLoading ||
    aiLoading;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  const hasAnyData =
    (funnel && (funnel.inquiries > 0 || funnel.applicants > 0)) ||
    revenue.length > 0 ||
    scholarships.length > 0 ||
    timeline.length > 0 ||
    processing.length > 0 ||
    aiAccuracy.length > 0;

  if (!hasAnyData) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Analytics Dashboard"
          description="Comprehensive analytics and insights"
        />
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <HiOutlineExclamationTriangle className="h-10 w-10 text-muted-foreground mb-3" />
            <p className="text-sm font-medium">No analytics data available</p>
            <p className="text-xs text-muted-foreground mt-1">
              Analytics endpoints require backend implementation.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const funnelData = funnel
    ? [
        { name: "Inquiries", value: funnel.inquiries },
        { name: "Applicants", value: funnel.applicants },
        { name: "Verified", value: funnel.verified },
        { name: "Eligible", value: funnel.eligible },
        { name: "Admitted", value: funnel.admitted },
        { name: "Students", value: funnel.students },
      ]
    : [];

  return (
    <div className="space-y-6">
      <PageHeader title="Analytics Dashboard" description="Comprehensive analytics and insights" />

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="revenue">Revenue</TabsTrigger>
          <TabsTrigger value="ai">AI Metrics</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {funnelData.length > 0 ? (
            <div className="grid gap-6 lg:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Admission Funnel</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground text-center py-8">
                    Chart rendering requires a charting library.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Funnel Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground text-center py-8">
                    Chart rendering requires a charting library.
                  </p>
                </CardContent>
              </Card>
            </div>
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-8 text-center">
                <p className="text-sm text-muted-foreground">No funnel data available.</p>
              </CardContent>
            </Card>
          )}

          {timeline.length > 0 ? (
            <Card>
              <CardHeader>
                <CardTitle>Admission Timeline</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground text-center py-8">
                  Chart rendering requires a charting library.
                </p>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-8 text-center">
                <p className="text-sm text-muted-foreground">No timeline data available.</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="revenue" className="space-y-6">
          {revenue.length > 0 ? (
            <Card>
              <CardHeader>
                <CardTitle>Revenue Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground text-center py-8">
                  Chart rendering requires a charting library.
                </p>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-8 text-center">
                <p className="text-sm text-muted-foreground">No revenue data available.</p>
              </CardContent>
            </Card>
          )}

          {scholarships.length > 0 ? (
            <Card>
              <CardHeader>
                <CardTitle>Scholarship Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground text-center py-8">
                  Chart rendering requires a charting library.
                </p>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-8 text-center">
                <p className="text-sm text-muted-foreground">
                  No scholarship distribution data available.
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="ai" className="space-y-6">
          {aiAccuracy.length > 0 ? (
            <Card>
              <CardHeader>
                <CardTitle>AI Prediction Accuracy</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground text-center py-8">
                  Chart rendering requires a charting library.
                </p>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-8 text-center">
                <p className="text-sm text-muted-foreground">No AI accuracy data available.</p>
              </CardContent>
            </Card>
          )}

          {processing.length > 0 ? (
            <Card>
              <CardHeader>
                <CardTitle>Processing Time by Stage</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {processing.map((item, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <p className="font-medium">{item.stage}</p>
                      <p className="text-sm text-muted-foreground">{item.averageTime}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-8 text-center">
                <p className="text-sm text-muted-foreground">No processing time data available.</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
