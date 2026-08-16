"use client";

import { PageHeader } from "@/app/components/common/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "@tanstack/react-router";
import { HiOutlineCurrencyRupee } from "react-icons/hi2";

export function ApplicantScholarships() {
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Scholarships"
        description="Explore available scholarships and financial aid"
        actions={
          <Button variant="outline" onClick={() => navigate({ to: "/applicant/payments" })}>
            <HiOutlineCurrencyRupee className="mr-2 h-4 w-4" />
            Payment History
          </Button>
        }
      />

      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12 text-center">
          <p className="text-sm font-medium">No scholarships available</p>
          <p className="text-xs text-muted-foreground mt-1">
            Scholarship listings require backend integration.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
