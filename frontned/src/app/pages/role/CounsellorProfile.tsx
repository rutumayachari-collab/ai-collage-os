"use client";

import { PageHeader } from "@/app/components/common/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "@tanstack/react-router";
import { useAuth } from "@/app/hooks/useAuth";
import {
  HiOutlineUser,
  HiOutlineEnvelope,
  HiOutlinePhone,
  HiOutlineAcademicCap,
  HiOutlineChartBar,
  HiOutlineUserGroup,
  HiOutlinePencil,
  HiOutlineCalendar,
  HiOutlineSparkles,
} from "react-icons/hi2";

export function CounsellorProfile() {
  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      <PageHeader
        title="My Profile"
        description="Manage your counsellor profile"
        actions={
          <Button variant="outline" onClick={() => navigate({ to: "/counsellor/settings" })}>
            <HiOutlinePencil className="mr-2 h-4 w-4" />
            Edit Profile
          </Button>
        }
      />

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
                <p className="text-base">{user?.fullName || "N/A"}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <HiOutlineEnvelope className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Email</p>
                <p className="text-base">{user?.email}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <HiOutlinePhone className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Phone</p>
                <p className="text-base">{user?.phone || "N/A"}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <HiOutlineAcademicCap className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Role</p>
                <Badge variant="outline">{user?.role || "COUNSELLOR"}</Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total Leads</p>
              <p className="text-2xl font-bold">N/A</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Converted</p>
              <p className="text-2xl font-bold">N/A</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Calls Made</p>
              <p className="text-2xl font-bold">N/A</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Follow-ups</p>
              <p className="text-2xl font-bold">N/A</p>
            </div>
          </div>
          <p className="text-xs text-muted-foreground mt-3">
            Performance metrics require a dedicated counsellor stats API endpoint.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Quick Links</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" onClick={() => navigate({ to: "/counsellor/leads" })}>
            <HiOutlineUserGroup className="mr-2 h-4 w-4" />
            My Leads
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate({ to: "/counsellor/followups" })}
          >
            <HiOutlineCalendar className="mr-2 h-4 w-4" />
            Follow-ups
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate({ to: "/counsellor/call-history" })}
          >
            <HiOutlinePhone className="mr-2 h-4 w-4" />
            Call History
          </Button>
          <Button variant="outline" size="sm" onClick={() => navigate({ to: "/outreach" })}>
            <HiOutlineSparkles className="mr-2 h-4 w-4" />
            Calling Agent
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
