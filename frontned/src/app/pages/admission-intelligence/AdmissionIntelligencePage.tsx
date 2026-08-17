"use client";

import { useState, useEffect, useCallback } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { motion } from "framer-motion";
import {
  GraduationCap,
  Users,
  PhoneCall,
  Calendar,
  Building2,
  PhoneForwarded,
  Sparkles,
  BarChart3,
  Search,
  FileText,
  Clock,
  HelpCircle,
  AlertOctagon,
  ArrowRight,
  TrendingUp,
  ShieldAlert,
  Zap,
  Target,
  BookOpen,
  RefreshCw,
  ArrowDownRight,
  Eye,
  ClipboardList,
  Globe,
  Heart,
} from "lucide-react";
import { admissionIntelligenceService } from "@/app/services/admission-intelligence.service";
import { callingAgentService } from "@/app/services/calling-agent.service";
import type {
  AdmissionIntelligenceOverview,
  AdmissionIntelligenceLead,
  FollowUpItem,
  StudentIntelligence,
  CampaignInsights,
  CourseDemandStat,
  CommonQuestion,
  CommonObjection,
  AICampaignSummary,
  ActionRecommendation,
  AdmissionFunnelStage,
  GlobalSearchResult,
} from "@/app/types/admission-intelligence";
import type { CallingCampaign } from "@/app/types/outreach";

type Tab =
  | "overview"
  | "leads"
  | "followups"
  | "student"
  | "campaigns"
  | "courses"
  | "questions"
  | "objections"
  | "ai-summary"
  | "recommendations"
  | "funnel"
  | "search";

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.04 } },
};
const item = { hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0 } };

export function AdmissionIntelligencePage() {
  const [campaigns, setCampaigns] = useState<CallingCampaign[]>([]);
  const [selectedCampaignId, setSelectedCampaignId] = useState<string>("all");
  const [overview, setOverview] = useState<AdmissionIntelligenceOverview | null>(null);
  const [topLeads, setTopLeads] = useState<AdmissionIntelligenceLead[]>([]);
  const [followUps, setFollowUps] = useState<FollowUpItem[]>([]);
  const [studentIntelligence, setStudentIntelligence] = useState<StudentIntelligence | null>(null);
  const [campaignInsights, setCampaignInsights] = useState<CampaignInsights | null>(null);
  const [courseDemand, setCourseDemand] = useState<CourseDemandStat[]>([]);
  const [commonQuestions, setCommonQuestions] = useState<CommonQuestion[]>([]);
  const [commonObjections, setCommonObjections] = useState<CommonObjection[]>([]);
  const [aiSummary, setAiSummary] = useState<AICampaignSummary | null>(null);
  const [recommendations, setRecommendations] = useState<ActionRecommendation[]>([]);
  const [funnel, setFunnel] = useState<AdmissionFunnelStage[]>([]);
  const [searchResults, setSearchResults] = useState<GlobalSearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>("overview");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStudentId, setSelectedStudentId] = useState("");
  const campaignId = selectedCampaignId === "all" ? undefined : selectedCampaignId;

  const fetchCampaigns = useCallback(async () => {
    try {
      const list = await callingAgentService.listCampaigns();
      setCampaigns(list);
    } catch (err) {
      console.warn("Could not fetch campaigns", err);
    }
  }, []);

  const fetchAllData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [
        overviewRes,
        leadsRes,
        followupsRes,
        insightsRes,
        demandRes,
        questionsRes,
        objectionsRes,
        summaryRes,
        recsRes,
        funnelRes,
      ] = await Promise.allSettled([
        admissionIntelligenceService.getOverview(campaignId || ""),
        admissionIntelligenceService.getTopLeads(campaignId || "", 15),
        admissionIntelligenceService.getFollowUpQueue(campaignId || ""),
        campaignId
          ? admissionIntelligenceService.getCampaignInsights(campaignId)
          : Promise.resolve(null),
        admissionIntelligenceService.getCourseDemand(campaignId || ""),
        admissionIntelligenceService.getCommonQuestions(campaignId || ""),
        admissionIntelligenceService.getCommonObjections(campaignId || ""),
        admissionIntelligenceService.getAICampaignSummary(campaignId || ""),
        admissionIntelligenceService.getActionRecommendations(campaignId || ""),
        admissionIntelligenceService.getAdmissionFunnel(),
      ]);
      if (overviewRes.status === "fulfilled") setOverview(overviewRes.value);
      if (leadsRes.status === "fulfilled") setTopLeads(leadsRes.value);
      if (followupsRes.status === "fulfilled") setFollowUps(followupsRes.value);
      if (insightsRes.status === "fulfilled") setCampaignInsights(insightsRes.value);
      if (demandRes.status === "fulfilled") setCourseDemand(demandRes.value);
      if (questionsRes.status === "fulfilled") setCommonQuestions(questionsRes.value);
      if (objectionsRes.status === "fulfilled") setCommonObjections(objectionsRes.value);
      if (summaryRes.status === "fulfilled") setAiSummary(summaryRes.value);
      if (recsRes.status === "fulfilled") setRecommendations(recsRes.value);
      if (funnelRes.status === "fulfilled") setFunnel(funnelRes.value);
    } catch (err) {
      console.error("Error fetching admission intelligence", err);
      toast.error("Failed to load admission intelligence data");
    } finally {
      setIsLoading(false);
    }
  }, [campaignId]);

  useEffect(() => {
    fetchCampaigns();
  }, [fetchCampaigns]);
  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    try {
      const results = await admissionIntelligenceService.globalSearch(searchQuery.trim());
      setSearchResults(results);
      setActiveTab("search");
    } catch (err: unknown) {
      const error = err instanceof Error ? err : new Error(String(err));
      toast.error(error?.message || "Search failed");
    }
  };

  const handleViewStudent = async (studentId: string) => {
    setSelectedStudentId(studentId);
    try {
      const data = await admissionIntelligenceService.getStudentIntelligence(studentId);
      setStudentIntelligence(data);
      setActiveTab("student");
    } catch (err: unknown) {
      const error = err instanceof Error ? err : new Error(String(err));
      toast.error(error?.message || "Failed to load student intelligence");
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "URGENT":
        return "text-destructive border-destructive/40 bg-destructive/10";
      case "HIGH":
        return "text-amber-500 border-amber-500/40 bg-amber-500/10";
      case "MEDIUM":
        return "text-sky border-sky/40 bg-sky/10";
      case "LOW":
        return "text-muted-foreground border-muted-foreground/40 bg-muted/30";
      default:
        return "";
    }
  };

  const getInterestBadge = (level: string) => {
    switch (level) {
      case "HIGH":
        return "default";
      case "MEDIUM":
        return "secondary";
      case "LOW":
        return "outline";
      default:
        return "outline";
    }
  };

  const statCards = [
    {
      label: "Total Prospects",
      value: overview?.totalProspects || 0,
      icon: Users,
      color: "text-primary",
    },
    { label: "Contacted", value: overview?.contacted || 0, icon: PhoneCall, color: "text-sky" },
    {
      label: "Interested",
      value: overview?.interested || 0,
      icon: Heart,
      color: "text-purple-400",
    },
    {
      label: "High Intent",
      value: overview?.highIntent || 0,
      icon: Sparkles,
      color: "text-success",
    },
    {
      label: "Callbacks",
      value: overview?.callbacks || 0,
      icon: Calendar,
      color: "text-amber-500",
    },
    {
      label: "Counsellor Requests",
      value: overview?.counselorRequests || 0,
      icon: PhoneForwarded,
      color: "text-pink-400",
    },
    {
      label: "Campus Visits",
      value: overview?.campusVisits || 0,
      icon: Building2,
      color: "text-emerald-400",
    },
    {
      label: "Application Interest",
      value: overview?.applicationInterest || 0,
      icon: FileText,
      color: "text-indigo-400",
    },
    {
      label: "Not Interested",
      value: overview?.notInterested || 0,
      icon: ArrowDownRight,
      color: "text-destructive",
    },
    { label: "DNC", value: overview?.dnc || 0, icon: ShieldAlert, color: "text-destructive" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-card/40 border border-border/80 rounded-2xl p-4 shadow-soft">
        <div>
          <div className="flex items-center gap-2">
            <span className="bg-gradient-ai size-6 rounded-lg grid place-items-center text-primary-foreground">
              <GraduationCap className="size-3.5" />
            </span>
            <h1 className="font-display text-xl font-bold tracking-tight text-foreground">
              Admission Intelligence Center
            </h1>
            <Badge variant="outline" className="border-sky text-sky text-[11px] font-mono">
              NEXORA AI CAMPUSOS
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            Transform calling data into actionable admission-lead intelligence — rank leads,
            prioritize follow-ups, and drive admissions.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Select value={selectedCampaignId} onValueChange={setSelectedCampaignId}>
            <SelectTrigger className="w-[200px] h-9 text-xs">
              <SelectValue placeholder="All Campaigns" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all" className="text-xs">
                All Campaigns
              </SelectItem>
              {campaigns.map((c) => (
                <SelectItem
                  key={c.campaignId || c.id}
                  value={c.campaignId || c.id}
                  className="text-xs"
                >
                  {c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            size="sm"
            variant="outline"
            onClick={fetchAllData}
            disabled={isLoading}
            className="gap-1.5 h-9 text-xs"
          >
            <RefreshCw className={`size-3.5 ${isLoading ? "animate-spin" : ""}`} /> Refresh
          </Button>
        </div>
      </div>

      <Card className="panel p-3 flex items-center gap-2">
        <Search className="size-4 text-muted-foreground" />
        <Input
          placeholder="Search by student name, phone, course, intent, outcome..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSearch()}
          className="border-0 bg-transparent text-xs h-8 focus-visible:ring-0"
        />
        <Button size="sm" onClick={handleSearch} className="h-8 text-xs gap-1">
          <Search className="size-3.5" /> Search
        </Button>
      </Card>

      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as Tab)} className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <TabsList className="bg-card/70 border border-border p-1 rounded-xl w-fit flex-wrap">
            <TabsTrigger value="overview" className="gap-1.5 text-xs">
              <TrendingUp className="size-3.5 text-sky" />
              <span>Overview</span>
            </TabsTrigger>
            <TabsTrigger value="leads" className="gap-1.5 text-xs">
              <Target className="size-3.5" />
              <span>Top Leads</span>
            </TabsTrigger>
            <TabsTrigger value="followups" className="gap-1.5 text-xs">
              <Zap className="size-3.5" />
              <span>Follow-ups</span>
            </TabsTrigger>
            <TabsTrigger value="funnel" className="gap-1.5 text-xs">
              <TrendingUp className="size-3.5" />
              <span>Funnel</span>
            </TabsTrigger>
            <TabsTrigger value="campaigns" className="gap-1.5 text-xs">
              <BarChart3 className="size-3.5" />
              <span>Campaigns</span>
            </TabsTrigger>
            <TabsTrigger value="courses" className="gap-1.5 text-xs">
              <BookOpen className="size-3.5" />
              <span>Courses</span>
            </TabsTrigger>
            <TabsTrigger value="questions" className="gap-1.5 text-xs">
              <HelpCircle className="size-3.5" />
              <span>Questions</span>
            </TabsTrigger>
            <TabsTrigger value="objections" className="gap-1.5 text-xs">
              <AlertOctagon className="size-3.5" />
              <span>Objections</span>
            </TabsTrigger>
            <TabsTrigger value="ai-summary" className="gap-1.5 text-xs">
              <Sparkles className="size-3.5 text-sky" />
              <span>AI Summary</span>
            </TabsTrigger>
            <TabsTrigger value="recommendations" className="gap-1.5 text-xs">
              <ClipboardList className="size-3.5" />
              <span>Actions</span>
            </TabsTrigger>
            <TabsTrigger value="search" className="gap-1.5 text-xs">
              <Globe className="size-3.5" />
              <span>Search</span>
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="overview">
          <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5"
          >
            {statCards.map((stat) => (
              <motion.div key={stat.label} variants={item}>
                <Card className="panel p-3.5">
                  <div className="flex items-center justify-between text-muted-foreground mb-1">
                    <span className="text-xs font-medium">{stat.label}</span>
                    <stat.icon className={`size-4 ${stat.color}`} />
                  </div>
                  <p className="text-2xl font-display font-bold text-foreground">{stat.value}</p>
                </Card>
              </motion.div>
            ))}
          </motion.div>
          <div className="grid gap-4 lg:grid-cols-3 mt-4">
            <Card className="panel p-5 lg:col-span-2">
              <div className="flex items-center gap-2 border-b border-border/60 pb-2.5 mb-4">
                <TrendingUp className="size-4 text-primary" />
                <h3 className="font-display font-semibold text-sm">Admission Outreach Funnel</h3>
              </div>
              <div className="space-y-2 text-xs">
                {funnel.map((step, idx) => (
                  <div
                    key={step.stage}
                    className="flex items-center justify-between p-2.5 rounded-lg border border-border/60 bg-card/40"
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="font-mono text-muted-foreground w-4">#{idx + 1}</span>
                      <span className="font-medium text-foreground">{step.stage}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-bold font-display text-sm">{step.count}</span>
                      <Badge variant="outline" className={`text-[10px] ${step.color}`}>
                        {step.percentage}%
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
            <Card className="panel p-5">
              <div className="flex items-center gap-2 border-b border-border/60 pb-2.5 mb-4">
                <Sparkles className="size-4 text-sky" />
                <h3 className="font-display font-semibold text-sm">AI Campaign Summary</h3>
              </div>
              {aiSummary?.available ? (
                <p className="text-xs text-muted-foreground leading-relaxed whitespace-pre-line">
                  {aiSummary.summary}
                </p>
              ) : (
                <p className="text-xs text-muted-foreground italic">
                  AI campaign analysis unavailable.
                </p>
              )}
              {aiSummary?.generatedAt && (
                <p className="text-[10px] text-muted-foreground mt-2">
                  Generated: {new Date(aiSummary.generatedAt).toLocaleString()}
                </p>
              )}
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="leads">
          <Card className="panel p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-border/60 pb-3">
              <div className="flex items-center gap-2">
                <Target className="size-5 text-sky" />
                <div>
                  <h3 className="font-display font-semibold text-base">Top Admission Leads</h3>
                  <p className="text-xs text-muted-foreground">
                    Ranked from actual recorded conversations and detected admission intent
                  </p>
                </div>
              </div>
              <Badge variant="outline" className="border-sky/40 text-sky text-xs w-fit">
                AI Ranked Pipeline
              </Badge>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="text-muted-foreground border-b border-border/60 bg-muted/20">
                    <th className="py-2.5 px-3 font-semibold">Rank</th>
                    <th className="py-2.5 px-3 font-semibold">Student</th>
                    <th className="py-2.5 px-3 font-semibold">Course</th>
                    <th className="py-2.5 px-3 font-semibold">Interest</th>
                    <th className="py-2.5 px-3 font-semibold">Intent</th>
                    <th className="py-2.5 px-3 font-semibold">Outcome</th>
                    <th className="py-2.5 px-3 font-semibold">Priority</th>
                    <th className="py-2.5 px-3 font-semibold">Next Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/40">
                  {topLeads.map((lead, idx) => (
                    <tr
                      key={lead.callId}
                      className="hover:bg-primary/5 transition-colors cursor-pointer"
                      onClick={() => handleViewStudent(lead.studentId)}
                    >
                      <td className="py-2.5 px-3 font-mono font-bold text-sky">#{idx + 1}</td>
                      <td className="py-2.5 px-3 font-medium text-foreground">
                        <p>{lead.studentName}</p>
                        <p className="text-[11px] font-mono text-muted-foreground">
                          {lead.maskedPhone}
                        </p>
                      </td>
                      <td className="py-2.5 px-3 font-medium">{lead.courseInterest}</td>
                      <td className="py-2.5 px-3">
                        <Badge
                          variant={getInterestBadge(lead.admissionInterest)}
                          className="text-[10px] font-bold"
                        >
                          {lead.admissionInterest}
                        </Badge>
                      </td>
                      <td className="py-2.5 px-3 font-mono text-[11px] text-muted-foreground">
                        {lead.intent.replace(/_/g, " ")}
                      </td>
                      <td className="py-2.5 px-3">
                        <Badge variant="outline" className="text-[10px]">
                          {lead.outcome.replace(/_/g, " ")}
                        </Badge>
                      </td>
                      <td className="py-2.5 px-3">
                        <Badge
                          variant="outline"
                          className={`text-[10px] ${getPriorityColor(lead.priority)}`}
                        >
                          {lead.priority}
                        </Badge>
                      </td>
                      <td className="py-2.5 px-3 font-medium text-sky">
                        {lead.recommendedAction.replace(/_/g, " ")}
                      </td>
                    </tr>
                  ))}
                  {topLeads.length === 0 && (
                    <tr>
                      <td colSpan={8} className="py-6 text-center text-muted-foreground">
                        No call records to rank yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="followups">
          {["URGENT", "HIGH", "MEDIUM", "LOW"].map((priority) => {
            const items = followUps.filter((f) => f.priority === priority);
            if (items.length === 0) return null;
            return (
              <Card
                key={priority}
                className={`panel p-5 space-y-4 mb-4 border-l-4 ${priority === "URGENT" ? "border-l-destructive" : priority === "HIGH" ? "border-l-amber-500" : priority === "MEDIUM" ? "border-l-sky" : "border-l-muted-foreground"}`}
              >
                <div className="flex items-center gap-2">
                  <Badge
                    variant="outline"
                    className={`text-xs font-bold ${getPriorityColor(priority)}`}
                  >
                    {priority}
                  </Badge>
                  <span className="text-xs text-muted-foreground">{items.length} student(s)</span>
                </div>
                <div className="space-y-2">
                  {items.map((f) => (
                    <div
                      key={f.studentId}
                      className="flex items-center justify-between p-3 rounded-lg border border-border/60 bg-card/40 cursor-pointer hover:bg-primary/5 transition-colors"
                      onClick={() => handleViewStudent(f.studentId)}
                    >
                      <div className="space-y-0.5">
                        <p className="font-medium text-sm text-foreground">{f.studentName}</p>
                        <p className="text-[11px] text-muted-foreground">
                          {f.maskedPhone} · {f.courseInterest}
                        </p>
                        <p className="text-[11px] text-muted-foreground italic">{f.reason}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        {f.callbackTime && (
                          <Badge
                            variant="outline"
                            className="text-[10px] border-amber-500/40 text-amber-500"
                          >
                            <Clock className="size-3 mr-1" />
                            {f.callbackTime}
                          </Badge>
                        )}
                        <ArrowRight className="size-4 text-muted-foreground" />
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            );
          })}
          {followUps.length === 0 && (
            <Card className="panel p-8 text-center text-muted-foreground text-xs">
              No follow-up items found.
            </Card>
          )}
        </TabsContent>

        <TabsContent value="student">
          <Card className="panel p-5">
            <div className="flex items-center gap-2 border-b border-border/60 pb-3 mb-4">
              <Eye className="size-4 text-primary" />
              <h3 className="font-display font-semibold text-sm">Student Intelligence</h3>
            </div>
            <div className="flex gap-2 mb-4">
              <Input
                placeholder="Enter Student ID to view intelligence..."
                value={selectedStudentId}
                onChange={(e) => setSelectedStudentId(e.target.value)}
                className="text-xs h-8"
              />
              <Button
                size="sm"
                onClick={() => handleViewStudent(selectedStudentId)}
                disabled={!selectedStudentId}
                className="h-8 text-xs gap-1"
              >
                <Search className="size-3.5" /> Load
              </Button>
            </div>
            {studentIntelligence && (
              <div className="space-y-4 text-xs">
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                  <div className="p-3 rounded-lg border border-border/60 bg-card/40">
                    <p className="text-muted-foreground text-[11px]">Student</p>
                    <p className="font-semibold text-sm">{studentIntelligence.studentName}</p>
                  </div>
                  <div className="p-3 rounded-lg border border-border/60 bg-card/40">
                    <p className="text-muted-foreground text-[11px]">Phone</p>
                    <p className="font-mono text-sm">{studentIntelligence.phone}</p>
                  </div>
                  <div className="p-3 rounded-lg border border-border/60 bg-card/40">
                    <p className="text-muted-foreground text-[11px]">Course Interest</p>
                    <p className="font-medium text-sm">{studentIntelligence.courseInterest}</p>
                  </div>
                  <div className="p-3 rounded-lg border border-border/60 bg-card/40">
                    <p className="text-muted-foreground text-[11px]">Language</p>
                    <p className="text-sm">{studentIntelligence.preferredLanguage}</p>
                  </div>
                </div>
                {studentIntelligence.latestCall && (
                  <div className="p-4 rounded-lg border border-border/60 bg-card/40 space-y-2">
                    <p className="font-semibold text-sm text-primary">Latest Call</p>
                    <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4 text-[11px]">
                      <div>
                        <span className="text-muted-foreground">Outcome:</span>{" "}
                        <span className="font-medium">
                          {studentIntelligence.latestCall.outcome.replace(/_/g, " ")}
                        </span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Sentiment:</span>{" "}
                        <span className="font-medium">
                          {studentIntelligence.latestCall.sentiment}
                        </span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Intent:</span>{" "}
                        <span className="font-medium">
                          {studentIntelligence.latestCall.intent.replace(/_/g, " ")}
                        </span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Interest:</span>{" "}
                        <span className="font-medium">
                          {studentIntelligence.latestCall.admissionInterest}
                        </span>
                      </div>
                    </div>
                    {studentIntelligence.latestCall.primaryConcern && (
                      <p className="text-[11px] text-muted-foreground">
                        <span className="text-foreground font-medium">Concern:</span>{" "}
                        {studentIntelligence.latestCall.primaryConcern}
                      </p>
                    )}
                    {studentIntelligence.latestCall.notes && (
                      <p className="text-[11px] text-muted-foreground">
                        <span className="text-foreground font-medium">Notes:</span>{" "}
                        {studentIntelligence.latestCall.notes}
                      </p>
                    )}
                  </div>
                )}
                <div>
                  <p className="font-semibold text-sm text-primary mb-2">Timeline</p>
                  <div className="space-y-2">
                    {studentIntelligence.timeline.map((t, idx) => (
                      <div
                        key={idx}
                        className="flex items-start gap-2 p-2 rounded-md bg-muted/30 border border-border/40"
                      >
                        <span className="font-mono text-muted-foreground font-bold text-[10px] mt-0.5">
                          #{idx + 1}
                        </span>
                        <div>
                          <p className="font-medium text-foreground">{t.stage}</p>
                          <p className="text-[11px] text-muted-foreground">{t.details}</p>
                          {t.timestamp && (
                            <p className="text-[10px] text-muted-foreground">{t.timestamp}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </Card>
        </TabsContent>

        <TabsContent value="campaigns">
          {campaignInsights ? (
            <Card className="panel p-5 space-y-4">
              <div className="flex items-center gap-2 border-b border-border/60 pb-2.5">
                <BarChart3 className="size-4 text-primary" />
                <h3 className="font-display font-semibold text-sm">
                  Campaign Insights — {campaignInsights.campaignName}
                </h3>
              </div>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                {[
                  { label: "Students", value: campaignInsights.students },
                  { label: "Calls", value: campaignInsights.calls },
                  { label: "Successful Calls", value: campaignInsights.successfulCalls },
                  { label: "No Answer", value: campaignInsights.noAnswer },
                  { label: "Interested", value: campaignInsights.interested },
                  { label: "High Intent", value: campaignInsights.highIntent },
                  { label: "Callbacks", value: campaignInsights.callbacks },
                  { label: "Counsellor Requests", value: campaignInsights.counselorRequests },
                  { label: "Campus Visits", value: campaignInsights.campusVisits },
                  { label: "Application Interest", value: campaignInsights.applicationsInterest },
                  { label: "Not Interested", value: campaignInsights.notInterested },
                  { label: "DNC", value: campaignInsights.dnc },
                ].map((s) => (
                  <div key={s.label} className="p-3 rounded-lg border border-border/60 bg-card/40">
                    <p className="text-muted-foreground text-[11px]">{s.label}</p>
                    <p className="text-lg font-display font-bold text-foreground">{s.value}</p>
                  </div>
                ))}
              </div>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
                {[
                  { label: "Contact Rate", value: `${campaignInsights.contactRate}%` },
                  { label: "Interest Rate", value: `${campaignInsights.interestRate}%` },
                  { label: "High-Intent Rate", value: `${campaignInsights.highIntentRate}%` },
                  { label: "Callback Rate", value: `${campaignInsights.callbackRate}%` },
                  {
                    label: "Counsellor Escalation Rate",
                    value: `${campaignInsights.counselorEscalationRate}%`,
                  },
                ].map((s) => (
                  <div key={s.label} className="p-3 rounded-lg border border-border/60 bg-card/40">
                    <p className="text-muted-foreground text-[11px]">{s.label}</p>
                    <p className="text-lg font-display font-bold text-sky">{s.value}</p>
                  </div>
                ))}
              </div>
            </Card>
          ) : (
            <Card className="panel p-8 text-center text-muted-foreground text-xs">
              Select a specific campaign to view detailed insights.
            </Card>
          )}
        </TabsContent>

        <TabsContent value="courses">
          <Card className="panel p-5 space-y-4">
            <div className="flex items-center gap-2 border-b border-border/60 pb-2.5">
              <BookOpen className="size-4 text-sky" />
              <h3 className="font-display font-semibold text-sm">Course Demand Analysis</h3>
            </div>
            <div className="space-y-3">
              {courseDemand.map((c) => (
                <div
                  key={c.course}
                  className="space-y-1.5 p-3 rounded-lg border border-border/60 bg-card/40"
                >
                  <div className="flex items-center justify-between font-medium">
                    <span className="text-foreground">{c.course}</span>
                    <span className="text-sky font-bold font-mono">
                      {c.percentage}% ({c.interested})
                    </span>
                  </div>
                  <div className="w-full bg-muted/60 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-gradient-ai h-full rounded-full transition-all duration-500"
                      style={{ width: `${Math.min(100, c.percentage * 1.8)}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-muted-foreground pt-0.5">
                    <span>High Intent: {c.highIntent} candidates</span>
                  </div>
                </div>
              ))}
              {courseDemand.length === 0 && (
                <p className="text-center text-muted-foreground text-xs py-4">
                  No course demand data available yet.
                </p>
              )}
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="questions">
          <Card className="panel p-5 space-y-3">
            <div className="flex items-center gap-2 border-b border-border/60 pb-2.5">
              <HelpCircle className="size-4 text-sky" />
              <h3 className="font-display font-semibold text-sm">Top Student Questions</h3>
            </div>
            <div className="space-y-2">
              {commonQuestions.map((q, idx) => (
                <div
                  key={q.topic}
                  className="flex items-center justify-between p-2.5 rounded-md bg-muted/30 border border-border/40"
                >
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-muted-foreground font-semibold">
                      #{idx + 1}
                    </span>
                    <span className="text-foreground font-medium">{q.topic}</span>
                  </div>
                  <Badge variant="secondary" className="text-[11px]">
                    {q.count} inquiries ({q.percentage}%)
                  </Badge>
                </div>
              ))}
              {commonQuestions.length === 0 && (
                <p className="text-center text-muted-foreground text-xs py-4">
                  No question data available yet.
                </p>
              )}
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="objections">
          <Card className="panel p-5 space-y-3">
            <div className="flex items-center gap-2 border-b border-border/60 pb-2.5">
              <AlertOctagon className="size-4 text-amber-500" />
              <h3 className="font-display font-semibold text-sm">Why Students Are Hesitating</h3>
            </div>
            <div className="space-y-2">
              {commonObjections.map((o, idx) => (
                <div
                  key={o.objection}
                  className="flex items-center justify-between p-2.5 rounded-md bg-muted/30 border border-border/40"
                >
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-muted-foreground font-semibold">
                      #{idx + 1}
                    </span>
                    <span className="text-foreground">{o.objection}</span>
                  </div>
                  <Badge
                    variant="outline"
                    className="text-[11px] border-amber-500/40 text-amber-500"
                  >
                    {o.count} occurrences
                  </Badge>
                </div>
              ))}
              {commonObjections.length === 0 && (
                <p className="text-center text-muted-foreground text-xs py-4">
                  No objection data available yet.
                </p>
              )}
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="ai-summary">
          <Card className="panel p-5 space-y-4 border-sky-500/30 bg-sky-500/5">
            <div className="flex items-center gap-2 border-b border-sky-500/20 pb-2.5 text-sky">
              <Sparkles className="size-4" />
              <h3 className="font-display font-semibold text-sm">Campaign AI Summary</h3>
            </div>
            {aiSummary?.available ? (
              <p className="text-xs text-muted-foreground leading-relaxed whitespace-pre-line">
                {aiSummary.summary}
              </p>
            ) : (
              <p className="text-xs text-muted-foreground italic">
                AI campaign analysis unavailable.
              </p>
            )}
            {aiSummary?.generatedAt && (
              <p className="text-[10px] text-muted-foreground">
                Generated: {new Date(aiSummary.generatedAt).toLocaleString()}
              </p>
            )}
          </Card>
        </TabsContent>

        <TabsContent value="recommendations">
          <Card className="panel p-5 space-y-4 border-sky-500/30 bg-sky-500/5">
            <div className="flex items-center gap-2 border-b border-sky-500/20 pb-2.5 text-sky">
              <ClipboardList className="size-4" />
              <h3 className="font-display font-semibold text-sm">AI Recommended Actions</h3>
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              {recommendations.map((rec, i) => (
                <div
                  key={i}
                  className="p-3 rounded-xl bg-card/80 border border-border/60 space-y-1.5"
                >
                  <Badge
                    variant="outline"
                    className={`text-[10px] ${rec.priority === "HIGH" ? "border-destructive text-destructive" : rec.priority === "MEDIUM" ? "border-sky text-sky" : "border-muted-foreground text-muted-foreground"}`}
                  >
                    {rec.priority} Priority
                  </Badge>
                  <p className="font-semibold text-foreground text-xs">{rec.insight}</p>
                  <p className="text-muted-foreground text-[11px] leading-relaxed">
                    👉 {rec.suggestedAction}
                  </p>
                </div>
              ))}
              {recommendations.length === 0 && (
                <p className="text-center text-muted-foreground text-xs py-4 col-span-2">
                  No recommendations available yet.
                </p>
              )}
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="funnel">
          <Card className="panel p-5 space-y-4">
            <div className="flex items-center gap-2 border-b border-border/60 pb-2.5">
              <TrendingUp className="size-4 text-primary" />
              <h3 className="font-display font-semibold text-sm">Admission Intelligence Funnel</h3>
            </div>
            <div className="space-y-2 text-xs">
              {funnel.map((step, idx) => (
                <div
                  key={step.stage}
                  className="flex items-center justify-between p-2.5 rounded-lg border border-border/60 bg-card/40"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="font-mono text-muted-foreground w-4">#{idx + 1}</span>
                    <span className="font-medium text-foreground">{step.stage}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-bold font-display text-sm">{step.count}</span>
                    <Badge variant="outline" className={`text-[10px] ${step.color}`}>
                      {step.percentage}%
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="search">
          <Card className="panel p-5 space-y-4">
            <div className="flex items-center gap-2 border-b border-border/60 pb-2.5">
              <Globe className="size-4 text-primary" />
              <h3 className="font-display font-semibold text-sm">Global Search Results</h3>
            </div>
            {searchResults.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead>
                    <tr className="text-muted-foreground border-b border-border/60 bg-muted/20">
                      <th className="py-2.5 px-3 font-semibold">Student</th>
                      <th className="py-2.5 px-3 font-semibold">Course</th>
                      <th className="py-2.5 px-3 font-semibold">Intent</th>
                      <th className="py-2.5 px-3 font-semibold">Outcome</th>
                      <th className="py-2.5 px-3 font-semibold">Interest</th>
                      <th className="py-2.5 px-3 font-semibold">Priority</th>
                      <th className="py-2.5 px-3 font-semibold">Campaign</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/40">
                    {searchResults.map((r) => (
                      <tr
                        key={r.studentId}
                        className="hover:bg-primary/5 transition-colors cursor-pointer"
                        onClick={() => handleViewStudent(r.studentId)}
                      >
                        <td className="py-2.5 px-3 font-medium text-foreground">
                          <p>{r.studentName}</p>
                          <p className="text-[11px] font-mono text-muted-foreground">
                            {r.maskedPhone}
                          </p>
                        </td>
                        <td className="py-2.5 px-3">{r.courseInterest}</td>
                        <td className="py-2.5 px-3 font-mono text-[11px] text-muted-foreground">
                          {r.intent.replace(/_/g, " ")}
                        </td>
                        <td className="py-2.5 px-3">
                          <Badge variant="outline" className="text-[10px]">
                            {r.outcome.replace(/_/g, " ")}
                          </Badge>
                        </td>
                        <td className="py-2.5 px-3">
                          <Badge
                            variant={getInterestBadge(r.admissionInterest)}
                            className="text-[10px]"
                          >
                            {r.admissionInterest}
                          </Badge>
                        </td>
                        <td className="py-2.5 px-3">
                          <Badge
                            variant="outline"
                            className={`text-[10px] ${getPriorityColor(r.priority)}`}
                          >
                            {r.priority}
                          </Badge>
                        </td>
                        <td className="py-2.5 px-3 text-[11px] text-muted-foreground">
                          {r.campaignName}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-center text-muted-foreground text-xs py-4">
                No search results yet. Try searching for a student name, phone, or course.
              </p>
            )}
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
