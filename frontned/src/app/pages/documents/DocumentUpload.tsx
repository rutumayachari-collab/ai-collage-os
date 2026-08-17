"use client";

import { PageHeader } from "@/app/components/common/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "@tanstack/react-router";
import { HiOutlineCloudArrowUp } from "react-icons/hi2";

export function DocumentUpload() {
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Upload Document"
        description="Upload a new document"
        breadcrumb={[{ label: "Documents", href: "/documents" }, { label: "Upload" }]}
        actions={
          <Button variant="outline" onClick={() => navigate({ to: "/documents" })}>
            Cancel
          </Button>
        }
      />

      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>Document Upload Unavailable</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <HiOutlineCloudArrowUp className="h-12 w-12 text-muted-foreground mb-4" />
          <p className="text-lg font-medium">Document upload service is not configured</p>
          <p className="text-sm text-muted-foreground mb-4">
            File upload endpoint is not available. Please contact the administration office for
            assistance with document submission.
          </p>
          <Button onClick={() => navigate({ to: "/documents" })}>Back to Documents</Button>
        </CardContent>
      </Card>
    </div>
  );
}
