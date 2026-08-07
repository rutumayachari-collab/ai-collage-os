"use client";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type StatusVariant = "default" | "secondary" | "destructive" | "outline";

interface StatusBadgeProps {
  status: string;
  className?: string;
}

const STATUS_MAP: Record<string, { label: string; variant: StatusVariant }> = {
  PENDING: { label: "Pending", variant: "secondary" },
  UNDER_REVIEW: { label: "Under Review", variant: "secondary" },
  APPROVED: { label: "Approved", variant: "default" },
  REJECTED: { label: "Rejected", variant: "destructive" },
  HOLD: { label: "Hold", variant: "secondary" },
  WAITLISTED: { label: "Waitlisted", variant: "secondary" },
  CONDITIONAL: { label: "Conditional", variant: "secondary" },
  ADMITTED: { label: "Admitted", variant: "default" },
  CANCELLED: { label: "Cancelled", variant: "destructive" },
  ACTIVE: { label: "Active", variant: "default" },
  INACTIVE: { label: "Inactive", variant: "secondary" },
  SUSPENDED: { label: "Suspended", variant: "destructive" },
  VERIFIED: { label: "Verified", variant: "default" },
  PROCESSING: { label: "Processing", variant: "secondary" },
  COMPLETED: { label: "Completed", variant: "default" },
  PAID: { label: "Paid", variant: "default" },
  OVERDUE: { label: "Overdue", variant: "destructive" },
  GENERATED: { label: "Generated", variant: "default" },
  SENT: { label: "Sent", variant: "secondary" },
};

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const normalized = status.toUpperCase().replace(/\s+/g, "_");
  const config = STATUS_MAP[normalized] || { label: status, variant: "outline" as StatusVariant };

  return (
    <Badge variant={config.variant} className={cn("capitalize", className)}>
      {config.label}
    </Badge>
  );
}
