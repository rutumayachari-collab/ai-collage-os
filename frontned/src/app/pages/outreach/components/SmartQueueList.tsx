"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  PhoneCall,
  Search,
  Clock,
  GraduationCap,
  Calendar,
  AlertCircle,
  CheckCircle2,
  PhoneForwarded,
  UserCheck,
  Languages,
  RotateCcw,
} from "lucide-react";
import type { CallQueueItem, PriorityLevel } from "@/app/types/outreach";

interface SmartQueueListProps {
  queue: CallQueueItem[];
  isLoading: boolean;
  onCallStudent: (item: CallQueueItem) => void;
  onRefresh: () => void;
}

export function SmartQueueList({
  queue,
  isLoading,
  onCallStudent,
  onRefresh,
}: SmartQueueListProps) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [priorityFilter, setPriorityFilter] = useState("ALL");

  const filteredQueue = queue.filter((item) => {
    const matchesSearch =
      item.studentName.toLowerCase().includes(search.toLowerCase()) ||
      item.phone.includes(search) ||
      item.courseInterest.toLowerCase().includes(search.toLowerCase());

    const matchesStatus = statusFilter === "ALL" || item.status === statusFilter;
    const matchesPriority = priorityFilter === "ALL" || item.priorityLevel === priorityFilter;

    return matchesSearch && matchesStatus && matchesPriority;
  });

  const getPriorityBadgeClass = (level: PriorityLevel) => {
    switch (level) {
      case "URGENT":
        return "border-destructive text-destructive bg-destructive/10 font-bold";
      case "HIGH":
        return "border-sky text-sky bg-sky/10 font-semibold";
      case "MEDIUM":
        return "border-amber-500 text-amber-500 bg-amber-500/10 font-medium";
      case "LOW":
      default:
        return "border-muted-foreground text-muted-foreground bg-muted/20";
    }
  };

  const getStatusBadge = (status: CallQueueItem["status"]) => {
    switch (status) {
      case "PENDING":
        return <Badge variant="secondary">Pending</Badge>;
      case "IN_PROGRESS":
        return <Badge className="bg-primary animate-pulse">Calling...</Badge>;
      case "CALLBACK_SCHEDULED":
        return (
          <Badge variant="outline" className="border-amber-500 text-amber-500 bg-amber-500/10">
            Callback Scheduled
          </Badge>
        );
      case "ESCALATED":
        return (
          <Badge variant="outline" className="border-purple-500 text-purple-400 bg-purple-500/10">
            Escalated
          </Badge>
        );
      case "CAMPUS_VISIT":
        return (
          <Badge
            variant="outline"
            className="border-emerald-500 text-emerald-400 bg-emerald-500/10"
          >
            Campus Visit
          </Badge>
        );
      case "COMPLETED":
        return <Badge variant="default">Completed</Badge>;
      case "DNC":
        return <Badge variant="destructive">Do Not Call</Badge>;
      case "UNREACHABLE":
        return (
          <Badge variant="outline" className="text-muted-foreground">
            Unreachable
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-4">
      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-card/60 border border-border rounded-xl p-3">
        <div className="relative w-full sm:max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            placeholder="Search student, phone, or course..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 h-9 text-sm"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Select value={priorityFilter} onValueChange={setPriorityFilter}>
            <SelectTrigger className="w-[130px] h-9 text-xs">
              <SelectValue placeholder="Priority" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Priorities</SelectItem>
              <SelectItem value="URGENT">Urgent Only</SelectItem>
              <SelectItem value="HIGH">High Priority</SelectItem>
              <SelectItem value="MEDIUM">Medium</SelectItem>
              <SelectItem value="LOW">Low</SelectItem>
            </SelectContent>
          </Select>

          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[140px] h-9 text-xs">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Statuses</SelectItem>
              <SelectItem value="PENDING">Pending</SelectItem>
              <SelectItem value="CALLBACK_SCHEDULED">Callback Due</SelectItem>
              <SelectItem value="ESCALATED">Escalated</SelectItem>
              <SelectItem value="CAMPUS_VISIT">Campus Visit</SelectItem>
              <SelectItem value="COMPLETED">Completed</SelectItem>
              <SelectItem value="UNREACHABLE">Unreachable</SelectItem>
            </SelectContent>
          </Select>

          <Button variant="outline" size="icon" className="size-9 shrink-0" onClick={onRefresh}>
            <RotateCcw className={`size-4 ${isLoading ? "animate-spin" : ""}`} />
          </Button>
        </div>
      </div>

      {/* Queue Items */}
      <div className="space-y-3">
        {filteredQueue.map((item, index) => {
          const isCallbackDue =
            item.status === "CALLBACK_SCHEDULED" &&
            item.nextCallbackAt &&
            new Date(item.nextCallbackAt) <= new Date();

          return (
            <Card
              key={item.id || item.queueId}
              className={`panel p-4 transition-all duration-200 hover:border-primary/50 ${
                index === 0 ? "border-primary/40 shadow-glow" : ""
              } ${isCallbackDue ? "border-amber-500/50 bg-amber-500/5" : ""}`}
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                {/* Student Info */}
                <div className="space-y-1.5 flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-xs font-semibold text-muted-foreground">
                      #{index + 1}
                    </span>
                    <h3 className="font-display font-semibold text-foreground text-base truncate">
                      {item.studentName}
                    </h3>
                    <Badge variant="outline" className={getPriorityBadgeClass(item.priorityLevel)}>
                      {item.priorityLevel} ({item.priorityScore})
                    </Badge>
                    {getStatusBadge(item.status)}
                    {item.leadStage && (
                      <Badge variant="secondary" className="text-[11px]">
                        {item.leadStage.replace(/_/g, " ")}
                      </Badge>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                    <span className="font-mono font-medium text-foreground">{item.phone}</span>
                    <span className="flex items-center gap-1">
                      <GraduationCap className="size-3.5" />
                      {item.courseInterest}
                      {item.academicScore ? ` · Score: ${item.academicScore}%` : ""}
                    </span>
                    {item.preferredLanguage && (
                      <span className="flex items-center gap-1">
                        <Languages className="size-3.5" />
                        {item.preferredLanguage}
                      </span>
                    )}
                    <span className="flex items-center gap-1">
                      <Clock className="size-3.5" />
                      Attempts: {item.attempts} / {item.maxAttempts}
                    </span>
                  </div>

                  {/* Priority Reason */}
                  <div className="rounded-md bg-muted/40 px-2.5 py-1 text-xs text-muted-foreground flex items-center gap-1.5">
                    <AlertCircle className="size-3.5 text-sky shrink-0" />
                    <span className="font-medium text-foreground">Priority Reason:</span>
                    <span className="truncate">{item.priorityReason}</span>
                  </div>
                </div>

                {/* Call Action Button */}
                <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
                  {item.status === "CALLBACK_SCHEDULED" && item.nextCallbackAt && (
                    <div className="text-right text-xs mr-2">
                      <p className="text-muted-foreground">Callback Scheduled</p>
                      <p className="font-semibold text-amber-500">
                        {new Date(item.nextCallbackAt).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                  )}

                  <Button
                    onClick={() => onCallStudent(item)}
                    disabled={item.status === "IN_PROGRESS" || item.status === "DNC"}
                    className="gap-2 shadow-soft"
                    size="sm"
                  >
                    <PhoneCall className="size-4" />
                    Call Student
                  </Button>
                </div>
              </div>
            </Card>
          );
        })}

        {filteredQueue.length === 0 && (
          <Card className="panel p-8 text-center space-y-2">
            <UserCheck className="size-10 text-muted-foreground mx-auto opacity-50" />
            <p className="font-medium text-foreground">No students in queue matching criteria</p>
            <p className="text-xs text-muted-foreground">
              Import a CSV student lead batch or adjust your filters above.
            </p>
          </Card>
        )}
      </div>
    </div>
  );
}
