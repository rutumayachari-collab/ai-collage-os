"use client";

import { PageHeader } from "@/app/components/common/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "@tanstack/react-router";
import { useAuth } from "@/app/hooks/useAuth";
import { useApplicants } from "@/app/hooks/queries/useApplicants";
import {
  HiOutlineUser,
  HiOutlineEnvelope,
  HiOutlinePhone,
  HiOutlineMapPin,
  HiOutlineCalendar,
  HiOutlineAcademicCap,
} from "react-icons/hi2";

export function ApplicantProfile() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { data: applicants = [] } = useApplicants({ studentId: user?.id });
  const applicant = applicants[0];

  if (!applicant) {
    return (
      <div className="space-y-6">
        <PageHeader title="My Profile" description="Manage your profile" />
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <HiOutlineUser className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-lg font-medium">No Profile Found</p>
            <p className="text-sm text-muted-foreground">Submit an application to create your profile.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader title="My Profile" description="Manage your profile" />

      <Card>
        <CardHeader>
          <CardTitle>Personal Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="flex items-center gap-3">
              <HiOutlineUser className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Full Name</p>
                <p className="text-base">{applicant.firstName} {applicant.lastName}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <HiOutlineEnvelope className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Email</p>
                <p className="text-base">{applicant.email}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <HiOutlinePhone className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Phone</p>
                <p className="text-base">{applicant.phone}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <HiOutlineCalendar className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Date of Birth</p>
                 <p className="text-base">{applicant.dateOfBirth ? new Date(applicant.dateOfBirth).toLocaleDateString() : "N/A"}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <HiOutlineAcademicCap className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Gender</p>
                <p className="text-base">{applicant.gender}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <HiOutlineMapPin className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Address</p>
                 <p className="text-base">{applicant.address || "N/A"}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Application Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Application Number</p>
              <p className="text-base">{applicant.applicationNumber || "N/A"}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Course</p>
               <p className="text-base">{applicant.preferredCourseId || "N/A"}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Application Status</p>
              <Badge variant="outline">{applicant.status}</Badge>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Documents Verified</p>
              <Badge variant={applicant.admissionChecklist?.documentsVerified ? "default" : "secondary"}>
                {applicant.admissionChecklist?.documentsVerified ? "Verified" : "Pending"}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
