"use client";

import { PageHeader } from "@/app/components/common/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "@tanstack/react-router";
import { useAuth } from "@/app/hooks/useAuth";
import { useApplicants } from "@/app/hooks/queries/useApplicants";
import { useAdmissions } from "@/app/hooks/queries/useAdmissions";
import {
  HiOutlineCalendar,
  HiOutlineCheckCircle,
  HiOutlineClock,
  HiOutlineXCircle,
} from "react-icons/hi2";

export function ApplicantHistory() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { data: applicants = [] } = useApplicants({ studentId: user?.id });
  const applicant = applicants[0];

  const timelineEvents = applicant
    ? [
        {
          date: applicant.createdAt,
          title: "Application Created",
          description: `Application submitted for ${applicant.courseName}`,
          status: "completed",
        },
        {
          date: applicant.updatedAt,
          title: "Last Updated",
          description: `Status changed to ${applicant.status}`,
          status: applicant.status === "ADMITTED" ? "completed" : "current",
        },
      ]
    : [];

  return (
    <div className="space-y-6">
      <PageHeader title="Application History" description="View your application history and timeline" />

      {!applicant ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <HiOutlineCalendar className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-lg font-medium">No History Available</p>
            <p className="text-sm text-muted-foreground">Your application history will appear here after you submit an application.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Application Timeline</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {timelineEvents.map((event, index) => (
                  <div key={index} className="flex gap-4">
                    <div className="flex flex-col items-center">
                      {event.status === "completed" ? (
                        <HiOutlineCheckCircle className="h-5 w-5 text-emerald-500" />
                      ) : event.status === "current" ? (
                        <HiOutlineClock className="h-5 w-5 text-blue-500" />
                      ) : (
                        <HiOutlineXCircle className="h-5 w-5 text-red-500" />
                      )}
                      {index < timelineEvents.length - 1 && (
                        <div className="w-px h-8 bg-border mt-1" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-sm">{event.title}</p>
                      <p className="text-xs text-muted-foreground">{event.description}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {new Date(event.date).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <div className="flex gap-2">
            <Button variant="outline" onClick={() => navigate({ to: "/applicant/application" })}>
              View Application
            </Button>
            <Button variant="outline" onClick={() => navigate({ to: "/applicant/admission" })}>
              Admission Status
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
