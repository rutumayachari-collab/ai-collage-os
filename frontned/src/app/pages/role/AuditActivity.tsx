"use client";

import { useState, useEffect } from "react";
import { PageHeader } from "@/app/components/common/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "@tanstack/react-router";
import { useAuth } from "@/app/hooks/useAuth";
import { useAdmissions } from "@/app/hooks/queries/useAdmissions";
import { useDocuments } from "@/app/hooks/queries/useDocuments";
import { HiOutlineClock, HiOutlineUserGroup } from "react-icons/hi2";

interface AuditEntry {
  id: string;
  action: string;
  resource: string;
  actor: string;
  timestamp: string;
  result: string;
}

export function AuditActivity() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [activities, setActivities] = useState<AuditEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const { data: admissions = [], isLoading: admissionsLoading } = useAdmissions();
  const { data: documents = [], isLoading: documentsLoading } = useDocuments();

  useEffect(() => {
    if (admissionsLoading || documentsLoading) return;

    const entries: AuditEntry[] = [];

    admissions.forEach((admission: unknown) => {
      const adm = admission as Record<string, unknown>;
      if (adm.auditTrail && Array.isArray(adm.auditTrail)) {
        adm.auditTrail.forEach((entry: unknown, index: number) => {
          const ent = entry as Record<string, unknown>;
          entries.push({
            id: `admission-${String(adm.id)}-${index}`,
            action: String(ent.action || ent.status || "Admission Updated"),
            resource: "Admission",
            actor: String(ent.actor || ent.updatedBy || "System"),
            timestamp: String(
              ent.timestamp || ent.createdAt || adm.updatedAt || new Date().toISOString(),
            ),
            result: "SUCCESS",
          });
        });
      }
    });

    documents.forEach((doc: unknown) => {
      const d = doc as Record<string, unknown>;
      if (d.auditTrail && Array.isArray(d.auditTrail)) {
        d.auditTrail.forEach((entry: unknown, index: number) => {
          const ent = entry as Record<string, unknown>;
          entries.push({
            id: `document-${String(d.id)}-${index}`,
            action: String(ent.action || ent.status || "Document Updated"),
            resource: "Document",
            actor: String(ent.actor || ent.updatedBy || "System"),
            timestamp: String(
              ent.timestamp || ent.createdAt || d.updatedAt || new Date().toISOString(),
            ),
            result: "SUCCESS",
          });
        });
      }
    });

    entries.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    setActivities(entries.slice(0, 50));
    setIsLoading(false);
  }, [admissions, documents, admissionsLoading, documentsLoading]);

  return (
    <div className="space-y-6">
      <PageHeader title="Audit Activity" description="Track all system activities and changes" />

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      ) : activities.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <HiOutlineClock className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-lg font-medium">No Audit Records</p>
            <p className="text-sm text-muted-foreground">No activity recorded yet.</p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity ({activities.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {activities.map((activity) => (
                <div key={activity.id} className="flex items-start gap-4 rounded-md border p-4">
                  <div className="mt-0.5">
                    <HiOutlineClock className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <p className="font-medium">{activity.action}</p>
                      <Badge variant={activity.result === "SUCCESS" ? "default" : "destructive"}>
                        {activity.result}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Resource: {activity.resource} | Actor: {activity.actor}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(activity.timestamp).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
