"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
  PhoneOff,
  Mic,
  MicOff,
  SkipForward,
  RotateCcw,
  Languages,
  Sparkles,
  ShieldAlert,
  Calendar,
  Clock,
  User,
  GraduationCap,
  Building2,
  FileCheck,
  Send,
  CheckCircle2,
  AlertTriangle,
  UserCheck,
  PhoneForwarded,
  Info,
} from "lucide-react";
import { AIOrb } from "@/app/components/ai/ai-orb";
import { WaveformVisualizer } from "./WaveformVisualizer";
import { callingAgentService } from "@/app/services/calling-agent.service";
import type {
  CallQueueItem,
  CallTranscript,
  SupportedLanguage,
  CallState,
  CallSentiment,
  CallIntent,
  AdmissionInterestLevel,
  RecommendedActionType,
  CallOutcome,
} from "@/app/types/outreach";
import { SupportedLanguages, LanguageNativeNames } from "@/app/types/outreach";
import { toast } from "sonner";

interface CallStudioProps {
  currentStudent: CallQueueItem | null;
  campaignId: string;
  collegeName?: string;
  onCallEnded: () => void;
  onNextStudent: () => void;
}

export function CallStudio({
  currentStudent,
  campaignId,
  collegeName = "Nexora Institute of Technology",
  onCallEnded,
  onNextStudent,
}: CallStudioProps) {
  // Call State
  const [callState, setCallState] = useState<CallState>("IDLE");
  const [sessionId, setSessionId] = useState<string>("");
  const [durationSeconds, setDurationSeconds] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState<SupportedLanguage>(
    currentStudent?.preferredLanguage || "English",
  );

  // Transcript & Conversation
  const [transcript, setTranscript] = useState<CallTranscript[]>([]);
  const [customInput, setCustomInput] = useState("");
  const [isAiThinking, setIsAiThinking] = useState(false);

  // AI Live Intelligence
  const [sentiment, setSentiment] = useState<CallSentiment>("NEUTRAL");
  const [intent, setIntent] = useState<CallIntent>("ADMISSION_INTEREST");
  const [admissionInterest, setAdmissionInterest] = useState<AdmissionInterestLevel>("MEDIUM");
  const [primaryConcern, setPrimaryConcern] = useState<string>("");
  const [recommendedAction, setRecommendedAction] = useState<RecommendedActionType>("NO_ACTION");
  const [actionReasoning, setActionReasoning] = useState<string>("");
  const [suggestedOutcome, setSuggestedOutcome] = useState<CallOutcome>("INTERESTED");

  // Human Action Approval Modals
  const [isCallbackModalOpen, setIsCallbackModalOpen] = useState(false);
  const [isCampusVisitModalOpen, setIsCampusVisitModalOpen] = useState(false);
  const [isEscalateModalOpen, setIsEscalateModalOpen] = useState(false);
  const [isDncModalOpen, setIsDncModalOpen] = useState(false);
  const [isSaveOutcomeModalOpen, setIsSaveOutcomeModalOpen] = useState(false);

  // Form Fields for Actions
  const [callbackDateTime, setCallbackDateTime] = useState("");
  const [campusVisitDate, setCampusVisitDate] = useState("");
  const [campusVisitTimeSlot, setCampusVisitTimeSlot] = useState("11:00 AM - 01:00 PM");
  const [assignedCounselor, setAssignedCounselor] = useState("Senior Admissions Officer (B.Tech)");
  const [callNotes, setCallNotes] = useState("");

  const transcriptEndRef = useRef<HTMLDivElement | null>(null);

  // Timer Effect
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (
      callState === "CONNECTED" ||
      callState === "SPEAKING" ||
      callState === "LISTENING" ||
      callState === "THINKING"
    ) {
      timer = setInterval(() => {
        setDurationSeconds((d) => d + 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [callState]);

  // Scroll transcript to bottom
  useEffect(() => {
    transcriptEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [transcript]);

  // Sync language when student changes
  useEffect(() => {
    if (currentStudent?.preferredLanguage) {
      setSelectedLanguage(currentStudent.preferredLanguage);
    }
  }, [currentStudent]);

  const formatTimer = (secs: number) => {
    const m = Math.floor(secs / 60)
      .toString()
      .padStart(2, "0");
    const s = (secs % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  // ─── Initiate Call ──────────────────────────────────────────────────────────

  const handleStartCall = async () => {
    if (!currentStudent) {
      toast.error("No prospective student lead selected");
      return;
    }

    setCallState("CONNECTING");
    setTranscript([]);
    setDurationSeconds(0);

    try {
      setTimeout(async () => {
        setCallState("RINGING");
        setTimeout(async () => {
          try {
            const session = await callingAgentService.startCallSession({
              campaignId,
              queueItemId: currentStudent.queueId,
              language: selectedLanguage,
            });

            setSessionId(session.sessionId);
            setSelectedLanguage(session.language);
            setCallState("SPEAKING");

            const initialTurn: CallTranscript = {
              id: `tr-init-${Date.now()}`,
              speaker: "agent",
              text: session.initialGreeting,
              timestamp: new Date(),
              language: session.language,
              sentiment: "POSITIVE",
              intent: "ADMISSION_INTEREST",
            };

            setTranscript([initialTurn]);
            setSentiment("POSITIVE");
            setIntent("ADMISSION_INTEREST");
            setAdmissionInterest("MEDIUM");
            setRecommendedAction("SEND_COURSE_INFORMATION");
            setActionReasoning("Initial introduction completed; awaiting student response.");

            setTimeout(() => {
              setCallState("LISTENING");
            }, 3000);
          } catch (err: any) {
            setCallState("FAILED");
            toast.error(err?.message || "Failed to start AI call session");
          }
        }, 1200);
      }, 800);
    } catch (err: any) {
      setCallState("FAILED");
      toast.error("Could not connect call");
    }
  };

  // ─── Process Student Utterance / Dialog Turn ───────────────────────────────

  const handleSendUtterance = async (utteranceText: string) => {
    if (!utteranceText.trim() || !currentStudent) return;

    // 1. Append student message to transcript
    const studentTurn: CallTranscript = {
      id: `tr-stu-${Date.now()}`,
      speaker: "student",
      text: utteranceText,
      timestamp: new Date(),
      language: selectedLanguage,
    };

    setTranscript((prev) => [...prev, studentTurn]);
    setCustomInput("");
    setCallState("THINKING");
    setIsAiThinking(true);

    try {
      const response = await callingAgentService.interactTurn({
        sessionId: sessionId || `sim-sess-${Date.now()}`,
        queueItemId: currentStudent.queueId,
        campaignId,
        studentUtterance: utteranceText,
        currentLanguage: selectedLanguage,
        transcriptHistory: transcript,
      });

      if (response.languageChanged && response.language) {
        setSelectedLanguage(response.language);
        toast.info(`Language switched to ${response.language}`);
      }

      setSentiment(response.sentiment);
      setIntent(response.intent);
      setAdmissionInterest(response.admissionInterest);
      if (response.primaryConcern) setPrimaryConcern(response.primaryConcern);
      setRecommendedAction(response.recommendedAction);
      setActionReasoning(response.actionReasoning);
      setSuggestedOutcome(response.suggestedOutcome);

      // Append agent reply
      const agentTurn: CallTranscript = {
        id: `tr-agent-${Date.now()}`,
        speaker: "agent",
        text: response.agentResponse,
        timestamp: new Date(),
        language: response.language || selectedLanguage,
        sentiment: response.sentiment,
        intent: response.intent,
      };

      setTranscript((prev) => [...prev, agentTurn]);
      setCallState("SPEAKING");

      setTimeout(() => {
        if (response.shouldEndCall) {
          setCallState("COMPLETED");
          setIsSaveOutcomeModalOpen(true);
        } else {
          setCallState("LISTENING");
        }
      }, 3500);
    } catch (err: any) {
      setCallState("LISTENING");
      toast.error("AI response error");
    } finally {
      setIsAiThinking(false);
    }
  };

  // ─── End Call & Save Outcome ──────────────────────────────────────────────

  const handleEndCall = () => {
    setCallState("COMPLETED");
    setIsSaveOutcomeModalOpen(true);
  };

  const handleSaveOutcome = async () => {
    if (!currentStudent) return;

    try {
      await callingAgentService.recordOutcome(currentStudent.queueId, {
        outcome: suggestedOutcome,
        sentiment,
        intent,
        admissionInterest,
        primaryConcern,
        notes: callNotes,
        recommendedAction,
        actionReasoning,
        callbackTime: callbackDateTime ? new Date(callbackDateTime) : undefined,
        durationSeconds,
        transcript,
        preferredLanguage: selectedLanguage,
      });

      toast.success("Call record & conversation intelligence saved successfully!");
      setIsSaveOutcomeModalOpen(false);
      onCallEnded();
    } catch (err: any) {
      toast.error(err?.message || "Failed to save call outcome");
    }
  };

  // ─── Human Action Approvals ───────────────────────────────────────────────

  const handleApproveCallback = async () => {
    if (!callbackDateTime) {
      toast.error("Please select a callback date and time");
      return;
    }
    setSuggestedOutcome("CALLBACK_REQUESTED");
    setCallNotes(
      (prev) =>
        `${prev}\n[HUMAN APPROVED CALLBACK]: Scheduled for ${new Date(callbackDateTime).toLocaleString()}`,
    );
    setIsCallbackModalOpen(false);
    toast.success("Counselor callback scheduled and prioritized in queue");
  };

  const handleApproveCampusVisit = async () => {
    if (!campusVisitDate) {
      toast.error("Please select a campus visit date");
      return;
    }
    setSuggestedOutcome("CAMPUS_VISIT_SCHEDULED");
    setCallNotes(
      (prev) =>
        `${prev}\n[HUMAN APPROVED CAMPUS VISIT]: Booked on ${campusVisitDate} (${campusVisitTimeSlot})`,
    );
    setIsCampusVisitModalOpen(false);
    toast.success("Campus visit appointment confirmed");
  };

  const handleApproveEscalation = async () => {
    setSuggestedOutcome("COUNSELOR_ESCALATED");
    setCallNotes(
      (prev) =>
        `${prev}\n[HUMAN APPROVED ESCALATION]: Assigned to ${assignedCounselor}. Full transcript attached.`,
    );
    setIsEscalateModalOpen(false);
    toast.success("Senior counselor escalation registered");
  };

  const handleApproveDnc = async () => {
    setSuggestedOutcome("OPTED_OUT_DNC");
    setCallNotes((prev) => `${prev}\n[HUMAN APPROVED DNC]: Added to Do Not Call registry.`);
    setIsDncModalOpen(false);
    toast.warning("Contact marked as Do Not Call (DNC)");
  };

  if (!currentStudent) {
    return (
      <Card className="panel p-10 text-center space-y-4">
        <User className="size-12 text-muted-foreground mx-auto opacity-50" />
        <h2 className="text-xl font-display font-semibold">No Active Student Lead Selected</h2>
        <p className="text-sm text-muted-foreground max-w-md mx-auto">
          Please select a student from the Smart Priority Queue or click &quot;Call Next
          Student&quot; to begin admissions outreach.
        </p>
        <Button onClick={onNextStudent} className="gap-2">
          <PhoneCall className="size-4" />
          Fetch Next Priority Lead
        </Button>
      </Card>
    );
  }

  const isCallActive =
    callState === "CONNECTED" ||
    callState === "SPEAKING" ||
    callState === "LISTENING" ||
    callState === "THINKING";

  return (
    <div className="space-y-4">
      {/* Simulation Mode Disclaimer Banner */}
      <div className="bg-sky-500/10 border border-sky-500/30 rounded-xl px-4 py-2.5 flex flex-wrap items-center justify-between gap-2 shadow-soft">
        <div className="flex items-center gap-2 text-xs font-medium text-sky">
          <span className="size-2 rounded-full bg-sky animate-ping" />
          <span className="font-semibold uppercase tracking-wider">⚡ Simulation Mode:</span>
          <span>
            Calls and conversation turns are processed via AI simulation. No cellular / telephony
            charges are incurred.
          </span>
        </div>
        <Badge variant="outline" className="border-sky/40 text-sky text-[11px]">
          Demo Calling Engine
        </Badge>
      </div>

      {/* Main Studio Grid */}
      <div className="grid gap-4 lg:grid-cols-12">
        {/* Left: Student Admission Context (3 cols) */}
        <div className="lg:col-span-3 space-y-4">
          <Card className="panel p-5 space-y-4">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-mono text-muted-foreground font-semibold uppercase">
                  Prospective Lead
                </span>
                <Badge
                  variant="outline"
                  className={
                    currentStudent.priorityLevel === "URGENT"
                      ? "border-destructive text-destructive bg-destructive/10"
                      : currentStudent.priorityLevel === "HIGH"
                        ? "border-sky text-sky bg-sky/10"
                        : "border-muted-foreground text-muted-foreground"
                  }
                >
                  {currentStudent.priorityLevel} ({currentStudent.priorityScore})
                </Badge>
              </div>
              <h2 className="text-lg font-display font-semibold text-foreground mt-1">
                {currentStudent.studentName}
              </h2>
              <p className="font-mono text-xs text-muted-foreground">{currentStudent.phone}</p>
            </div>

            <div className="space-y-2.5 text-xs divide-y divide-border/60">
              <div className="pt-2 flex items-center justify-between">
                <span className="text-muted-foreground">Target Program:</span>
                <span className="font-semibold text-foreground">
                  {currentStudent.courseInterest}
                </span>
              </div>

              <div className="pt-2 flex items-center justify-between">
                <span className="text-muted-foreground">Academic Score:</span>
                <span className="font-semibold text-sky">
                  {currentStudent.academicScore
                    ? `${currentStudent.academicScore}%`
                    : "Not Provided"}
                </span>
              </div>

              <div className="pt-2 flex items-center justify-between">
                <span className="text-muted-foreground">Qualification:</span>
                <span className="text-foreground">
                  {currentStudent.academicQualification || "12th Standard / HSC"}
                </span>
              </div>

              <div className="pt-2 flex items-center justify-between">
                <span className="text-muted-foreground">Lead Stage:</span>
                <Badge variant="secondary" className="text-[10px]">
                  {currentStudent.leadStage}
                </Badge>
              </div>

              <div className="pt-2 flex items-center justify-between">
                <span className="text-muted-foreground">Attempts:</span>
                <span className="font-medium text-foreground">
                  {currentStudent.attempts} / {currentStudent.maxAttempts}
                </span>
              </div>
            </div>

            {currentStudent.notes && (
              <div className="rounded-lg bg-muted/40 p-2.5 text-xs text-muted-foreground">
                <span className="font-medium text-foreground block mb-0.5">Background Notes:</span>
                {currentStudent.notes}
              </div>
            )}
          </Card>

          {/* College Knowledge Snapshot */}
          <Card className="panel p-4 space-y-2 text-xs">
            <div className="flex items-center gap-1.5 font-semibold text-foreground">
              <Building2 className="size-4 text-sky" />
              <span>Approved College Knowledge</span>
            </div>
            <ul className="space-y-1 text-muted-foreground list-disc list-inside">
              <li>Annual Tuition: ₹1,45,000 / year</li>
              <li>Merit Scholarship: Up to 40% (&gt;85% score)</li>
              <li>94% Placement Rate (Avg ₹8.2 LPA)</li>
              <li>Campus Tours: Mon - Sat (10am - 4pm)</li>
            </ul>
          </Card>
        </div>

        {/* Center: AI Call Stage & Live Transcript (6 cols) */}
        <div className="lg:col-span-6 space-y-4">
          <Card className="panel p-5 space-y-4 shadow-lift">
            {/* Top Bar: Call State & Language Selector */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/60 pb-3">
              <div className="flex items-center gap-3">
                <div className="size-3 rounded-full bg-success animate-pulse" />
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-display font-semibold text-sm">
                      {callState === "IDLE" && "Call Ready"}
                      {callState === "CONNECTING" && "Connecting AI Agent..."}
                      {callState === "RINGING" && "Ringing Student..."}
                      {callState === "SPEAKING" && "AI Speaking"}
                      {callState === "LISTENING" && "Listening to Student..."}
                      {callState === "THINKING" && "AI Analyzing Turn..."}
                      {callState === "COMPLETED" && "Call Completed"}
                      {callState === "FAILED" && "Call Failed"}
                    </span>
                    <Badge variant="outline" className="font-mono text-[11px]">
                      {formatTimer(durationSeconds)}
                    </Badge>
                  </div>
                </div>
              </div>

              {/* 10-Language Selector with Native Scripts */}
              <div className="flex items-center gap-2">
                <Languages className="size-4 text-muted-foreground" />
                <Select
                  value={selectedLanguage}
                  onValueChange={(val: SupportedLanguage) => {
                    setSelectedLanguage(val);
                    toast.info(`Language set to ${val}`);
                  }}
                  disabled={!isCallActive && callState !== "IDLE"}
                >
                  <SelectTrigger className="w-[170px] h-8 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {SupportedLanguages.map((lang) => (
                      <SelectItem key={lang} value={lang} className="text-xs">
                        {LanguageNativeNames[lang]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* AI Orb & Waveform Stage */}
            <div className="flex flex-col items-center justify-center py-4 space-y-3 bg-gradient-to-b from-card/80 to-muted/20 rounded-xl border border-border/40">
              <AIOrb
                size={64}
                state={
                  callState === "SPEAKING"
                    ? "speaking"
                    : callState === "THINKING"
                      ? "thinking"
                      : "idle"
                }
              />
              <WaveformVisualizer state={callState} className="w-full max-w-xs" />
              <p className="text-xs text-muted-foreground italic">
                {callState === "IDLE" && 'Press "Start Call" to initiate admissions simulation'}
                {callState === "SPEAKING" && "AI Counselor speaking in selected language..."}
                {callState === "LISTENING" && "Waiting for student utterance..."}
                {callState === "THINKING" &&
                  "Synthesizing admission response & intent detection..."}
              </p>
            </div>

            {/* Live Animated Transcript */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Live Multilingual Transcript
                </Label>
                <span className="text-[11px] text-muted-foreground">
                  {transcript.length} turns recorded
                </span>
              </div>

              <div className="h-60 overflow-y-auto rounded-xl border border-border bg-card/40 p-3.5 space-y-3">
                <AnimatePresence initial={false}>
                  {transcript.map((entry) => {
                    const isAgent = entry.speaker === "agent";
                    return (
                      <motion.div
                        key={entry.id}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`flex ${isAgent ? "justify-start" : "justify-end"}`}
                      >
                        <div
                          className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-xs space-y-1 ${
                            isAgent
                              ? "bg-primary/10 border border-primary/20 text-foreground"
                              : "bg-muted text-foreground"
                          }`}
                        >
                          <div className="flex items-center justify-between gap-2 text-[10px] text-muted-foreground">
                            <span className="font-semibold text-primary">
                              {isAgent ? "🤖 AI Admissions Assistant" : "👤 Student"}
                            </span>
                            <span>
                              {new Date(entry.timestamp).toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit",
                                second: "2-digit",
                              })}
                            </span>
                          </div>

                          <p className="text-sm leading-relaxed whitespace-pre-wrap">
                            {entry.text}
                          </p>

                          <div className="flex items-center gap-1.5 pt-1">
                            {entry.language && (
                              <Badge variant="outline" className="text-[9px] px-1.5 py-0">
                                {entry.language}
                              </Badge>
                            )}
                            {entry.sentiment && (
                              <Badge variant="secondary" className="text-[9px] px-1.5 py-0">
                                {entry.sentiment}
                              </Badge>
                            )}
                            {entry.intent && (
                              <Badge variant="secondary" className="text-[9px] px-1.5 py-0">
                                {entry.intent.replace(/_/g, " ")}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
                <div ref={transcriptEndRef} />
              </div>
            </div>

            {/* Quick Student Response Simulator (Preset Buttons + Custom Input) */}
            {isCallActive && (
              <div className="space-y-2 pt-1">
                <Label className="text-xs font-semibold text-muted-foreground">
                  Simulate Student Response
                </Label>

                {/* Preset Prompt Buttons */}
                <div className="flex flex-wrap gap-1.5">
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-xs h-7 px-2"
                    onClick={() =>
                      handleSendUtterance(
                        "What is the fee structure for B.Tech and are there any scholarships?",
                      )
                    }
                    disabled={isAiThinking}
                  >
                    💰 Inquire Fees
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-xs h-7 px-2"
                    onClick={() =>
                      handleSendUtterance(
                        "I want to visit the campus and labs this Saturday with my parents.",
                      )
                    }
                    disabled={isAiThinking}
                  >
                    🏛️ Campus Visit
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-xs h-7 px-2"
                    onClick={() =>
                      handleSendUtterance("I am busy right now, please call me tomorrow evening.")
                    }
                    disabled={isAiThinking}
                  >
                    📞 Request Callback
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-xs h-7 px-2"
                    onClick={() =>
                      handleSendUtterance(
                        "Can I talk to a senior admission counselor for detailed guidance?",
                      )
                    }
                    disabled={isAiThinking}
                  >
                    👨‍🏫 Escalate Counselor
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-xs h-7 px-2"
                    onClick={() => handleSendUtterance("मला मराठीत बोलायला आवडेल.")}
                    disabled={isAiThinking}
                  >
                    मराठी Switch
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-xs h-7 px-2"
                    onClick={() => handleSendUtterance("कृपया हिंदी में जानकारी दीजिए।")}
                    disabled={isAiThinking}
                  >
                    हिंदी Switch
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-xs h-7 px-2 text-destructive border-destructive/30 hover:bg-destructive/10"
                    onClick={() =>
                      handleSendUtterance("Please do not call me again and remove my number.")
                    }
                    disabled={isAiThinking}
                  >
                    🚫 Opt-out / DNC
                  </Button>
                </div>

                {/* Custom Speech/Text Box */}
                <div className="flex gap-2">
                  <Input
                    placeholder="Type custom student response in any language..."
                    value={customInput}
                    onChange={(e) => setCustomInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSendUtterance(customInput)}
                    className="text-xs h-9"
                    disabled={isAiThinking}
                  />
                  <Button
                    size="sm"
                    onClick={() => handleSendUtterance(customInput)}
                    disabled={!customInput.trim() || isAiThinking}
                    className="h-9 px-3"
                  >
                    <Send className="size-3.5" />
                  </Button>
                </div>
              </div>
            )}

            {/* Bottom Call Controls Toolbar */}
            <div className="flex items-center justify-between gap-2 pt-2 border-t border-border/60">
              <div className="flex gap-2">
                {!isCallActive ? (
                  <Button
                    onClick={handleStartCall}
                    className="gap-2 shadow-glow bg-primary hover:bg-primary/90"
                    size="sm"
                  >
                    <PhoneCall className="size-4" />
                    Start Admission Call
                  </Button>
                ) : (
                  <Button onClick={handleEndCall} variant="destructive" size="sm" className="gap-2">
                    <PhoneOff className="size-4" />
                    End Call
                  </Button>
                )}

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsMuted((m) => !m)}
                  disabled={!isCallActive}
                  className="gap-1.5"
                >
                  {isMuted ? (
                    <MicOff className="size-4 text-destructive" />
                  ) : (
                    <Mic className="size-4" />
                  )}
                  {isMuted ? "Unmute" : "Mute"}
                </Button>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onNextStudent}
                  className="gap-1.5 text-xs"
                >
                  <SkipForward className="size-4" />
                  Skip / Next
                </Button>
              </div>
            </div>
          </Card>
        </div>

        {/* Right: AI Intelligence & Human Approval Workflow (3 cols) */}
        <div className="lg:col-span-3 space-y-4">
          {/* Live AI Intelligence Panel */}
          <Card className="panel p-5 space-y-4">
            <div className="flex items-center gap-2 border-b border-border/60 pb-2.5">
              <Sparkles className="size-4 text-sky" />
              <h3 className="font-display font-semibold text-sm">AI Admission Intelligence</h3>
            </div>

            <div className="space-y-3 text-xs">
              {/* Sentiment Gauge */}
              <div>
                <span className="text-muted-foreground block mb-1">Live Sentiment</span>
                <Badge
                  variant="outline"
                  className={
                    sentiment === "POSITIVE"
                      ? "border-success text-success bg-success/10 font-semibold"
                      : sentiment === "FRUSTRATED" || sentiment === "URGENT"
                        ? "border-destructive text-destructive bg-destructive/10 font-semibold"
                        : "border-muted-foreground text-muted-foreground"
                  }
                >
                  {sentiment}
                </Badge>
              </div>

              {/* Detected Intent */}
              <div>
                <span className="text-muted-foreground block mb-1">Primary Intent</span>
                <Badge variant="secondary" className="font-mono text-[11px]">
                  {intent.replace(/_/g, " ")}
                </Badge>
              </div>

              {/* Admission Interest Level */}
              <div>
                <span className="text-muted-foreground block mb-1">Admission Interest Level</span>
                <div className="flex items-center gap-2">
                  <Badge
                    variant={
                      admissionInterest === "HIGH"
                        ? "default"
                        : admissionInterest === "MEDIUM"
                          ? "secondary"
                          : "outline"
                    }
                    className="font-bold"
                  >
                    {admissionInterest}
                  </Badge>
                </div>
              </div>

              {/* Primary Concern */}
              {primaryConcern && (
                <div className="rounded-md bg-muted/40 p-2 text-muted-foreground">
                  <span className="font-medium text-foreground block">Key Consideration:</span>
                  {primaryConcern}
                </div>
              )}
            </div>

            {/* AI Recommendation Box */}
            <div className="rounded-xl border border-sky-500/30 bg-sky-500/5 p-3 space-y-1.5">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-sky">
                <Sparkles className="size-3.5" />
                <span>AI Recommended Next Step</span>
              </div>
              <p className="text-xs font-medium text-foreground">
                {recommendedAction.replace(/_/g, " ")}
              </p>
              {actionReasoning && (
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  {actionReasoning}
                </p>
              )}
            </div>
          </Card>

          {/* Human-Approved Action Workflow Card */}
          <Card className="panel p-5 space-y-3 border-amber-500/30 bg-amber-500/5">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-500">
              <ShieldAlert className="size-4" />
              <span>Human-Approved Workflow</span>
            </div>

            <p className="text-[11px] text-muted-foreground leading-relaxed">
              AI recommendations are advisory. Staff confirmation is required to update admission
              records or schedule appointments.
            </p>

            <div className="space-y-2 pt-1">
              <Button
                variant="outline"
                size="sm"
                className="w-full justify-start gap-2 text-xs h-8 border-sky/40 text-sky hover:bg-sky/10"
                onClick={() => setIsCallbackModalOpen(true)}
              >
                <Calendar className="size-3.5" />
                Approve Callback
              </Button>

              <Button
                variant="outline"
                size="sm"
                className="w-full justify-start gap-2 text-xs h-8 border-emerald-500/40 text-emerald-400 hover:bg-emerald-500/10"
                onClick={() => setIsCampusVisitModalOpen(true)}
              >
                <Building2 className="size-3.5" />
                Approve Campus Visit
              </Button>

              <Button
                variant="outline"
                size="sm"
                className="w-full justify-start gap-2 text-xs h-8 border-purple-500/40 text-purple-400 hover:bg-purple-500/10"
                onClick={() => setIsEscalateModalOpen(true)}
              >
                <PhoneForwarded className="size-3.5" />
                Approve Counselor Escalation
              </Button>

              <Button
                variant="outline"
                size="sm"
                className="w-full justify-start gap-2 text-xs h-8 border-destructive/40 text-destructive hover:bg-destructive/10"
                onClick={() => setIsDncModalOpen(true)}
              >
                <ShieldAlert className="size-3.5" />
                Approve Do Not Call (DNC)
              </Button>
            </div>
          </Card>
        </div>
      </div>

      {/* ─── MODAL 1: Schedule Callback ─── */}
      <Dialog open={isCallbackModalOpen} onOpenChange={setIsCallbackModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Approve & Schedule Counselor Callback</DialogTitle>
            <DialogDescription>
              Set the preferred callback date and time requested by {currentStudent.studentName}.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <div className="space-y-1">
              <Label className="text-xs">Callback Date & Time</Label>
              <Input
                type="datetime-local"
                value={callbackDateTime}
                onChange={(e) => setCallbackDateTime(e.target.value)}
                className="text-sm"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCallbackModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleApproveCallback}>Confirm & Schedule Callback</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ─── MODAL 2: Campus Visit ─── */}
      <Dialog open={isCampusVisitModalOpen} onOpenChange={setIsCampusVisitModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Approve Campus Visit & Guided Tour</DialogTitle>
            <DialogDescription>
              Book an admissions campus and laboratory tour appointment for{" "}
              {currentStudent.studentName}.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <div className="space-y-1">
              <Label className="text-xs">Preferred Visit Date</Label>
              <Input
                type="date"
                value={campusVisitDate}
                onChange={(e) => setCampusVisitDate(e.target.value)}
                className="text-sm"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Time Slot</Label>
              <Select value={campusVisitTimeSlot} onValueChange={setCampusVisitTimeSlot}>
                <SelectTrigger className="text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="10:00 AM - 12:00 PM">Morning (10:00 AM - 12:00 PM)</SelectItem>
                  <SelectItem value="11:00 AM - 01:00 PM">Midday (11:00 AM - 01:00 PM)</SelectItem>
                  <SelectItem value="02:00 PM - 04:00 PM">
                    Afternoon (02:00 PM - 04:00 PM)
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCampusVisitModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleApproveCampusVisit}>Confirm Campus Visit</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ─── MODAL 3: Counselor Escalation ─── */}
      <Dialog open={isEscalateModalOpen} onOpenChange={setIsEscalateModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Escalate to Senior Admissions Counselor</DialogTitle>
            <DialogDescription>
              Assign prospective student to an admissions officer with full transcript handoff.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <div className="space-y-1">
              <Label className="text-xs">Assigned Admissions Officer / Role</Label>
              <Input
                value={assignedCounselor}
                onChange={(e) => setAssignedCounselor(e.target.value)}
                className="text-sm"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEscalateModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleApproveEscalation}>Confirm Escalation</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ─── MODAL 4: Do Not Call ─── */}
      <Dialog open={isDncModalOpen} onOpenChange={setIsDncModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Do Not Call (DNC) Registration</DialogTitle>
            <DialogDescription>
              Are you sure you want to add {currentStudent.phone} to the DNC suppression list?
              Future campaigns will automatically suppress this lead.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDncModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleApproveDnc}>
              Confirm Opt-Out / DNC
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ─── MODAL 5: Save Outcome ─── */}
      <Dialog open={isSaveOutcomeModalOpen} onOpenChange={setIsSaveOutcomeModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Call Summary & Outcome Record</DialogTitle>
            <DialogDescription>
              Review and confirm the call outcome before moving to the next student.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-2 text-xs">
            <div className="space-y-1">
              <Label className="text-xs">Call Outcome</Label>
              <Select
                value={suggestedOutcome}
                onValueChange={(v: CallOutcome) => setSuggestedOutcome(v)}
              >
                <SelectTrigger className="text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="INTERESTED">Interested in Admission</SelectItem>
                  <SelectItem value="CALLBACK_REQUESTED">Callback Requested</SelectItem>
                  <SelectItem value="CAMPUS_VISIT_SCHEDULED">Campus Visit Scheduled</SelectItem>
                  <SelectItem value="COUNSELOR_ESCALATED">Counselor Escalated</SelectItem>
                  <SelectItem value="APPLICATION_INITIATED">Application Initiated</SelectItem>
                  <SelectItem value="NOT_INTERESTED">Not Interested</SelectItem>
                  <SelectItem value="OPTED_OUT_DNC">Do Not Call / Opt-Out</SelectItem>
                  <SelectItem value="NO_ANSWER">No Answer / Busy</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1">
              <Label className="text-xs">Call Summary Notes</Label>
              <Textarea
                placeholder="Add counselor follow-up notes..."
                value={callNotes}
                onChange={(e) => setCallNotes(e.target.value)}
                className="text-xs h-20"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsSaveOutcomeModalOpen(false)}>
              Close
            </Button>
            <Button onClick={handleSaveOutcome} className="gap-1.5">
              <CheckCircle2 className="size-4" />
              Save Record & Continue
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
