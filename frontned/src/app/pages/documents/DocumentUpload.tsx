"use client";

import { useState, useRef } from "react";
import { useNavigate, useSearch } from "@tanstack/react-router";
import { PageHeader } from "@/app/components/common/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useUploadDocument } from "@/app/hooks/queries/useDocuments";
import { HiOutlineCloudArrowUp } from "react-icons/hi2";

const DOCUMENT_TYPES = [
  "PHOTO",
  "ID_PROOF",
  "MARKSHEET",
  "CERTIFICATE",
  "TRANSFER",
  "PHOTO_ID",
  "OTHER",
];

export function DocumentUpload() {
  const navigate = useNavigate();
  const search = useSearch({ from: "/documents/upload" }) as { applicantId?: string };
  const uploadMutation = useUploadDocument();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    applicantId: search.applicantId || "",
    type: "OTHER",
    name: "",
  });
  const [file, setFile] = useState<File | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !formData.applicantId) return;

    await uploadMutation.mutateAsync({
      file,
      applicantId: formData.applicantId,
      type: formData.type,
    });

    navigate({ to: "/documents", search: { applicantId: formData.applicantId } });
  };

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

      <form onSubmit={handleSubmit}>
        <Card className="max-w-2xl">
          <CardHeader>
            <CardTitle>Document Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="applicantId">Applicant ID</Label>
              <Input
                id="applicantId"
                value={formData.applicantId}
                onChange={(e) => setFormData({ ...formData, applicantId: e.target.value })}
                placeholder="Enter applicant ID"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="type">Document Type</Label>
              <Select
                value={formData.type}
                onValueChange={(value) => setFormData({ ...formData, type: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {DOCUMENT_TYPES.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type.toLowerCase().replace("_", " ")}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="name">Document Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Marksheet Grade 12"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="file">File</Label>
              <Input
                id="file"
                type="file"
                ref={fileInputRef}
                onChange={(e) => setFile(e.target.files?.[0] || null)}
                required
              />
              {file && (
                <p className="text-sm text-muted-foreground">
                  Selected: {file.name} ({(file.size / 1024).toFixed(1)} KB)
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        <div className="mt-6 flex justify-end gap-2">
          <Button
            type="submit"
            disabled={!file || !formData.applicantId || uploadMutation.isPending}
          >
            <HiOutlineCloudArrowUp className="mr-2 h-4 w-4" />
            Upload Document
          </Button>
        </div>
      </form>
    </div>
  );
}
