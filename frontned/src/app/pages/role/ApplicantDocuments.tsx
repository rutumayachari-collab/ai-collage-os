"use client";

import { PageHeader } from "@/app/components/common/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "@tanstack/react-router";
import { useAuth } from "@/app/hooks/useAuth";
import { useApplicants } from "@/app/hooks/queries/useApplicants";
import { useApplicantDocuments } from "@/app/hooks/queries/useApplicants";
import {
  HiOutlineDocumentText,
  HiOutlineCheckCircle,
  HiOutlineArrowUpTray,
  HiOutlineXCircle,
} from "react-icons/hi2";
import { toast } from "sonner";

function getStatusVariant(status: string) {
  switch (status) {
    case "VERIFIED":
      return "default";
    case "UPLOADED":
      return "secondary";
    case "PENDING":
      return "secondary";
    case "REJECTED":
    case "EXPIRED":
      return "destructive";
    default:
      return "outline";
  }
}

export function ApplicantDocuments() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { data: applicants = [], isLoading, error } = useApplicants({ search: user?.email || "" });
  const applicant = applicants[0];
  const {
    data: documents = [],
    isLoading: docsLoading,
    error: docsError,
  } = useApplicantDocuments(applicant?.id || "");

  if (error) {
    toast.error("Unable to load application data.");
  }

  if (docsError) {
    toast.error("Failed to load documents.");
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Documents"
        description="Manage your application documents"
        actions={
          <Button onClick={() => navigate({ to: "/documents/upload" })}>
            <HiOutlineArrowUpTray className="mr-2 h-4 w-4" />
            Upload Document
          </Button>
        }
      />

      {isLoading || docsLoading ? (
        <div className="flex items-center justify-center py-20">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      ) : !applicant ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <HiOutlineDocumentText className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-lg font-medium">No Application Found</p>
            <p className="text-sm text-muted-foreground mb-4">
              Submit an application to upload documents.
            </p>
            <Button onClick={() => navigate({ to: "/student/application/new" })}>
              Start Application
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {documents.map((doc) => (
            <Card key={doc.id}>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium">{doc.name}</CardTitle>
                  <Badge variant={getStatusVariant(doc.status)}>{doc.status}</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">Type: {doc.type}</p>
                <p className="text-sm text-muted-foreground">
                  Uploaded: {doc.uploadedAt ? new Date(doc.uploadedAt).toLocaleDateString() : "N/A"}
                </p>
                {doc.rejectionReason && (
                  <p className="text-sm text-destructive mt-2">
                    <HiOutlineXCircle className="inline mr-1" />
                    {doc.rejectionReason}
                  </p>
                )}
                <div className="mt-3 flex gap-2">
                  {doc.fileUrl && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => window.open(doc.fileUrl, "_blank")}
                    >
                      View
                    </Button>
                  )}
                  {(doc.status === "REJECTED" || doc.status === "EXPIRED") && (
                    <Button size="sm" onClick={() => navigate({ to: "/documents/upload" })}>
                      Re-upload
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
          {documents.length === 0 && (
            <Card className="sm:col-span-2 lg:col-span-3">
              <CardContent className="flex flex-col items-center justify-center py-12">
                <HiOutlineDocumentText className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-lg font-medium">No Documents Uploaded</p>
                <p className="text-sm text-muted-foreground mb-4">
                  Upload your documents to proceed with your application.
                </p>
                <Button onClick={() => navigate({ to: "/documents/upload" })}>
                  <HiOutlineArrowUpTray className="mr-2 h-4 w-4" />
                  Upload Documents
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
