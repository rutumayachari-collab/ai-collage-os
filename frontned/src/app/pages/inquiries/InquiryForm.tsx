"use client";

import { useState, useEffect } from "react";
import { useNavigate, useParams } from "@tanstack/react-router";
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
import { Textarea } from "@/components/ui/textarea";
import { useCreateInquiry, useUpdateInquiry, useInquiry } from "@/app/hooks/queries/useInquiries";
import type { CreateInquiryDto } from "@/app/types/inquiry";

const COURSES = [
  "Computer Science",
  "Mechanical Engineering",
  "Electrical Engineering",
  "Civil Engineering",
  "MBA",
  "Biotechnology",
  "Data Science",
  "AI & ML",
];

export function InquiryForm() {
  const navigate = useNavigate();
  const params = useParams({ from: "/inquiries/$id" });
  const isEdit = !!params.id;
  const { data: inquiry, isLoading } = useInquiry(params.id || "");

  const createMutation = useCreateInquiry();
  const updateMutation = useUpdateInquiry();

  const [formData, setFormData] = useState<CreateInquiryDto>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    courseInterest: "",
    source: "website",
    notes: "",
  });

  useEffect(() => {
    if (inquiry) {
      setFormData({
        firstName: inquiry.firstName,
        lastName: inquiry.lastName,
        email: inquiry.email,
        phone: inquiry.phone,
        courseInterest: inquiry.courseInterest,
        source: inquiry.source || "website",
        notes: inquiry.notes || "",
      });
    }
  }, [inquiry]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isEdit && params.id) {
      await updateMutation.mutateAsync({ id: params.id, data: formData });
    } else {
      await createMutation.mutateAsync(formData);
    }
    navigate({ to: "/inquiries" });
  };

  if (isEdit && isLoading) {
    return <div className="flex items-center justify-center py-20">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={isEdit ? "Edit Inquiry" : "New Inquiry"}
        description={isEdit ? "Update inquiry details" : "Create a new student inquiry"}
        breadcrumb={[
          { label: "Inquiries", href: "/inquiries" },
          { label: isEdit ? "Edit" : "New" },
        ]}
        actions={
          <Button variant="outline" onClick={() => navigate({ to: "/inquiries" })}>
            Cancel
          </Button>
        }
      />

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>Inquiry Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name</Label>
                <Input
                  id="firstName"
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name</Label>
                <Input
                  id="lastName"
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="courseInterest">Course Interest</Label>
              <Select
                value={formData.courseInterest}
                onValueChange={(value) => setFormData({ ...formData, courseInterest: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a course" />
                </SelectTrigger>
                <SelectContent>
                  {COURSES.map((course) => (
                    <SelectItem key={course} value={course}>
                      {course}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="source">Source</Label>
              <Input
                id="source"
                value={formData.source}
                onChange={(e) => setFormData({ ...formData, source: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                rows={4}
              />
            </div>
          </CardContent>
        </Card>

        <div className="mt-6 flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={() => navigate({ to: "/inquiries" })}>
            Cancel
          </Button>
          <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
            {isEdit ? "Update" : "Create"} Inquiry
          </Button>
        </div>
      </form>
    </div>
  );
}
