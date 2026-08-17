"use client";

import { PageHeader } from "@/app/components/common/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DataTable } from "@/app/components/tables/DataTable";
import { useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { callingAgentService } from "@/app/services/calling-agent.service";
import { toast } from "sonner";
import {
  HiOutlinePhone,
  HiOutlineCalendar,
  HiOutlineClock,
  HiOutlineUserGroup,
  HiOutlineSparkles,
} from "react-icons/hi2";

type CallRow = {
  id: string;
  candidateName: string;
  phone: string;
  date: string;
  duration: string;
  callType: string;
  outcome: string;
  summary: string;
  sentiment: string;
  nextAction: string;
};

export function CounsellorCallHistory() {
  const navigate = useNavigate();

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["counsellor-call-history"],
    queryFn: async () => {
      const res = await callingAgentService.getCallHistory();
      return res.items ?? [];
    },
  });

  if (error) {
    toast.error("Failed to load call history");
  }

  const rows: CallRow[] = (data ?? []).map((record) => ({
    id: record.id,
    candidateName: record.studentName,
    phone: record.phone,
    date:
      typeof record.createdAt === "string"
        ? record.createdAt
        : new Date(record.createdAt).toISOString(),
    duration: `${Math.floor(record.durationSeconds / 60)} min ${record.durationSeconds % 60} sec`,
    callType: record.isSimulated ? "AI Call" : "Human Call",
    outcome: record.outcome,
    summary: record.notes || record.actionReasoning || "No summary",
    sentiment: record.sentiment,
    nextAction: record.recommendedAction.replace(/_/g, " "),
  }));

  const columns = [
    {
      key: "candidateName",
      header: "Candidate",
      cell: (row: CallRow) => (
        <div>
          <p className="font-medium text-sm">{row.candidateName}</p>
          <p className="text-xs text-muted-foreground font-mono">{row.phone}</p>
        </div>
      ),
    },
    {
      key: "date",
      header: "Date",
      cell: (row: CallRow) => (
        <span className="text-xs text-muted-foreground">
          {new Date(row.date).toLocaleDateString()}
        </span>
      ),
    },
    {
      key: "duration",
      header: "Duration",
      cell: (row: CallRow) => <span className="text-xs">{row.duration}</span>,
    },
    {
      key: "callType",
      header: "Type",
      cell: (row: CallRow) => (
        <Badge variant={row.callType === "AI Call" ? "secondary" : "outline"}>{row.callType}</Badge>
      ),
    },
    {
      key: "outcome",
      header: "Outcome",
      cell: (row: CallRow) => <Badge variant="default">{row.outcome.replace(/_/g, " ")}</Badge>,
    },
    {
      key: "summary",
      header: "Summary",
      cell: (row: CallRow) => (
        <span className="text-xs text-muted-foreground truncate max-w-[200px] block">
          {row.summary}
        </span>
      ),
    },
    {
      key: "sentiment",
      header: "Sentiment",
      cell: (row: CallRow) => (
        <Badge
          variant={
            row.sentiment === "POSITIVE"
              ? "default"
              : row.sentiment === "NEGATIVE" || row.sentiment === "FRUSTRATED"
                ? "destructive"
                : "secondary"
          }
        >
          {row.sentiment}
        </Badge>
      ),
    },
    {
      key: "nextAction",
      header: "Next Action",
      cell: (row: CallRow) => (
        <span className="text-xs text-muted-foreground">{row.nextAction}</span>
      ),
    },
    {
      key: "actions",
      header: "Actions",
      cell: (row: CallRow) => (
        <div className="flex items-center gap-1">
          <Button size="sm" variant="ghost" onClick={() => navigate({ to: "/outreach" })}>
            <HiOutlinePhone className="h-4 w-4" />
          </Button>
          <Button size="sm" variant="ghost" onClick={() => navigate({ to: "/counsellor/leads" })}>
            <HiOutlineUserGroup className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Call History"
        description="View your call history and outcomes"
        actions={
          <Button onClick={() => navigate({ to: "/outreach" })}>
            <HiOutlinePhone className="mr-2 h-4 w-4" />
            Make Call
          </Button>
        }
      />

      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium">Recent Calls</CardTitle>
            <span className="text-xs text-muted-foreground">
              {rows.length} {rows.length === 1 ? "call" : "calls"}
            </span>
          </div>
        </CardHeader>
        <CardContent>
          <DataTable
            data={rows}
            columns={columns}
            keyExtractor={(row) => row.id}
            isLoading={isLoading}
            searchable
            searchPlaceholder="Search call history..."
            emptyState={{
              icon: HiOutlinePhone,
              title: "No call history",
              description: "Your completed calls will appear here.",
              action: {
                label: "Make a Call",
                onClick: () => navigate({ to: "/outreach" }),
              },
            }}
          />
        </CardContent>
      </Card>

      {error && (
        <Card className="border-destructive/30 bg-destructive/5">
          <CardContent className="py-6 text-center">
            <p className="text-sm text-destructive">Failed to load call history from backend.</p>
            <Button className="mt-3" variant="outline" onClick={() => refetch()}>
              Retry
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
