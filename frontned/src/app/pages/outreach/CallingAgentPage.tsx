"use client";

import { useState, useEffect, useCallback } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  PhoneCall,
  Users,
  Play,
  Pause,
  Upload,
  Plus,
  Sparkles,
  BarChart3,
  ListOrdered,
  Radio,
  ShieldAlert,
  GraduationCap,
  RotateCcw,
} from "lucide-react";
import { CallStudio } from "./components/CallStudio";
import { SmartQueueList } from "./components/SmartQueueList";
import { CSVUploadModal } from "./components/CSVUploadModal";
import { CampaignAnalyticsView } from "./components/CampaignAnalyticsView";
import { DNCRegistryView } from "./components/DNCRegistryView";
import { callingAgentService } from "@/app/services/calling-agent.service";
import type {
  CallingCampaign,
  CallQueueItem,
  CallOutcomeRecord,
  CallAnalytics,
  CampaignAIInsights,
  DoNotCallItem,
  SupportedLanguage,
} from "@/app/types/outreach";
import { SupportedLanguages } from "@/app/types/outreach";
import { toast } from "sonner";

export function CallingAgentPage() {
  // Campaign & Queue State
  const [campaigns, setCampaigns] = useState<CallingCampaign[]>([]);
  const [selectedCampaign, setSelectedCampaign] = useState<CallingCampaign | null>(null);
  const [queue, setQueue] = useState<CallQueueItem[]>([]);
  const [currentCallStudent, setCurrentCallStudent] = useState<CallQueueItem | null>(null);

  // Analytics & History
  const [analytics, setAnalytics] = useState<CallAnalytics | null>(null);
  const [insights, setInsights] = useState<CampaignAIInsights | null>(null);
  const [history, setHistory] = useState<CallOutcomeRecord[]>([]);
  const [dncList, setDncList] = useState<DoNotCallItem[]>([]);

  // Modals & UI States
  const [activeTab, setActiveTab] = useState<string>("studio");
  const [isCsvModalOpen, setIsCsvModalOpen] = useState(false);
  const [isNewCampaignModalOpen, setIsNewCampaignModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // New Campaign Form Fields
  const [newCampaignName, setNewCampaignName] = useState("B.Tech CSE Admissions 2026");
  const [newCollegeName, setNewCollegeName] = useState("Nexora Institute of Technology");
  const [newPurpose, setNewPurpose] = useState("New admission outreach");
  const [newTargetCourse, setNewTargetCourse] = useState("B.Tech Computer Science & Engineering");
  const [newDefaultLang, setNewDefaultLang] = useState<SupportedLanguage>("English");
  const [newMaxAttempts, setNewMaxAttempts] = useState(3);
  const [isCreatingCampaign, setIsCreatingCampaign] = useState(false);

  // ─── Fetch Campaigns ────────────────────────────────────────────────────────

  const fetchCampaigns = useCallback(async () => {
    try {
      const list = await callingAgentService.listCampaigns();
      setCampaigns(list);
      if (list.length > 0 && !selectedCampaign) {
        setSelectedCampaign(list[0]);
      }
    } catch (err: unknown) {
      const error = err instanceof Error ? err : new Error(String(err));
      console.warn("Could not fetch campaigns from server", error);
    }
  }, [selectedCampaign]);

  // ─── Fetch Campaign Data (Queue, Analytics, Insights, History) ─────────────

  const fetchCampaignDetails = useCallback(async (campaignId: string) => {
    setIsLoading(true);
    try {
      const [queueRes, analyticsRes, insightsRes, historyRes, dncRes] = await Promise.allSettled([
        callingAgentService.getQueue(campaignId),
        callingAgentService.getAnalytics(campaignId),
        callingAgentService.getAIInsights(campaignId),
        callingAgentService.getCallHistory(campaignId),
        callingAgentService.getDncList(),
      ]);

      if (queueRes.status === "fulfilled") setQueue(queueRes.value.items || []);
      if (analyticsRes.status === "fulfilled") setAnalytics(analyticsRes.value);
      if (insightsRes.status === "fulfilled") setInsights(insightsRes.value);
      if (historyRes.status === "fulfilled") setHistory(historyRes.value.items || []);
      if (dncRes.status === "fulfilled") setDncList(dncRes.value.items || []);
    } catch (err) {
      console.error("Error fetching campaign details", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCampaigns();
  }, [fetchCampaigns]);

  useEffect(() => {
    if (selectedCampaign) {
      fetchCampaignDetails(selectedCampaign.campaignId || selectedCampaign.id);
    }
  }, [selectedCampaign, fetchCampaignDetails]);

  // ─── Create New Campaign ───────────────────────────────────────────────────

  const handleCreateCampaign = async () => {
    if (!newCampaignName.trim()) {
      toast.error("Please provide a campaign name");
      return;
    }

    setIsCreatingCampaign(true);
    try {
      const campaign = await callingAgentService.createCampaign({
        name: newCampaignName.trim(),
        collegeName: newCollegeName.trim(),
        purpose: newPurpose.trim(),
        targetCourse: newTargetCourse.trim(),
        defaultLanguage: newDefaultLang,
        maxAttempts: newMaxAttempts,
      });

      toast.success(`Campaign "${campaign.name}" created successfully!`);
      setIsNewCampaignModalOpen(false);
      setSelectedCampaign(campaign);
      fetchCampaigns();
    } catch (err: unknown) {
      const error = err instanceof Error ? err : new Error(String(err));
      toast.error(error?.message || "Failed to create campaign");
    } finally {
      setIsCreatingCampaign(false);
    }
  };

  // ─── Start / Pause Campaign ───────────────────────────────────────────────

  const handleToggleCampaignStatus = async () => {
    if (!selectedCampaign) return;
    const cid = selectedCampaign.campaignId || selectedCampaign.id;

    try {
      if (selectedCampaign.status === "ACTIVE") {
        const updated = await callingAgentService.pauseCampaign(cid);
        setSelectedCampaign(updated);
        toast.info("Campaign paused");
      } else {
        const updated = await callingAgentService.startCampaign(cid);
        setSelectedCampaign(updated);
        toast.success("Campaign activated and calling queue initiated!");
      }
      fetchCampaigns();
    } catch (err: unknown) {
      const error = err instanceof Error ? err : new Error(String(err));
      toast.error(error?.message || "Failed to update campaign state");
    }
  };

  // ─── One-Click Fetch Next Priority Call ────────────────────────────────────

  const handleCallNextStudent = async () => {
    if (!selectedCampaign) {
      toast.error("Please select or create a campaign first");
      return;
    }

    const cid = selectedCampaign.campaignId || selectedCampaign.id;
    try {
      const nextStudent = await callingAgentService.getNextCall(cid);
      if (!nextStudent) {
        toast.info("No eligible pending leads in the priority queue");
        return;
      }

      setCurrentCallStudent(nextStudent);
      setActiveTab("studio");
      toast.success(`Loaded top priority lead: ${nextStudent.studentName}`);
    } catch (err: any) {
      toast.error(err?.message || "Failed to fetch next student");
    }
  };

  const handleSelectStudentForCall = (student: CallQueueItem) => {
    setCurrentCallStudent(student);
    setActiveTab("studio");
  };

  const handleCallCompleted = () => {
    if (selectedCampaign) {
      const cid = selectedCampaign.campaignId || selectedCampaign.id;
      fetchCampaignDetails(cid);
    }
  };

  const campaignId = selectedCampaign?.campaignId || selectedCampaign?.id || "demo-camp-1";

  return (
    <div className="space-y-6">
      {/* ─── Top Control Bar ─── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-card/40 border border-border/80 rounded-2xl p-4 shadow-soft">
        <div>
          <div className="flex items-center gap-2">
            <span className="bg-gradient-ai size-6 rounded-lg grid place-items-center text-primary-foreground">
              <PhoneCall className="size-3.5" />
            </span>
            <h1 className="font-display text-xl font-bold tracking-tight text-foreground">
              AI Admissions Outreach Calling Agent
            </h1>
            <Badge variant="outline" className="border-sky text-sky text-[11px] font-mono">
              CAMPUSOS v2
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            Automated prospective student engagement, multilingual outreach (10 Indian languages),
            smart priority queues, and human-approved admission actions.
          </p>
        </div>

        {/* Campaign Actions */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Campaign Selector */}
          <Select
            value={campaignId}
            onValueChange={(val) => {
              const camp = campaigns.find((c) => (c.campaignId || c.id) === val);
              if (camp) setSelectedCampaign(camp);
            }}
          >
            <SelectTrigger className="w-[200px] h-9 text-xs">
              <SelectValue placeholder="Select Campaign" />
            </SelectTrigger>
            <SelectContent>
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

          {/* Start / Pause Button */}
          {selectedCampaign && (
            <Button
              size="sm"
              variant={selectedCampaign.status === "ACTIVE" ? "outline" : "default"}
              onClick={handleToggleCampaignStatus}
              className="gap-1.5 h-9 text-xs"
            >
              {selectedCampaign.status === "ACTIVE" ? (
                <>
                  <Pause className="size-3.5" />
                  Pause Campaign
                </>
              ) : (
                <>
                  <Play className="size-3.5" />
                  Start Campaign
                </>
              )}
            </Button>
          )}

          {/* Import CSV Button */}
          <Button
            size="sm"
            variant="outline"
            onClick={() => setIsCsvModalOpen(true)}
            className="gap-1.5 h-9 text-xs border-sky/40 text-sky hover:bg-sky/10"
          >
            <Upload className="size-3.5" />
            Import Student CSV
          </Button>

          {/* New Campaign Button */}
          <Button
            size="sm"
            variant="outline"
            onClick={() => setIsNewCampaignModalOpen(true)}
            className="gap-1.5 h-9 text-xs"
          >
            <Plus className="size-3.5" />
            New Campaign
          </Button>
        </div>
      </div>

      {/* ─── Main Tabs Navigation ─── */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <TabsList className="bg-card/70 border border-border p-1 rounded-xl w-fit">
            <TabsTrigger value="studio" className="gap-1.5 text-xs">
              <Radio className="size-3.5 text-sky" />
              <span>Live Call Studio</span>
            </TabsTrigger>
            <TabsTrigger value="queue" className="gap-1.5 text-xs">
              <ListOrdered className="size-3.5" />
              <span>Smart Priority Queue</span>
              {queue.length > 0 && (
                <span className="ml-1 px-1.5 py-0.2 rounded-full bg-primary/20 text-primary font-mono text-[10px]">
                  {queue.length}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="analytics" className="gap-1.5 text-xs">
              <BarChart3 className="size-3.5" />
              <span>Campaign AI Insights & Top Leads</span>
            </TabsTrigger>
            <TabsTrigger value="dnc" className="gap-1.5 text-xs">
              <ShieldAlert className="size-3.5 text-destructive" />
              <span>DNC Registry</span>
              {dncList.length > 0 && (
                <span className="ml-1 px-1.5 py-0.2 rounded-full bg-destructive/20 text-destructive font-mono text-[10px]">
                  {dncList.length}
                </span>
              )}
            </TabsTrigger>
          </TabsList>

          <Button
            onClick={handleCallNextStudent}
            className="gap-2 shadow-glow bg-primary hover:bg-primary/90 text-xs h-9 w-fit"
          >
            <PhoneCall className="size-4" />
            <span>Call Next Student</span>
          </Button>
        </div>

        {/* ─── TAB 1: Live Call Studio ─── */}
        <TabsContent value="studio">
          <CallStudio
            currentStudent={currentCallStudent}
            campaignId={campaignId}
            collegeName={selectedCampaign?.collegeName}
            onCallEnded={handleCallCompleted}
            onNextStudent={handleCallNextStudent}
          />
        </TabsContent>

        {/* ─── TAB 2: Smart Priority Queue ─── */}
        <TabsContent value="queue">
          <SmartQueueList
            queue={queue}
            isLoading={isLoading}
            onCallStudent={handleSelectStudentForCall}
            onRefresh={() => fetchCampaignDetails(campaignId)}
          />
        </TabsContent>

        {/* ─── TAB 3: Campaign AI Intelligence & Analytics ─── */}
        <TabsContent value="analytics">
          <CampaignAnalyticsView
            analytics={analytics}
            insights={insights}
            history={history}
            isLoading={isLoading}
          />
        </TabsContent>

        {/* ─── TAB 4: DNC Registry ─── */}
        <TabsContent value="dnc">
          <DNCRegistryView dncList={dncList} onRefresh={() => fetchCampaignDetails(campaignId)} />
        </TabsContent>
      </Tabs>

      {/* ─── CSV Upload Modal ─── */}
      <CSVUploadModal
        isOpen={isCsvModalOpen}
        onClose={() => setIsCsvModalOpen(false)}
        campaignId={campaignId}
        onImportSuccess={() => fetchCampaignDetails(campaignId)}
      />

      {/* ─── New Campaign Modal ─── */}
      <Dialog open={isNewCampaignModalOpen} onOpenChange={setIsNewCampaignModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Create Admission Outreach Campaign</DialogTitle>
            <DialogDescription>
              Configure an automated admission calling campaign for prospective student leads.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 py-2 text-xs">
            <div className="space-y-1">
              <Label className="text-xs">Campaign Name</Label>
              <Input
                value={newCampaignName}
                onChange={(e) => setNewCampaignName(e.target.value)}
                placeholder="e.g. B.Tech Admissions 2026 Outreach"
                className="text-sm"
              />
            </div>

            <div className="space-y-1">
              <Label className="text-xs">College / Institution Name</Label>
              <Input
                value={newCollegeName}
                onChange={(e) => setNewCollegeName(e.target.value)}
                className="text-sm"
              />
            </div>

            <div className="space-y-1">
              <Label className="text-xs">Admission Purpose</Label>
              <Select value={newPurpose} onValueChange={setNewPurpose}>
                <SelectTrigger className="text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="New admission outreach">New Admission Outreach</SelectItem>
                  <SelectItem value="B.Tech admission campaign">
                    B.Tech Admission Campaign
                  </SelectItem>
                  <SelectItem value="Course promotion">Course Promotion</SelectItem>
                  <SelectItem value="Application follow-up">Application Follow-up</SelectItem>
                  <SelectItem value="Scholarship awareness">Scholarship Awareness</SelectItem>
                  <SelectItem value="Campus visit invitation">Campus Visit Invitation</SelectItem>
                  <SelectItem value="Counselling invitation">Counselling Invitation</SelectItem>
                  <SelectItem value="Fee information">Fee Information</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1">
              <Label className="text-xs">Target Academic Program</Label>
              <Input
                value={newTargetCourse}
                onChange={(e) => setNewTargetCourse(e.target.value)}
                placeholder="e.g. B.Tech Computer Science & Engineering"
                className="text-sm"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <Label className="text-xs">Default Language</Label>
                <Select
                  value={newDefaultLang}
                  onValueChange={(v: SupportedLanguage) => setNewDefaultLang(v)}
                >
                  <SelectTrigger className="text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {SupportedLanguages.map((l) => (
                      <SelectItem key={l} value={l}>
                        {l}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1">
                <Label className="text-xs">Max Attempts Per Lead</Label>
                <Input
                  type="number"
                  min={1}
                  max={5}
                  value={newMaxAttempts}
                  onChange={(e) => setNewMaxAttempts(parseInt(e.target.value, 10) || 3)}
                  className="text-sm"
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsNewCampaignModalOpen(false)}
              disabled={isCreatingCampaign}
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreateCampaign}
              disabled={isCreatingCampaign}
              className="gap-1.5"
            >
              <Sparkles className="size-4" />
              Create Campaign
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
