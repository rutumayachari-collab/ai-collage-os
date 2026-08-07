"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { HiOutlineSparkles } from "react-icons/hi2";
import { cn } from "@/lib/utils";

interface AIInsightCardProps {
  title: string;
  insight: string;
  confidence?: number;
  recommendation?: string;
  className?: string;
}

export function AIInsightCard({
  title,
  insight,
  confidence,
  recommendation,
  className,
}: AIInsightCardProps) {
  return (
    <Card className={cn("border-sky/20 bg-sky/5", className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <HiOutlineSparkles className="h-5 w-5 text-sky" />
          <CardTitle className="text-base">{title}</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        <p className="text-sm text-muted-foreground">{insight}</p>
        {confidence !== undefined && (
          <div className="flex items-center gap-2">
            <div className="h-2 flex-1 rounded-full bg-muted">
              <div className="h-2 rounded-full bg-sky" style={{ width: `${confidence}%` }} />
            </div>
            <span className="text-xs font-medium text-muted-foreground">{confidence}%</span>
          </div>
        )}
        {recommendation && <p className="text-sm font-medium text-foreground">{recommendation}</p>}
      </CardContent>
    </Card>
  );
}
