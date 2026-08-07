"use client";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface PriorityBadgeProps {
  priority: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
  className?: string;
}

const PRIORITY_MAP: Record<
  PriorityBadgeProps["priority"],
  { label: string; variant: "secondary" | "default" | "destructive" | "outline" }
> = {
  LOW: { label: "Low", variant: "secondary" },
  MEDIUM: { label: "Medium", variant: "default" },
  HIGH: { label: "High", variant: "outline" },
  URGENT: { label: "Urgent", variant: "destructive" },
};

export function PriorityBadge({ priority, className }: PriorityBadgeProps) {
  const config = PRIORITY_MAP[priority] || PRIORITY_MAP.MEDIUM;
  return (
    <Badge variant={config.variant} className={cn("capitalize", className)}>
      {config.label}
    </Badge>
  );
}
