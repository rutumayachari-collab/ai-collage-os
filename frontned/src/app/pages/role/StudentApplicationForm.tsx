"use client";

import { useState, useEffect } from "react";
import { useNavigate } from "@tanstack/react-router";
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
import { useCreateApplicant } from "@/app/hooks/queries/useApplicants";
import { useAuth } from "@/app/hooks/useAuth";
import { toast } from "sonner";
import { HiOutlineDocumentText } from "react-icons/hi2";

function generateApplicationNumber(): string {
  const now = new Date();
  const year = now.getFullYear();
  const random = String(Math.floor(Math.random() * 999999)).padStart(6, "0");
  return `APP-${year}-${random}`;
}

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

const GENDERS = ["MALE", "FEMALE", "OTHER", "PREFER_NOT_TO_SAY"] as const;
const QUALIFICATIONS = ["HIGH_SCHOOL", "INTERMEDIATE", "DIPLOMA", "BACHELORS", "MASTERS", "PHD", "OTHER"] as const;

export function StudentApplicationForm() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const createMutation = useCreateApplicant();

  const [formData, setFormData] = useState({
    applicationNumber: generateApplicationNumber(),
    fullName: user?.fullName || "",
    firstName: user?.fullName?.split(" ")[0] || "",
    lastName: user?.fullName?.split(" ").slice(1).join(" ") || "",
    email: user?.email || "",
    phone: user?.phone || "",
    applicationDate: new Date().toISOString(),
    dateOfBirth: "",
    gender: "",
    nationality: "India",
    address: "",
    qualification: "",
    boardOrUniversity: "",
    passingYear: "",
    percentage: "",
    cgpa: "",
    category: "",
    specialization: "",
    preferredCourseId: "",
    preferredDepartmentId: "",
    preferredCampus: "",
    preferredAdmissionYear: "",
    budgetRange: "",
    hostelRequired: false,
    transportRequired: false,
    source: "WEBSITE",
    campaign: "",
    medium: "ONLINE",
    referralSource: "",
    utmSource: "",
    utmMedium: "",
    utmCampaign: "",
    campaignId: "",
    leadSource: "WEBSITE",
    applicationChannel: "ONLINE",
    status: "NEW",
    priority: "MEDIUM",
    admissionRound: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const payload = {
      ...formData,
      applicationNumber: formData.applicationNumber,
      fullName: formData.fullName,
      firstName: formData.firstName,
      lastName: formData.lastName,
      email: formData.email,
      phone: formData.phone,
      applicationDate: formData.applicationDate,
      dateOfBirth: formData.dateOfBirth || undefined,
      gender: formData.gender || undefined,
      nationality: formData.nationality || undefined,
      address: formData.address || undefined,
      qualification: formData.qualification || undefined,
      boardOrUniversity: formData.boardOrUniversity || undefined,
      passingYear: formData.passingYear ? Number(formData.passingYear) : undefined,
      percentage: formData.percentage ? Number(formData.percentage) : undefined,
      cgpa: formData.cgpa ? Number(formData.cgpa) : undefined,
      category: formData.category || undefined,
      specialization: formData.specialization || undefined,
      preferredCourseId: formData.preferredCourseId || undefined,
      preferredDepartmentId: formData.preferredDepartmentId || undefined,
      preferredCampus: formData.preferredCampus || undefined,
      preferredAdmissionYear: formData.preferredAdmissionYear || undefined,
      budgetRange: formData.budgetRange || undefined,
      hostelRequired: formData.hostelRequired,
      transportRequired: formData.transportRequired,
      source: formData.source || undefined,
      campaign: formData.campaign || undefined,
      medium: formData.medium || undefined,
      referralSource: formData.referralSource || undefined,
      utmSource: formData.utmSource || undefined,
      utmMedium: formData.utmMedium || undefined,
      utmCampaign: formData.utmCampaign || undefined,
      campaignId: formData.campaignId || undefined,
      leadSource: formData.leadSource || undefined,
      applicationChannel: formData.applicationChannel || undefined,
      status: formData.status,
      priority: formData.priority,
      admissionRound: formData.admissionRound || undefined,
      admissionChecklist: {
        personalDetailsCompleted: false,
        academicDetailsCompleted: false,
        documentsUploaded: false,
        documentsVerified: false,
        eligibilityPassed: false,
        interviewCompleted: false,
        feePaid: false,
        admissionApproved: false,
      },
      requiredDocuments: [],
      submittedDocuments: [],
      verifiedDocuments: [],
      scholarship: { applied: false, status: "NOT_APPLIED" },
      feeSummary: { totalFee: 0, paidAmount: 0, pendingAmount: 0, paymentStatus: "PENDING" },
      seatAllocation: { status: "RESERVED" },
      parents: [],
      guardian: [],
      emergencyContacts: [],
      timeline: [],
      decisionHistory: [],
      workflowHistory: [],
      aiRecommendedScholarships: [],
      isActive: true,
    };

    try {
      const result = await createMutation.mutateAsync(payload);
      toast.success("Application submitted successfully!");
      navigate({ to: "/applicant/application" });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Failed to submit application.";
      toast.error(message);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="New Application"
        description="Submit your admission application"
        breadcrumb={[
          { label: "Admission Dashboard", href: "/applicant/dashboard" },
          { label: "New Application" },
        ]}
      />

      <form onSubmit={handleSubmit}>
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Personal Information</CardTitle>
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

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="dateOfBirth">Date of Birth</Label>
                    <Input
                      id="dateOfBirth"
                      type="date"
                      value={formData.dateOfBirth}
                      onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="gender">Gender</Label>
                    <Select
                      value={formData.gender}
                      onValueChange={(value) => setFormData({ ...formData, gender: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select gender" />
                      </SelectTrigger>
                      <SelectContent>
                        {GENDERS.map((g) => (
                          <SelectItem key={g} value={g}>{g.replace(/_/g, " ")}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address">Address</Label>
                  <Textarea
                    id="address"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Academic Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="qualification">Qualification</Label>
                    <Select
                      value={formData.qualification}
                      onValueChange={(value) => setFormData({ ...formData, qualification: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select qualification" />
                      </SelectTrigger>
                      <SelectContent>
                        {QUALIFICATIONS.map((q) => (
                          <SelectItem key={q} value={q}>{q.replace(/_/g, " ")}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="boardOrUniversity">Board / University</Label>
                    <Input
                      id="boardOrUniversity"
                      value={formData.boardOrUniversity}
                      onChange={(e) => setFormData({ ...formData, boardOrUniversity: e.target.value })}
                    />
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-3">
                  <div className="space-y-2">
                    <Label htmlFor="passingYear">Passing Year</Label>
                    <Input
                      id="passingYear"
                      type="number"
                      value={formData.passingYear}
                      onChange={(e) => setFormData({ ...formData, passingYear: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="percentage">Percentage</Label>
                    <Input
                      id="percentage"
                      type="number"
                      min="0"
                      max="100"
                      value={formData.percentage}
                      onChange={(e) => setFormData({ ...formData, percentage: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="cgpa">CGPA</Label>
                    <Input
                      id="cgpa"
                      type="number"
                      min="0"
                      max="10"
                      value={formData.cgpa}
                      onChange={(e) => setFormData({ ...formData, cgpa: e.target.value })}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Course Selection</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Label htmlFor="preferredCourseId">Preferred Course</Label>
                  <Select
                    value={formData.preferredCourseId}
                    onValueChange={(value) => setFormData({ ...formData, preferredCourseId: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a course" />
                    </SelectTrigger>
                    <SelectContent>
                      {COURSES.map((course) => (
                        <SelectItem key={course} value={course}>{course}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Application Number</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">Your application number will be generated automatically.</p>
                <p className="text-lg font-mono font-bold mt-2">{formData.applicationNumber}</p>
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={() => navigate({ to: "/applicant/dashboard" })}>
            Cancel
          </Button>
          <Button type="submit" disabled={createMutation.isPending}>
            {createMutation.isPending ? "Submitting..." : "Submit Application"}
          </Button>
        </div>
      </form>
    </div>
  );
}
