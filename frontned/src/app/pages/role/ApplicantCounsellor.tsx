"use client";

import { PageHeader } from "@/app/components/common/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "@tanstack/react-router";
import { HiOutlineUserGroup, HiOutlinePhone, HiOutlineChatBubbleLeftRight } from "react-icons/hi2";

export function ApplicantCounsellor() {
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      <PageHeader title="My Counsellor" description="View your assigned counsellor details" />

      <Card>
        <CardHeader>
          <CardTitle>Assigned Counsellor</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
              <HiOutlineUserGroup className="h-8 w-8 text-primary" />
            </div>
            <div>
              <p className="text-lg font-medium">Your Counsellor</p>
              <p className="text-sm text-muted-foreground">
                Assigned to assist you throughout the admission process
              </p>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Name</p>
              <p className="text-base">Not assigned yet</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Email</p>
              <p className="text-base">-</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Phone</p>
              <p className="text-base">-</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Department</p>
              <p className="text-base">-</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Communication</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-3">
            <Button variant="outline" className="flex-1">
              <HiOutlinePhone className="mr-2 h-4 w-4" />
              Call Counsellor
            </Button>
            <Button variant="outline" className="flex-1">
              <HiOutlineChatBubbleLeftRight className="mr-2 h-4 w-4" />
              Send Message
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
