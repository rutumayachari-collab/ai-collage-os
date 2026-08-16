"use client";

import { PageHeader } from "@/app/components/common/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "@tanstack/react-router";
import { useAuth } from "@/app/hooks/useAuth";
import { useDocumentsByApplicant } from "@/app/hooks/queries/useDocuments";
import {
  HiOutlineDocumentText,
  HiOutlineArrowUpTray,
  HiOutlineCheckCircle,
  HiOutlineXCircle,
} from "react-icons/hi2";

export function StudentDocuments() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const documents = [
    { id: "1", name: "Student ID Card", type: "ID_PROOF", status: "VERIFIED", date: "2025-08-01" },
    { id: "2", name: "Transfer Certificate", type: "TRANSFER", status: "VERIFIED", date: "2025-08-01" },
    { id: "3", name: "Marksheet - Semester 2", type: "MARKSHEET", status: "PENDING", date: "2025-09-15" },
    { id: "4", name: "Hostel Application", type: "OTHER", status: "PENDING", date: "2025-09-20" },
  ];

  const getStatusVariant = (status: string) => {
    switch (status) {
      case "VERIFIED": return "default";
      case "PENDING": return "secondary";
      case "REJECTED": return "destructive";
      default: return "outline";
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Documents"
        description="Manage your student documents"
        actions={
          <Button onClick={() => navigate({ to: "/documents/upload" })}>
            <HiOutlineArrowUpTray className="mr-2 h-4 w-4" />
            Upload Document
          </Button>
        }
      />

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
                Uploaded: {new Date(doc.date).toLocaleDateString()}
              </p>
              <div className="mt-3 flex gap-2">
                <Button variant="outline" size="sm">View</Button>
                {doc.status === "PENDING" && (
                  <Button size="sm">Resubmit</Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
