"use client";

import { PageHeader } from "@/app/components/common/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  useAdmissionFunnel,
  useDepartmentStats,
  useFacultyStats,
  useRevenue,
  useScholarshipDistribution,
  useAdmissionTimeline,
  useProcessingTime,
  useAIAccuracy,
} from "@/app/hooks/queries/useAdmin";
import {
  HiOutlineTrendingUp,
  HiOutlineBuildingOffice,
  HiOutlineUsers,
  HiOutlineCurrencyRupee,
  HiOutlineChartBar,
} from "react-icons/hi2";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Legend,
} from "recharts";
import { Loader2 } from "lucide-react";

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8"];

export function AnalyticsDashboard() {
  const { data: funnel, isLoading: funnelLoading } = useAdmissionFunnel();
  const { data: departments = [], isLoading: deptLoading } = useDepartmentStats();
  const { data: faculty = [], isLoading: facultyLoading } = useFacultyStats();
  const { data: revenue = [], isLoading: revenueLoading } = useRevenue();
  const { data: scholarships = [], isLoading: scholarshipLoading } = useScholarshipDistribution();
  const { data: timeline = [], isLoading: timelineLoading } = useAdmissionTimeline();
  const { data: processing = [], isLoading: processingLoading } = useProcessingTime();
  const { data: aiAccuracy = [], isLoading: aiLoading } = useAIAccuracy();

  const isLoading =
    funnelLoading ||
    deptLoading ||
    facultyLoading ||
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

  const funnelData = funnel
    ? [
        { name: "Inquiries", value: funnel.inquiries, fill: "#0088FE" },
        { name: "Applicants", value: funnel.applicants, fill: "#00C49F" },
        { name: "Verified", value: funnel.verified, fill: "#FFBB28" },
        { name: "Eligible", value: funnel.eligible, fill: "#FF8042" },
        { name: "Admitted", value: funnel.admitted, fill: "#8884D8" },
        { name: "Students", value: funnel.students, fill: "#82CA9D" },
      ]
    : [];

  return (
    <div className="space-y-6">
      <PageHeader title="Analytics Dashboard" description="Comprehensive analytics and insights" />

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="departments">Departments</TabsTrigger>
          <TabsTrigger value="faculty">Faculty</TabsTrigger>
          <TabsTrigger value="revenue">Revenue</TabsTrigger>
          <TabsTrigger value="ai">AI Metrics</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Admission Funnel</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={funnelData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="value" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Funnel Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={funnelData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, value }) => `${name}: ${value}`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {funnelData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Admission Timeline</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={timeline}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="applicants" stroke="#8884d8" name="Applicants" />
                  <Line type="monotone" dataKey="admissions" stroke="#82ca9d" name="Admissions" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="departments" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Department Statistics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {departments.map((dept) => (
                  <div key={dept.id} className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{dept.name}</p>
                      <p className="text-sm text-muted-foreground">{dept.applicants} applicants</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{dept.admitted} admitted</p>
                      <p className="text-sm text-muted-foreground">{dept.occupancy}% occupancy</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="faculty" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Faculty Statistics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {faculty.map((f) => (
                  <div key={f.id} className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{f.name}</p>
                      <p className="text-sm text-muted-foreground">{f.department}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{f.applicantsReviewed} reviewed</p>
                      <p className="text-sm text-muted-foreground">
                        Avg: {f.averageProcessingTime}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="revenue" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Revenue Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={revenue}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip
                    formatter={(value: unknown) => [
                      `₹${(value as number).toLocaleString()}`,
                      "Revenue",
                    ]}
                  />
                  <Bar dataKey="amount" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Scholarship Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={scholarships}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, count }) => `${name}: ${count}`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="count"
                  >
                    {scholarships.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="ai" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>AI Prediction Accuracy</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={aiAccuracy}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis domain={[0, 100]} />
                  <Tooltip formatter={(value: unknown) => [`${value}%`, "Accuracy"]} />
                  <Line type="monotone" dataKey="accuracy" stroke="#8884d8" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

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
        </TabsContent>
      </Tabs>
    </div>
  );
}
