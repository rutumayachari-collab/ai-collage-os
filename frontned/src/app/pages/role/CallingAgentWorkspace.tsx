"use client";

import { useState, useEffect, useCallback } from "react";
import { PageHeader } from "@/app/components/common/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DataTable } from "@/app/components/tables/DataTable";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useNavigate } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { callingAgentService } from "@/app/services/calling-agent.service";
import type {
  CallingCampaign,
  CallQueueItem,
  CallOutcomeRecord,
  CallTranscript,
  SupportedLanguage,
  CallSentiment,
  CallIntent,
  AdmissionInterestLevel,
  RecommendedActionType,
} from "@/app/types/outreach";
import { SupportedLanguages, LanguageNativeNames } from "@/app/types/outreach";
import { toast } from "sonner";
import {
  HiOutlinePhone,
  HiOutlineUserGroup,
  HiOutlineCalendar,
  HiOutlineClock,
  HiOutlineDocumentText,
  HiOutlineSparkles,
  HiOutlineCheckCircle,
  HiOutlinePlay,
  HiOutlineStop,
  HiOutlineChatBubbleLeftRight,
} from "react-icons/hi2";

type CallSessionState = "IDLE" | "CONNECTING" | "RINGING" | "CONNECTED" | "COMPLETED" | "FAILED";

export function CallingAgentWorkspace() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [selectedCampaign, setSelectedCampaign] = useState<CallingCampaign | null>(null);
  const [queue, setQueue] = useState<CallQueueItem[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<CallQueueItem | null>(null);

  const [callState, setCallState] = useState<CallSessionState>("IDLE");
  const [sessionId, setSessionId] = useState<string>("");
  const [durationSeconds, setDurationSeconds] = useState(0);
  const [transcript, setTranscript] = useState<CallTranscript[]>([]);
  const [sentiment, setSentiment] = useState<CallSentiment>("NEUTRAL");
  const [intent, setIntent] = useState<CallIntent>("ADMISSION_INTEREST");
  const [admissionInterest, setAdmissionInterest] = useState<AdmissionInterestLevel>("MEDIUM");
  const [recommendedAction, setRecommendedAction] = useState<RecommendedActionType>("NO_ACTION");
  const [callNotes, setCallNotes] = useState("");
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
  const [followUpDate, setFollowUpDate] = useState("");

  const { data: campaigns, isLoading: campaignsLoading } = useQuery({
    queryKey: ["calling-campaigns"],
    queryFn: async () => {
      const list = await callingAgentService.listCampaigns();
      return list;
    },
  });

  const { data: history, isLoading: historyLoading } = useQuery({
    queryKey: [
      "counsellor-call-history-workspace",
      selectedCampaign?.campaignId || selectedCampaign?.id,
    ],
    queryFn: async () => {
      if (!selectedCampaign) return { items: [] as CallOutcomeRecord[], total: 0 };
      const cid = selectedCampaign.campaignId || selectedCampaign.id;
      const res = await callingAgentService.getCallHistory(cid);
      return res;
    },
    enabled: !!selectedCampaign,
  });

  const fetchQueue = useCallback(async () => {
    if (!selectedCampaign) return;
    try {
      const cid = selectedCampaign.campaignId || selectedCampaign.id;
      const res = await callingAgentService.getQueue(cid);
      setQueue(res.items ?? []);
    } catch (err: unknown) {
      const error = err instanceof Error ? err : new Error(String(err));
      toast.error(error.message || "Failed to load queue");
    }
  }, [selectedCampaign]);

  useEffect(() => {
    fetchQueue();
  }, [fetchQueue]);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (callState === "CONNECTED" || callState === "RINGING") {
      timer = setInterval(() => {
        setDurationSeconds((d) => d + 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [callState]);

  const startCallMutation = useMutation({
    mutationFn: async (student: CallQueueItem) => {
      if (!selectedCampaign) throw new Error("No campaign selected");
      const cid = selectedCampaign.campaignId || selectedCampaign.id;
      return callingAgentService.startCallSession({
        campaignId: cid,
        queueItemId: student.queueId || student.id,
        language: student.preferredLanguage || "English",
      });
    },
    onSuccess: (session) => {
      setSessionId(session.sessionId);
      setCallState("CONNECTED");
      setDurationSeconds(0);
      setTranscript([
        {
          id: `tr-init-${Date.now()}`,
          speaker: "agent",
          text: session.initialGreeting,
          timestamp: new Date(),
          language: session.language,
        },
      ]);
      setSentiment("POSITIVE");
      setIntent("ADMISSION_INTEREST");
      setAdmissionInterest("MEDIUM");
      setRecommendedAction("SEND_COURSE_INFORMATION");
      toast.success("Call session started");
    },
    onError: (err: unknown) => {
      const error = err instanceof Error ? err : new Error(String(err));
      setCallState("FAILED");
      toast.error(error.message || "Failed to start call");
    },
  });

  const endCallMutation = useMutation({
    mutationFn: async () => {
      if (!selectedStudent || !sessionId) return;
      const cid = selectedCampaign?.campaignId || selectedCampaign?.id || "";
      await callingAgentService.recordOutcome(selectedStudent.queueId || selectedStudent.id, {
        outcome: "INTERESTED",
        sentiment,
        intent,
        admissionInterest,
        notes: callNotes,
        recommendedAction,
        actionReasoning: "Call ended by counsellor",
        durationSeconds,
        transcript,
        preferredLanguage: selectedStudent.preferredLanguage || "English",
      });
    },
    onSuccess: () => {
      toast.success("Call outcome saved");
      setCallState("IDLE");
      setSelectedStudent(null);
      setSessionId("");
      setTranscript([]);
      setDurationSeconds(0);
      setIsSaveModalOpen(false);
      queryClient.invalidateQueries({ queryKey: ["counsellor-call-history-workspace"] });
      queryClient.invalidateQueries({ queryKey: ["calling-campaigns"] });
      fetchQueue();
    },
    onError: (err: unknown) => {
      const error = err instanceof Error ? err : new Error(String(err));
      toast.error(error.message || "Failed to save call outcome");
    },
  });

  const handleStartCall = (student: CallQueueItem) => {
    setSelectedStudent(student);
    setCallState("CONNECTING");
    setCallNotes("");
    setFollowUpDate("");
    startCallMutation.mutate(student);
  };

  const handleEndCall = () => {
    setCallState("COMPLETED");
    setIsSaveModalOpen(true);
  };

  const handleSaveOutcome = () => {
    endCallMutation.mutate();
  };

  const columns = [
    {
      key: "studentName",
      header: "Candidate",
      cell: (row: CallQueueItem) => (
        <div>
          <p className="font-medium text-sm">{row.studentName}</p>
          <p className="text-xs text-muted-foreground font-mono">{row.phone}</p>
        </div>
      ),
    },
    {
      key: "courseInterest",
      header: "Course",
      cell: (row: CallQueueItem) => <span className="text-xs">{row.courseInterest}</span>,
    },
    {
      key: "status",
      header: "Status",
      cell: (row: CallQueueItem) => {
        const variant =
          row.status === "PENDING"
            ? "secondary"
            : row.status === "COMPLETED"
              ? "default"
              : row.status === "CALLBACK_SCHEDULED"
                ? "outline"
                : "outline";
        return <Badge variant={variant}>{row.status.replace(/_/g, " ")}</Badge>;
      },
    },
    {
      key: "priorityScore",
      header: "Lead Score",
      cell: (row: CallQueueItem) => <span className="text-xs font-mono">{row.priorityScore}</span>,
    },
    {
      key: "lastCalledAt",
      header: "Previous Call",
      cell: (row: CallQueueItem) => (
        <span className="text-xs text-muted-foreground">
          {row.lastCalledAt ? new Date(row.lastCalledAt).toLocaleDateString() : "Never"}
        </span>
      ),
    },
    {
      key: "nextCallbackAt",
      header: "Next Follow-up",
      cell: (row: CallQueueItem) => (
        <span className="text-xs text-muted-foreground">
          {row.nextCallbackAt ? new Date(row.nextCallbackAt).toLocaleDateString() : "Not scheduled"}
        </span>
      ),
    },
    {
      key: "actions",
      header: "Actions",
      cell: (row: CallQueueItem) => (
        <div className="flex items-center gap-1">
          <Button
            size="sm"
            onClick={() => handleStartCall(row)}
            disabled={row.status === "IN_PROGRESS" || row.status === "DNC"}
          >
            <HiOutlinePhone className="mr-1 h-4 w-4" />
            Call
          </Button>
          <Button size="sm" variant="outline" onClick={() => navigate({ to: `/inquiries` })}>
            <HiOutlineDocumentText className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];

  const formatTimer = (secs: number) => {
    const m = Math.floor(secs / 60)
      .toString()
      .padStart(2, "0");
    const s = (secs % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Calling Agent Workspace"
        description="Manage outreach calls and student interactions"
        actions={
          <Button onClick={() => navigate({ to: "/outreach" })}>
            <HiOutlineSparkles className="mr-2 h-4 w-4" />
            Full Outreach Console
          </Button>
        }
      />

      <div className="grid gap-6 lg:grid-cols-12">
        {/* Left: Queue & Candidate List */}
        <div className="lg:col-span-4 space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium">Campaign Queue</CardTitle>
                <select
                  className="text-xs border rounded-md px-2 py-1 bg-background"
                  value={selectedCampaign?.campaignId || selectedCampaign?.id || ""}
                  onChange={(e) => {
                    const camp = campaigns?.find((c) => (c.campaignId || c.id) === e.target.value);
                    if (camp) setSelectedCampaign(camp);
                  }}
                >
                  <option value="">Select campaign</option>
                  {(campaigns ?? []).map((c) => (
                    <option key={c.campaignId || c.id} value={c.campaignId || c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
            </CardHeader>
            <CardContent>
              <DataTable
                data={queue}
                columns={columns}
                keyExtractor={(row) => row.id || row.queueId}
                isLoading={campaignsLoading}
                searchable
                searchPlaceholder="Search candidates..."
                emptyState={{
                  icon: HiOutlineUserGroup,
                  title: "No candidates in queue",
                  description: "Import leads into a campaign to start calling.",
                  action: {
                    label: "Go to Outreach",
                    onClick: () => navigate({ to: "/outreach" }),
                  },
                }}
              />
            </CardContent>
          </Card>
        </div>

        {/* Right: Call Workspace */}
        <div className="lg:col-span-8 space-y-4">
          {!selectedStudent ? (
            <Card className="p-10 text-center space-y-4">
              <HiOutlinePhone className="h-12 w-12 text-muted-foreground mx-auto opacity-50" />
              <h2 className="text-xl font-display font-semibold">No Active Call</h2>
              <p className="text-sm text-muted-foreground max-w-md mx-auto">
                Select a candidate from the queue and click Call to start an AI-assisted outreach
                session.
              </p>
            </Card>
          ) : (
            <div className="space-y-4">
              {/* Candidate Context */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <HiOutlineUserGroup className="h-4 w-4" />
                    {selectedStudent.studentName}
                  </CardTitle>
                </CardHeader>
                <CardContent className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 text-xs">
                  <div>
                    <p className="text-muted-foreground">Phone</p>
                    <p className="font-mono font-medium">{selectedStudent.phone}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Course</p>
                    <p className="font-medium">{selectedStudent.courseInterest}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Lead Status</p>
                    <Badge variant="secondary">
                      {selectedStudent.leadStage.replace(/_/g, " ")}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Lead Score</p>
                    <p className="font-mono font-medium">{selectedStudent.priorityScore}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Attempts</p>
                    <p className="font-medium">
                      {selectedStudent.attempts} / {selectedStudent.maxAttempts}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Previous Calls</p>
                    <p className="font-medium">
                      {selectedStudent.lastCalledAt
                        ? new Date(selectedStudent.lastCalledAt).toLocaleDateString()
                        : "None"}
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Call Controls */}
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-medium flex items-center gap-2">
                      <HiOutlinePhone className="h-4 w-4" />
                      Call Session
                    </CardTitle>
                    <div className="flex items-center gap-2">
                      <Badge
                        variant={
                          callState === "CONNECTED" || callState === "RINGING"
                            ? "default"
                            : callState === "FAILED"
                              ? "destructive"
                              : "secondary"
                        }
                      >
                        {callState}
                      </Badge>
                      <Badge variant="outline" className="font-mono">
                        {formatTimer(durationSeconds)}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {callState === "IDLE" && (
                    <div className="flex gap-2">
                      <Button
                        onClick={() => selectedStudent && handleStartCall(selectedStudent)}
                        className="gap-2"
                      >
                        <HiOutlinePlay className="h-4 w-4" />
                        Start Call
                      </Button>
                      <Button variant="outline" onClick={() => navigate({ to: "/outreach" })}>
                        AI Call
                      </Button>
                    </div>
                  )}

                  {(callState === "CONNECTED" || callState === "RINGING") && (
                    <div className="flex gap-2">
                      <Button variant="destructive" onClick={handleEndCall} className="gap-2">
                        <HiOutlineStop className="h-4 w-4" />
                        End Call
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => navigate({ to: "/counsellor/followups" })}
                      >
                        <HiOutlineCalendar className="mr-1 h-4 w-4" />
                        Schedule Follow-up
                      </Button>
                    </div>
                  )}

                  {callState === "FAILED" && (
                    <div className="text-sm text-destructive">
                      Call failed to connect. Please try again or use the full outreach console.
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Live Transcript */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <HiOutlineChatBubbleLeftRight className="h-4 w-4" />
                    Transcript
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64 overflow-y-auto rounded-lg border border-border bg-muted/20 p-3 space-y-2">
                    {transcript.length === 0 && (
                      <p className="text-xs text-muted-foreground text-center py-8">
                        No transcript yet. Start a call to begin recording.
                      </p>
                    )}
                    {transcript.map((entry) => (
                      <div
                        key={entry.id}
                        className={`flex ${entry.speaker === "agent" ? "justify-start" : "justify-end"}`}
                      >
                        <div
                          className={`max-w-[80%] rounded-lg px-3 py-2 text-xs space-y-1 ${
                            entry.speaker === "agent"
                              ? "bg-primary/10 border border-primary/20"
                              : "bg-muted"
                          }`}
                        >
                          <p className="font-semibold text-[10px] text-muted-foreground">
                            {entry.speaker === "agent" ? "AI Agent" : "Student"}
                          </p>
                          <p className="text-sm">{entry.text}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* AI Intelligence */}
              {(callState === "CONNECTED" ||
                callState === "RINGING" ||
                callState === "COMPLETED") && (
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium flex items-center gap-2">
                      <HiOutlineSparkles className="h-4 w-4" />
                      AI Intelligence
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 text-xs">
                    <div>
                      <p className="text-muted-foreground">Sentiment</p>
                      <Badge variant="outline">{sentiment}</Badge>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Intent</p>
                      <Badge variant="secondary">{intent.replace(/_/g, " ")}</Badge>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Interest Level</p>
                      <Badge variant={admissionInterest === "HIGH" ? "default" : "secondary"}>
                        {admissionInterest}
                      </Badge>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Recommended Action</p>
                      <span className="text-xs">{recommendedAction.replace(/_/g, " ")}</span>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Call History Below */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium">Recent Calls</CardTitle>
            <Button
              size="sm"
              variant="ghost"
              onClick={() =>
                queryClient.invalidateQueries({ queryKey: ["counsellor-call-history-workspace"] })
              }
            >
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <DataTable
            data={history?.items ?? []}
            columns={[
              {
                key: "studentName",
                header: "Candidate",
                cell: (row: CallOutcomeRecord) => (
                  <div>
                    <p className="font-medium text-sm">{row.studentName}</p>
                    <p className="text-xs text-muted-foreground font-mono">{row.phone}</p>
                  </div>
                ),
              },
              {
                key: "createdAt",
                header: "Date",
                cell: (row: CallOutcomeRecord) => (
                  <span className="text-xs text-muted-foreground">
                    {new Date(row.createdAt).toLocaleDateString()}
                  </span>
                ),
              },
              {
                key: "durationSeconds",
                header: "Duration",
                cell: (row: CallOutcomeRecord) => (
                  <span className="text-xs">
                    {Math.floor(row.durationSeconds / 60)}m {row.durationSeconds % 60}s
                  </span>
                ),
              },
              {
                key: "outcome",
                header: "Outcome",
                cell: (row: CallOutcomeRecord) => <Badge>{row.outcome.replace(/_/g, " ")}</Badge>,
              },
              {
                key: "sentiment",
                header: "Sentiment",
                cell: (row: CallOutcomeRecord) => (
                  <Badge variant="secondary">{row.sentiment}</Badge>
                ),
              },
              {
                key: "recommendedAction",
                header: "Next Action",
                cell: (row: CallOutcomeRecord) => (
                  <span className="text-xs text-muted-foreground">
                    {row.recommendedAction.replace(/_/g, " ")}
                  </span>
                ),
              },
            ]}
            keyExtractor={(row) => row.id}
            isLoading={historyLoading}
            emptyState={{
              icon: HiOutlinePhone,
              title: "No call history",
              description: "Completed calls will appear here after each session.",
            }}
          />
        </CardContent>
      </Card>

      {/* Save Outcome Modal */}
      <Dialog open={isSaveModalOpen} onOpenChange={setIsSaveModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Call Summary & Outcome</DialogTitle>
            <DialogDescription>
              Review and confirm the call outcome before continuing.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-2 text-xs">
            <div className="space-y-1">
              <Label className="text-xs">Call Notes</Label>
              <Textarea
                value={callNotes}
                onChange={(e) => setCallNotes(e.target.value)}
                className="text-sm h-20"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Follow-up Date</Label>
              <Input
                type="date"
                value={followUpDate}
                onChange={(e) => setFollowUpDate(e.target.value)}
                className="text-sm"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsSaveModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveOutcome} className="gap-1.5">
              <HiOutlineCheckCircle className="h-4 w-4" />
              Save Record
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
