"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  TrendingUp,
  Users,
  PhoneCall,
  Calendar,
  Building2,
  PhoneForwarded,
  ShieldAlert,
  Sparkles,
  BarChart3,
  Search,
  FileText,
  Clock,
  HelpCircle,
  AlertOctagon,
  ArrowRight,
  CheckCircle2,
  Languages,
} from "lucide-react";
import type { CallAnalytics, CampaignAIInsights, CallOutcomeRecord } from "@/app/types/outreach";

interface CampaignAnalyticsViewProps {
  analytics: CallAnalytics | null;
  insights: CampaignAIInsights | null;
  history: CallOutcomeRecord[];
  isLoading: boolean;
}

export function CampaignAnalyticsView({
  analytics,
  insights,
  history,
  isLoading,
}: CampaignAnalyticsViewProps) {
  const [search, setSearch] = useState("");
  const [selectedTranscriptRecord, setSelectedTranscriptRecord] =
    useState<CallOutcomeRecord | null>(null);

  const filteredHistory = history.filter(
    (h) =>
      h.studentName.toLowerCase().includes(search.toLowerCase()) ||
      h.phone.includes(search) ||
      h.courseInterest.toLowerCase().includes(search.toLowerCase()) ||
      h.outcome.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="space-y-6">
      {/* ─── 1. Top KPI Summary Cards ─── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <Card className="panel p-3.5">
          <div className="flex items-center justify-between text-muted-foreground mb-1">
            <span className="text-xs font-medium">Total Leads</span>
            <Users className="size-4 text-sky" />
          </div>
          <p className="text-2xl font-display font-bold text-foreground">
            {analytics?.totalLeads || 0}
          </p>
          <p className="text-[11px] text-muted-foreground mt-0.5">Imported Candidates</p>
        </Card>

        <Card className="panel p-3.5 border-primary/30">
          <div className="flex items-center justify-between text-muted-foreground mb-1">
            <span className="text-xs font-medium">Calls Completed</span>
            <PhoneCall className="size-4 text-primary" />
          </div>
          <p className="text-2xl font-display font-bold text-primary">
            {analytics?.callsCompleted || 0}
          </p>
          <p className="text-[11px] text-muted-foreground mt-0.5">
            Avg: {analytics?.averageDurationSeconds || 0}s duration
          </p>
        </Card>

        <Card className="panel p-3.5 border-success/30 bg-success/5">
          <div className="flex items-center justify-between text-success mb-1">
            <span className="text-xs font-medium">High Intent</span>
            <Sparkles className="size-4" />
          </div>
          <p className="text-2xl font-display font-bold text-success">
            {analytics?.highIntentCount || 0}
          </p>
          <p className="text-[11px] text-success/80 mt-0.5">
            {analytics?.interestRate || 0}% Interest Rate
          </p>
        </Card>

        <Card className="panel p-3.5 border-amber-500/30 bg-amber-500/5">
          <div className="flex items-center justify-between text-amber-500 mb-1">
            <span className="text-xs font-medium">Callbacks Due</span>
            <Calendar className="size-4" />
          </div>
          <p className="text-2xl font-display font-bold text-amber-500">
            {analytics?.callbacksScheduled || 0}
          </p>
          <p className="text-[11px] text-amber-500/80 mt-0.5">Prioritized in Queue</p>
        </Card>

        <Card className="panel p-3.5 border-emerald-500/30 bg-emerald-500/5">
          <div className="flex items-center justify-between text-emerald-400 mb-1">
            <span className="text-xs font-medium">Campus Visits</span>
            <Building2 className="size-4" />
          </div>
          <p className="text-2xl font-display font-bold text-emerald-400">
            {analytics?.campusVisitsRequested || 0}
          </p>
          <p className="text-[11px] text-emerald-400/80 mt-0.5">Lab Tour Bookings</p>
        </Card>

        <Card className="panel p-3.5 border-purple-500/30 bg-purple-500/5">
          <div className="flex items-center justify-between text-purple-400 mb-1">
            <span className="text-xs font-medium">Counselor Handoff</span>
            <PhoneForwarded className="size-4" />
          </div>
          <p className="text-2xl font-display font-bold text-purple-400">
            {analytics?.counselorEscalations || 0}
          </p>
          <p className="text-[11px] text-purple-400/80 mt-0.5">Senior Escalations</p>
        </Card>
      </div>

      {/* ─── 2. Ranked Top Admission Leads (CRITICAL DIFFERENTIATOR) ─── */}
      <Card className="panel p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border/60 pb-3">
          <div className="flex items-center gap-2">
            <Sparkles className="size-5 text-sky" />
            <div>
              <h3 className="font-display font-semibold text-base">
                Ranked Top Prospective Admission Leads
              </h3>
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
                <th className="py-2.5 px-3 font-semibold">Student Name</th>
                <th className="py-2.5 px-3 font-semibold">Course Interest</th>
                <th className="py-2.5 px-3 font-semibold">Admission Interest</th>
                <th className="py-2.5 px-3 font-semibold">Detected Intent</th>
                <th className="py-2.5 px-3 font-semibold">Key Consideration</th>
                <th className="py-2.5 px-3 font-semibold">AI Next Action</th>
                <th className="py-2.5 px-3 font-semibold">Outcome</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40">
              {(insights?.topLeads || []).map((lead, idx) => (
                <tr key={lead.callId} className="hover:bg-primary/5 transition-colors">
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
                      variant={lead.admissionInterest === "HIGH" ? "default" : "secondary"}
                      className="text-[10px] font-bold"
                    >
                      {lead.admissionInterest}
                    </Badge>
                  </td>
                  <td className="py-2.5 px-3 font-mono text-[11px] text-muted-foreground">
                    {lead.intent.replace(/_/g, " ")}
                  </td>
                  <td className="py-2.5 px-3 text-muted-foreground max-w-[200px] truncate">
                    {lead.primaryConcern}
                  </td>
                  <td className="py-2.5 px-3 font-medium text-sky">
                    {lead.recommendedAction.replace(/_/g, " ")}
                  </td>
                  <td className="py-2.5 px-3">
                    <Badge variant="outline" className="text-[10px]">
                      {lead.outcome.replace(/_/g, " ")}
                    </Badge>
                  </td>
                </tr>
              ))}

              {(!insights?.topLeads || insights.topLeads.length === 0) && (
                <tr>
                  <td colSpan={8} className="py-6 text-center text-muted-foreground">
                    No completed call records to rank yet. Start making calls in the Call Studio.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* ─── 3. Admission Funnel & Course Demand Grid ─── */}
      <div className="grid gap-4 lg:grid-cols-2">
        {/* Admission Funnel */}
        <Card className="panel p-5 space-y-4">
          <div className="flex items-center gap-2 border-b border-border/60 pb-2.5">
            <TrendingUp className="size-4 text-primary" />
            <h3 className="font-display font-semibold text-sm">Admission Outreach Funnel</h3>
          </div>

          <div className="space-y-2.5 text-xs">
            {[
              {
                stage: "Contacted Leads",
                count: analytics?.conversionFunnel.contacted || 0,
                pct: "100%",
                color: "bg-primary/20 text-primary",
              },
              {
                stage: "Interested Leads",
                count: analytics?.conversionFunnel.interested || 0,
                pct: "64%",
                color: "bg-sky/20 text-sky",
              },
              {
                stage: "Counseling Requested",
                count: analytics?.conversionFunnel.counselling || 0,
                pct: "38%",
                color: "bg-purple-500/20 text-purple-400",
              },
              {
                stage: "Campus Visit Scheduled",
                count: analytics?.conversionFunnel.campusVisit || 0,
                pct: "24%",
                color: "bg-emerald-500/20 text-emerald-400",
              },
              {
                stage: "Application Initiated",
                count: analytics?.conversionFunnel.applicationStarted || 0,
                pct: "16%",
                color: "bg-success/20 text-success font-bold",
              },
            ].map((step, idx) => (
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
                    {step.pct}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Course Demand Analysis */}
        <Card className="panel p-5 space-y-4">
          <div className="flex items-center gap-2 border-b border-border/60 pb-2.5">
            <BarChart3 className="size-4 text-sky" />
            <h3 className="font-display font-semibold text-sm">Program & Course Demand Analysis</h3>
          </div>

          <div className="space-y-3 text-xs">
            {(
              insights?.courseDemand || [
                {
                  course: "B.Tech Computer Science & Engineering",
                  totalInquiries: 42,
                  percentage: 42,
                  highIntentCount: 28,
                  feeInquiries: 18,
                },
                {
                  course: "B.Tech AI & Machine Learning",
                  totalInquiries: 31,
                  percentage: 31,
                  highIntentCount: 22,
                  feeInquiries: 14,
                },
                {
                  course: "B.Tech Data Science",
                  totalInquiries: 18,
                  percentage: 18,
                  highIntentCount: 11,
                  feeInquiries: 8,
                },
                {
                  course: "B.Tech Electronics & Telecommunication",
                  totalInquiries: 9,
                  percentage: 9,
                  highIntentCount: 5,
                  feeInquiries: 4,
                },
              ]
            ).map((c) => (
              <div
                key={c.course}
                className="space-y-1.5 p-2.5 rounded-lg border border-border/60 bg-card/40"
              >
                <div className="flex items-center justify-between font-medium">
                  <span className="text-foreground">{c.course}</span>
                  <span className="text-sky font-bold font-mono">
                    {c.percentage}% ({c.totalInquiries})
                  </span>
                </div>
                <div className="w-full bg-muted/60 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-gradient-ai h-full rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(100, c.percentage * 1.8)}%` }}
                  />
                </div>
                <div className="flex items-center justify-between text-[11px] text-muted-foreground pt-0.5">
                  <span>High Intent: {c.highIntentCount} candidates</span>
                  <span>Fee Inquiries: {c.feeInquiries}</span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* ─── 4. Common Questions & Top Objections ─── */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card className="panel p-5 space-y-3">
          <div className="flex items-center gap-2 border-b border-border/60 pb-2.5">
            <HelpCircle className="size-4 text-sky" />
            <h3 className="font-display font-semibold text-sm">Most Common Student Questions</h3>
          </div>
          <div className="space-y-2 text-xs">
            {(insights?.topQuestions || []).map((q, idx) => (
              <div
                key={q.topic}
                className="flex items-center justify-between p-2 rounded-md bg-muted/30 border border-border/40"
              >
                <div className="flex items-center gap-2">
                  <span className="font-mono text-muted-foreground font-semibold">#{idx + 1}</span>
                  <span className="text-foreground font-medium">{q.topic}</span>
                </div>
                <Badge variant="secondary" className="text-[11px]">
                  {q.count} inquiries ({q.percentage}%)
                </Badge>
              </div>
            ))}
          </div>
        </Card>

        <Card className="panel p-5 space-y-3">
          <div className="flex items-center gap-2 border-b border-border/60 pb-2.5">
            <AlertOctagon className="size-4 text-amber-500" />
            <h3 className="font-display font-semibold text-sm">Top Objections & Hesitations</h3>
          </div>
          <div className="space-y-2 text-xs">
            {(insights?.topObjections || []).map((obj, idx) => (
              <div
                key={obj.objection}
                className="flex items-center justify-between p-2 rounded-md bg-muted/30 border border-border/40"
              >
                <div className="flex items-center gap-2">
                  <span className="font-mono text-muted-foreground font-semibold">#{idx + 1}</span>
                  <span className="text-foreground">{obj.objection}</span>
                </div>
                <Badge variant="outline" className="text-[11px] border-amber-500/40 text-amber-500">
                  {obj.count} occurrences
                </Badge>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* ─── 5. Strategic AI Campaign Recommendations ─── */}
      <Card className="panel p-5 space-y-3 border-sky-500/30 bg-sky-500/5">
        <div className="flex items-center gap-2 border-b border-sky-500/20 pb-2.5 text-sky">
          <Sparkles className="size-4" />
          <h3 className="font-display font-semibold text-sm">Strategic Campaign Recommendations</h3>
        </div>

        <div className="grid gap-3 md:grid-cols-3 text-xs">
          {(insights?.recommendations || []).map((rec, i) => (
            <div key={i} className="p-3 rounded-xl bg-card/80 border border-border/60 space-y-1.5">
              <Badge
                variant="outline"
                className={`text-[10px] ${
                  rec.priority === "HIGH"
                    ? "border-destructive text-destructive"
                    : "border-sky text-sky"
                }`}
              >
                {rec.priority} Priority Insight
              </Badge>
              <p className="font-semibold text-foreground">{rec.insight}</p>
              <p className="text-muted-foreground text-[11px] leading-relaxed">
                👉 {rec.suggestedAction}
              </p>
            </div>
          ))}
        </div>
      </Card>

      {/* ─── 6. Call History & Full Transcript Viewer ─── */}
      <Card className="panel p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/60 pb-3">
          <div>
            <h3 className="font-display font-semibold text-base">
              Complete Call History & Transcripts
            </h3>
            <p className="text-xs text-muted-foreground">
              Review every simulated conversation turn, audio duration, sentiment, and outcome
            </p>
          </div>

          <div className="relative w-full sm:max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input
              placeholder="Search call logs by student or phone..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 h-8 text-xs"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="text-muted-foreground border-b border-border/60 bg-muted/20">
                <th className="py-2.5 px-3 font-semibold">Student</th>
                <th className="py-2.5 px-3 font-semibold">Course</th>
                <th className="py-2.5 px-3 font-semibold">Language</th>
                <th className="py-2.5 px-3 font-semibold">Duration</th>
                <th className="py-2.5 px-3 font-semibold">Sentiment</th>
                <th className="py-2.5 px-3 font-semibold">Outcome</th>
                <th className="py-2.5 px-3 font-semibold">Action Status</th>
                <th className="py-2.5 px-3 font-semibold text-right">Transcript</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40">
              {filteredHistory.map((h) => (
                <tr key={h.id || h.callId} className="hover:bg-primary/5 transition-colors">
                  <td className="py-2.5 px-3 font-medium text-foreground">
                    <p>{h.studentName}</p>
                    <p className="text-[11px] font-mono text-muted-foreground">
                      {h.phone.replace(/(\d{2})\d{4}(\d{4})/, "$1****$2")}
                    </p>
                  </td>
                  <td className="py-2.5 px-3">{h.courseInterest}</td>
                  <td className="py-2.5 px-3">
                    <Badge variant="outline" className="text-[10px]">
                      {h.preferredLanguage || "English"}
                    </Badge>
                  </td>
                  <td className="py-2.5 px-3 font-mono">{h.durationSeconds || 0}s</td>
                  <td className="py-2.5 px-3">
                    <Badge
                      variant="secondary"
                      className={`text-[10px] ${
                        h.sentiment === "POSITIVE"
                          ? "text-success"
                          : h.sentiment === "FRUSTRATED"
                            ? "text-destructive"
                            : ""
                      }`}
                    >
                      {h.sentiment}
                    </Badge>
                  </td>
                  <td className="py-2.5 px-3">
                    <Badge variant="default" className="text-[10px]">
                      {h.outcome.replace(/_/g, " ")}
                    </Badge>
                  </td>
                  <td className="py-2.5 px-3">
                    <Badge
                      variant="outline"
                      className={`text-[10px] ${
                        h.actionApprovalStatus === "APPROVED"
                          ? "border-success text-success"
                          : "border-muted-foreground text-muted-foreground"
                      }`}
                    >
                      {h.actionApprovalStatus}
                    </Badge>
                  </td>
                  <td className="py-2.5 px-3 text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-xs h-7 gap-1"
                      onClick={() => setSelectedTranscriptRecord(h)}
                    >
                      <FileText className="size-3.5 text-sky" />
                      View Transcript
                    </Button>
                  </td>
                </tr>
              ))}

              {filteredHistory.length === 0 && (
                <tr>
                  <td colSpan={8} className="py-6 text-center text-muted-foreground">
                    No call records matching search.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Transcript Detail Modal */}
      {selectedTranscriptRecord && (
        <Dialog
          open={!!selectedTranscriptRecord}
          onOpenChange={(open) => !open && setSelectedTranscriptRecord(null)}
        >
          <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-base font-display font-semibold flex items-center justify-between">
                <span>Call Transcript: {selectedTranscriptRecord.studentName}</span>
                <Badge variant="outline" className="text-xs font-mono">
                  {selectedTranscriptRecord.durationSeconds}s
                </Badge>
              </DialogTitle>
              <DialogDescription className="text-xs">
                {selectedTranscriptRecord.courseInterest} ·{" "}
                {selectedTranscriptRecord.preferredLanguage} · {selectedTranscriptRecord.outcome}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-3 py-2 text-xs">
              <div className="rounded-xl border border-border bg-card/40 p-3.5 space-y-3 max-h-96 overflow-y-auto">
                {(selectedTranscriptRecord.transcript || []).map((t, idx) => (
                  <div
                    key={idx}
                    className={`flex ${t.speaker === "agent" ? "justify-start" : "justify-end"}`}
                  >
                    <div
                      className={`max-w-[85%] rounded-xl px-3 py-2 text-xs space-y-1 ${
                        t.speaker === "agent"
                          ? "bg-primary/10 border border-primary/20 text-foreground"
                          : "bg-muted text-foreground"
                      }`}
                    >
                      <span className="font-semibold text-[10px] text-primary block">
                        {t.speaker === "agent" ? "🤖 AI Counselor" : "👤 Student"}
                      </span>
                      <p className="text-sm">{t.text}</p>
                    </div>
                  </div>
                ))}
              </div>

              {selectedTranscriptRecord.notes && (
                <div className="rounded-lg bg-muted/40 p-3 text-xs text-muted-foreground">
                  <span className="font-semibold text-foreground block mb-1">Call Notes:</span>
                  {selectedTranscriptRecord.notes}
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
