"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { HiOutlineClock } from "react-icons/hi2";

interface Activity {
  id: string;
  title: string;
  description?: string;
  timestamp: string;
  type?: "info" | "success" | "warning" | "error";
}

interface ActivityFeedProps {
  activities: Activity[];
  title?: string;
  className?: string;
  maxItems?: number;
}

const TYPE_COLORS = {
  info: "text-sky",
  success: "text-emerald-500",
  warning: "text-amber-500",
  error: "text-destructive",
};

export function ActivityFeed({
  activities,
  title = "Recent Activity",
  className,
  maxItems = 10,
}: ActivityFeedProps) {
  const displayActivities = activities.slice(0, maxItems);

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <HiOutlineClock className="h-4 w-4 text-muted-foreground" />
          <CardTitle className="text-base">{title}</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        {displayActivities.length === 0 ? (
          <p className="text-sm text-muted-foreground">No recent activity</p>
        ) : (
          <ScrollArea className="h-[300px]">
            <div className="space-y-4">
              {displayActivities.map((activity) => (
                <div key={activity.id} className="flex gap-3">
                  <div className="mt-0.5 h-2 w-2 rounded-full bg-muted-foreground/50" />
                  <div className="flex-1 space-y-1">
                    <p className="text-sm font-medium">{activity.title}</p>
                    {activity.description && (
                      <p className="text-xs text-muted-foreground">{activity.description}</p>
                    )}
                    <p className={cn("text-xs", TYPE_COLORS[activity.type || "info"])}>
                      {activity.timestamp}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
}
