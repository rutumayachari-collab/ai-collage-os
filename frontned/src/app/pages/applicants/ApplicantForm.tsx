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
import {
  useCreateApplicant,
  useUpdateApplicant,
  useApplicant,
} from "@/app/hooks/queries/useApplicants";
import { useInquiries } from "@/app/hooks/queries/useInquiries";
import type { CreateApplicantDto } from "@/app/types/applicant";

const GENDERS = ["MALE", "FEMALE", "OTHER", "PREFER_NOT_TO_SAY"] as const;
const QUALIFICATIONS = ["HIGH_SCHOOL", "INTERMEDIATE", "DIPLOMA", "BACHELORS", "MASTERS", "PHD", "OTHER"] as const;
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

export function ApplicantForm() {
  const navigate = useNavigate();
  const params = useParams({ from: "/applicants/$id" });
  const isEdit = !!params.id;
  const { data: applicant, isLoading } = useApplicant(params.id || "");

  const createMutation = useCreateApplicant();
  const updateMutation = useUpdateApplicant();
  const { data: inquiries = [] } = useInquiries({ status: "QUALIFIED" });

  const [formData, setFormData] = useState<CreateApplicantDto>({
    applicationNumber: `APP-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 999999)).padStart(6, "0")}`,
    fullName: "",
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    applicationDate: new Date().toISOString(),
    dateOfBirth: "",
    gender: undefined,
    nationality: "",
    address: "",
    qualification: undefined,
    boardOrUniversity: "",
    passingYear: undefined,
    percentage: undefined,
    cgpa: undefined,
    category: "",
    specialization: "",
    preferredCourseId: "",
    alternativeCourseIds: [],
    preferredDepartmentId: "",
    preferredCampus: "",
    preferredAdmissionYear: "",
    budgetRange: "",
    hostelRequired: false,
    transportRequired: false,
    source: "",
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
    admissionRound: undefined,
  });

  useEffect(() => {
    if (applicant) {
      setFormData({
        applicationNumber: applicant.applicationNumber,
        fullName: applicant.fullName,
        firstName: applicant.firstName,
        lastName: applicant.lastName,
        email: applicant.email,
        phone: applicant.phone,
        applicationDate: applicant.applicationDate,
        dateOfBirth: applicant.dateOfBirth,
        gender: applicant.gender,
        nationality: applicant.nationality,
        address: applicant.address,
        qualification: applicant.qualification,
        boardOrUniversity: applicant.boardOrUniversity,
        passingYear: applicant.passingYear,
        percentage: applicant.percentage,
        cgpa: applicant.cgpa,
        category: applicant.category,
        specialization: applicant.specialization,
        preferredCourseId: applicant.preferredCourseId,
        alternativeCourseIds: applicant.alternativeCourseIds,
        preferredDepartmentId: applicant.preferredDepartmentId,
        preferredCampus: applicant.preferredCampus,
        preferredAdmissionYear: applicant.preferredAdmissionYear,
        budgetRange: applicant.budgetRange,
        hostelRequired: applicant.hostelRequired,
        transportRequired: applicant.transportRequired,
        source: applicant.source,
        campaign: applicant.campaign,
        medium: applicant.medium,
        referralSource: applicant.referralSource,
        utmSource: applicant.utmSource,
        utmMedium: applicant.utmMedium,
        utmCampaign: applicant.utmCampaign,
        campaignId: applicant.campaignId,
        leadSource: applicant.leadSource,
        applicationChannel: applicant.applicationChannel,
        status: applicant.status,
        priority: applicant.priority,
        admissionRound: applicant.admissionRound,
      });
    }
  }, [applicant]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isEdit && params.id) {
      await updateMutation.mutateAsync({ id: params.id, data: formData });
    } else {
      await createMutation.mutateAsync(formData);
    }
    navigate({ to: "/applicants" });
  };

  if (isEdit && isLoading) {
    return <div className="flex items-center justify-center py-20">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={isEdit ? "Edit Applicant" : "New Applicant"}
        description={isEdit ? "Update applicant details" : "Create a new applicant record"}
        breadcrumb={[
          { label: "Applicants", href: "/applicants" },
          { label: isEdit ? "Edit" : "New" },
        ]}
        actions={
          <Button variant="outline" onClick={() => navigate({ to: "/applicants" })}>
            Cancel
          </Button>
        }
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
                      onValueChange={(value) => setFormData({ ...formData, gender: value as CreateApplicantDto["gender"] })}
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
                      onValueChange={(value) => setFormData({ ...formData, qualification: value as CreateApplicantDto["qualification"] })}
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
                      onChange={(e) => setFormData({ ...formData, passingYear: e.target.value ? Number(e.target.value) : undefined })}
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
                      onChange={(e) => setFormData({ ...formData, percentage: e.target.value ? Number(e.target.value) : undefined })}
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
                      onChange={(e) => setFormData({ ...formData, cgpa: e.target.value ? Number(e.target.value) : undefined })}
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
                <p className="text-sm text-muted-foreground">Auto-generated application number.</p>
                <p className="text-lg font-mono font-bold mt-2">{formData.applicationNumber}</p>
              </CardContent>
            </Card>

            {!isEdit && inquiries.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Convert from Inquiry</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Select an inquiry to pre-fill applicant data.
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-2">
          <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
            {isEdit ? "Update" : "Create"} Applicant
          </Button>
        </div>
      </form>
    </div>
  );
}
