"use client";

import { cn } from "@/lib/utils";

interface TimelineEvent {
  id: string;
  title: string;
  description?: string;
  timestamp: string;
  status?: "completed" | "current" | "pending" | "failed";
  icon?: React.ReactNode;
}

interface TimelineProps {
  events: TimelineEvent[];
  className?: string;
}

export function Timeline({ events, className }: TimelineProps) {
  return (
    <div className={cn("relative space-y-4", className)}>
      {events.map((event, index) => (
        <div key={event.id} className="flex gap-4">
          <div className="relative flex flex-col items-center">
            <div
              className={cn(
                "flex h-8 w-8 items-center justify-center rounded-full border-2",
                event.status === "completed" &&
                  "border-emerald-500 bg-emerald-50 text-emerald-600 dark:bg-emerald-950",
                event.status === "pending" &&
                  "border-amber-500 bg-amber-50 text-amber-600 dark:bg-amber-950",
                event.status === "failed" &&
                  "border-destructive bg-destructive/10 text-destructive",
                !event.status && "border-muted-foreground/30 bg-muted text-muted-foreground",
              )}
            >
              {event.icon}
            </div>
            {index < events.length - 1 && <div className="mt-2 h-full w-px flex-1 bg-border" />}
          </div>
          <div className="flex-1 space-y-1 pb-4">
            <p className="text-sm font-medium">{event.title}</p>
            {event.description && (
              <p className="text-sm text-muted-foreground">{event.description}</p>
            )}
            <p className="text-xs text-muted-foreground">{event.timestamp}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
