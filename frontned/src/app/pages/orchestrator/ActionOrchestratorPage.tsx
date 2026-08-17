"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  CheckCircle2,
  Clock,
  AlertTriangle,
  DollarSign,
  FileText,
  UserCheck,
  RefreshCw,
  ArrowRight,
  Bell,
  Loader2,
  Plus,
} from "lucide-react";
import { AIOrb } from "@/app/components/ai/ai-orb";
import { orchestratorService } from "@/app/services/orchestrator.service";
import type { OrchestratorWorkflow, WorkflowAction, ActionType } from "@/app/types/orchestrator";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

const ACTION_CONFIG: Record<ActionType, { icon: typeof CheckCircle2; color: string }> = {
  DOCUMENT_UPLOAD: { icon: FileText, color: "text-blue-500" },
  PAYMENT: { icon: DollarSign, color: "text-green-500" },
  ADMISSION_REVIEW: { icon: UserCheck, color: "text-purple-500" },
  VERIFICATION: { icon: CheckCircle2, color: "text-teal-500" },
  FOLLOW_UP: { icon: RefreshCw, color: "text-orange-500" },
  ESCALATION: { icon: AlertTriangle, color: "text-red-500" },
};

export function ActionOrchestratorPage() {
  const queryClient = useQueryClient();
  const [selectedWorkflowId, setSelectedWorkflowId] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [newStudentId, setNewStudentId] = useState("");
  const [newStudentName, setNewStudentName] = useState("");
  const [newActionType, setNewActionType] = useState<ActionType>("DOCUMENT_UPLOAD");
  const [newActionTitle, setNewActionTitle] = useState("");
  const [newActionDescription, setNewActionDescription] = useState("");

  const { data: workflows = [], isLoading } = useQuery({
    queryKey: ["orchestrator", "workflows"],
    queryFn: () => orchestratorService.listWorkflows(),
  });

  const executeMutation = useMutation({
    mutationFn: ({ workflowId, actionId }: { workflowId: string; actionId: string }) =>
      orchestratorService.executeAction(workflowId, actionId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orchestrator"] });
      toast.success("Action executed successfully");
    },
    onError: () => toast.error("Failed to execute action"),
  });

  const createMutation = useMutation({
    mutationFn: () =>
      orchestratorService.createWorkflow({
        studentId: newStudentId,
        studentName: newStudentName,
        actions: [
          {
            type: newActionType,
            title: newActionTitle,
            description: newActionDescription,
          },
        ],
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orchestrator"] });
      setIsCreating(false);
      setNewStudentId("");
      setNewStudentName("");
      setNewActionTitle("");
      setNewActionDescription("");
      toast.success("Workflow created");
    },
    onError: () => toast.error("Failed to create workflow"),
  });

  const selectedWorkflow =
    workflows.find((wf) => wf.id === selectedWorkflowId) || workflows[0] || null;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-semibold">AI Student Action Orchestrator</h1>
          <p className="text-muted-foreground text-sm">
            Automated workflows for student onboarding and admissions
          </p>
        </div>
        <div className="flex items-center gap-2">
          <AIOrb size={40} state={executeMutation.isPending ? "thinking" : "idle"} />
          <Button onClick={() => setIsCreating(true)}>
            <Plus className="size-4 mr-2" />
            New Workflow
          </Button>
        </div>
      </div>

      {isCreating && (
        <Card className="panel p-6">
          <h3 className="font-display font-semibold mb-4">Create Workflow</h3>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Student ID</Label>
              <Input
                value={newStudentId}
                onChange={(e) => setNewStudentId(e.target.value)}
                placeholder="STU001"
              />
            </div>
            <div className="space-y-2">
              <Label>Student Name</Label>
              <Input
                value={newStudentName}
                onChange={(e) => setNewStudentName(e.target.value)}
                placeholder="Rahul Sharma"
              />
            </div>
            <div className="space-y-2">
              <Label>Action Type</Label>
              <Select
                value={newActionType}
                onValueChange={(value) => setNewActionType(value as ActionType)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="DOCUMENT_UPLOAD">Document Upload</SelectItem>
                  <SelectItem value="PAYMENT">Payment</SelectItem>
                  <SelectItem value="ADMISSION_REVIEW">Admission Review</SelectItem>
                  <SelectItem value="VERIFICATION">Verification</SelectItem>
                  <SelectItem value="FOLLOW_UP">Follow Up</SelectItem>
                  <SelectItem value="ESCALATION">Escalation</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Action Title</Label>
              <Input
                value={newActionTitle}
                onChange={(e) => setNewActionTitle(e.target.value)}
                placeholder="Upload documents"
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label>Description</Label>
              <Input
                value={newActionDescription}
                onChange={(e) => setNewActionDescription(e.target.value)}
                placeholder="Upload marksheet and ID proof"
              />
            </div>
          </div>
          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" onClick={() => setIsCreating(false)}>
              Cancel
            </Button>
            <Button onClick={() => createMutation.mutate()} disabled={createMutation.isPending}>
              {createMutation.isPending ? <Loader2 className="size-4 animate-spin mr-2" /> : null}
              Create Workflow
            </Button>
          </div>
        </Card>
      )}

      <Tabs defaultValue="active" className="space-y-4">
        <TabsList>
          <TabsTrigger value="active">Active Workflows</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="space-y-4">
          <div className="grid gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2 space-y-4">
              {selectedWorkflow ? (
                <Card className="panel p-6">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h2 className="font-display text-lg font-semibold">
                        {selectedWorkflow.studentName}
                      </h2>
                      <p className="text-sm text-muted-foreground">
                        ID: {selectedWorkflow.studentId}
                      </p>
                    </div>
                    <Badge variant="outline">
                      Step {selectedWorkflow.currentStep + 1} of {selectedWorkflow.actions.length}
                    </Badge>
                  </div>

                  <div className="space-y-4">
                    <AnimatePresence>
                      {selectedWorkflow.actions.map((action, index) => {
                        const config = ACTION_CONFIG[action.type];
                        const Icon = config.icon;
                        const isActive = index === selectedWorkflow.currentStep;
                        const isCompleted = action.status === "COMPLETED";

                        return (
                          <motion.div
                            key={action.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            className={`relative flex gap-4 rounded-xl border p-4 transition-all ${
                              isActive
                                ? "border-primary bg-primary/5"
                                : isCompleted
                                  ? "border-success/30 bg-success/5"
                                  : "border-border bg-card/60"
                            }`}
                          >
                            <div className="flex flex-col items-center">
                              <div
                                className={`grid size-10 place-items-center rounded-full ${
                                  isCompleted
                                    ? "bg-success text-success-foreground"
                                    : isActive
                                      ? "bg-primary text-primary-foreground"
                                      : "bg-muted text-muted-foreground"
                                }`}
                              >
                                {isCompleted ? (
                                  <CheckCircle2 className="size-5" />
                                ) : (
                                  <Icon className={`size-5 ${config.color}`} />
                                )}
                              </div>
                              {index < selectedWorkflow.actions.length - 1 && (
                                <div
                                  className={`w-px flex-1 my-2 ${
                                    isCompleted ? "bg-success" : "bg-border"
                                  }`}
                                />
                              )}
                            </div>

                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between gap-4">
                                <div>
                                  <h3 className="font-medium text-sm">{action.title}</h3>
                                  <p className="text-xs text-muted-foreground mt-1">
                                    {action.description}
                                  </p>
                                </div>
                                <div className="flex items-center gap-2">
                                  {isActive && action.status !== "COMPLETED" && (
                                    <Button
                                      size="sm"
                                      onClick={() =>
                                        executeMutation.mutate({
                                          workflowId: selectedWorkflow.id,
                                          actionId: action.id,
                                        })
                                      }
                                      disabled={executeMutation.isPending}
                                    >
                                      {executeMutation.isPending ? (
                                        <Loader2 className="size-4 animate-spin" />
                                      ) : (
                                        <>
                                          Execute
                                          <ArrowRight className="size-4 ml-2" />
                                        </>
                                      )}
                                    </Button>
                                  )}
                                </div>
                              </div>
                            </div>
                          </motion.div>
                        );
                      })}
                    </AnimatePresence>
                  </div>
                </Card>
              ) : (
                <Card className="panel p-6">
                  <p className="text-sm text-muted-foreground">
                    No workflows found. Create one to get started.
                  </p>
                </Card>
              )}
            </div>

            <div className="space-y-6">
              <Card className="panel p-6">
                <h3 className="font-display font-semibold mb-4">Workflows</h3>
                <div className="space-y-2">
                  {workflows.length === 0 && (
                    <p className="text-sm text-muted-foreground">No workflows yet.</p>
                  )}
                  {workflows.map((wf) => (
                    <button
                      key={wf.id}
                      onClick={() => setSelectedWorkflowId(wf.id)}
                      className={`w-full text-left rounded-lg border p-3 transition-colors ${
                        selectedWorkflow?.id === wf.id
                          ? "border-primary bg-primary/5"
                          : "border-border hover:bg-card/80"
                      }`}
                    >
                      <p className="text-sm font-medium">{wf.studentName}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {wf.actions.filter((a) => a.status === "COMPLETED").length}/
                        {wf.actions.length} steps
                      </p>
                      <Progress
                        value={
                          (wf.actions.filter((a) => a.status === "COMPLETED").length /
                            wf.actions.length) *
                          100
                        }
                        className="h-1 mt-2"
                      />
                    </button>
                  ))}
                </div>
              </Card>

              <Card className="panel p-6">
                <h3 className="font-display font-semibold mb-4">Recent Activity</h3>
                <div className="space-y-3">
                  {workflows.slice(0, 5).map((wf) => (
                    <div key={wf.id} className="flex items-start gap-3 text-sm">
                      <Bell className="size-4 text-muted-foreground mt-0.5" />
                      <div>
                        <p className="font-medium">
                          {wf.actions[wf.currentStep]?.title || "Workflow updated"}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {wf.studentName} · {new Date(wf.updatedAt).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  ))}
                  {workflows.length === 0 && (
                    <p className="text-sm text-muted-foreground">No recent activity.</p>
                  )}
                </div>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          <Card className="panel p-6">
            <h3 className="font-display font-semibold mb-4">Workflow History</h3>
            <div className="space-y-3">
              {workflows.map((wf) => (
                <div
                  key={wf.id}
                  className="flex items-center justify-between rounded-lg border p-3"
                >
                  <div>
                    <p className="text-sm font-medium">{wf.studentName}</p>
                    <p className="text-xs text-muted-foreground">
                      {wf.actions.filter((a) => a.status === "COMPLETED").length}/
                      {wf.actions.length} completed
                    </p>
                  </div>
                  <Badge variant={wf.status === "COMPLETED" ? "default" : "secondary"}>
                    {wf.status}
                  </Badge>
                </div>
              ))}
              {workflows.length === 0 && (
                <p className="text-sm text-muted-foreground">No workflow history.</p>
              )}
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
