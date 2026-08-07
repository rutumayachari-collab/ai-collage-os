"use client";

import { useParams, useNavigate } from "@tanstack/react-router";
import { PageHeader } from "@/app/components/common/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { StatusBadge } from "@/app/components/common/StatusBadge";
import { Timeline } from "@/app/components/common/Timeline";
import { useApplicant } from "@/app/hooks/queries/useApplicants";
import { useDocumentsByApplicant } from "@/app/hooks/queries/useDocuments";
import { HiOutlineDocumentText, HiOutlineCheckCircle, HiOutlineAcademicCap } from "react-icons/hi2";

const CHECKLIST_ITEMS = [
  { key: "personalInfo", label: "Personal Information", description: "Name, email, phone, DOB" },
  { key: "address", label: "Address", description: "Permanent and current address" },
  { key: "academic", label: "Academic Details", description: "Previous qualifications and marks" },
  {
    key: "courseSelection",
    label: "Course Selection",
    description: "Preferred course and specialization",
  },
  { key: "documents", label: "Documents Uploaded", description: "All required documents" },
  { key: "payment", label: "Application Fee", description: "Fee payment status" },
];

export function ApplicantDetail() {
  const params = useParams({ from: "/applicants/$id" });
  const navigate = useNavigate();
  const { data: applicant, isLoading, error } = useApplicant(params.id);
  const { data: documents = [] } = useDocumentsByApplicant(params.id);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (error || !applicant) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <p className="text-destructive">Failed to load applicant details</p>
        <Button className="mt-4" onClick={() => navigate({ to: "/applicants" })}>
          Back to Applicants
        </Button>
      </div>
    );
  }

  const completedSteps = [
    "Personal information completed",
    `Course selected: ${applicant.courseName}`,
    documents.length > 0 ? `${documents.length} documents uploaded` : "No documents uploaded",
  ];

  const events = [
    {
      id: "1",
      title: "Application Submitted",
      description: `Applicant ${applicant.firstName} ${applicant.lastName} submitted application for ${applicant.courseName}`,
      timestamp: applicant.createdAt,
      status: "completed" as const,
    },
    {
      id: "2",
      title: "Under Review",
      description: "Application is being reviewed by admissions team",
      timestamp: applicant.updatedAt,
      status: applicant.status === "UNDER_REVIEW" ? ("current" as const) : ("pending" as const),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title={`${applicant.firstName} ${applicant.lastName}`}
        description={`Applicant #${applicant.id.slice(-8)}`}
        breadcrumb={[
          { label: "Applicants", href: "/applicants" },
          { label: applicant.id.slice(-8) },
        ]}
        actions={
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => navigate({ to: "/documents", search: { applicantId: applicant.id } })}
            >
              <HiOutlineDocumentText className="mr-2 h-4 w-4" />
              Documents
            </Button>
            <Button
              onClick={() => navigate({ to: "/admissions/$id", params: { id: applicant.id } })}
            >
              <HiOutlineCheckCircle className="mr-2 h-4 w-4" />
              Admission Status
            </Button>
          </div>
        }
      />

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList>
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="academic">Academic</TabsTrigger>
          <TabsTrigger value="course">Course Selection</TabsTrigger>
          <TabsTrigger value="checklist">Checklist</TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>Personal Information</CardTitle>
                </CardHeader>
                <CardContent className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <p className="text-sm text-muted-foreground">Email</p>
                    <p className="font-medium">{applicant.email}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Phone</p>
                    <p className="font-medium">{applicant.phone}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Date of Birth</p>
                    <p className="font-medium">
                      {new Date(applicant.dateOfBirth).toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Gender</p>
                    <p className="font-medium">{applicant.gender}</p>
                  </div>
                  <div className="sm:col-span-2">
                    <p className="text-sm text-muted-foreground">Address</p>
                    <p className="font-medium">{applicant.address}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">City</p>
                    <p className="font-medium">{applicant.city}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">State</p>
                    <p className="font-medium">{applicant.state}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Country</p>
                    <p className="font-medium">{applicant.country}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Pincode</p>
                    <p className="font-medium">{applicant.pincode}</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div>
              <Card>
                <CardHeader>
                  <CardTitle>Status</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Application Status</p>
                    <StatusBadge status={applicant.status} />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Documents</p>
                    <StatusBadge status={applicant.documentsVerified ? "VERIFIED" : "PENDING"} />
                  </div>
                  {applicant.eligibilityScore !== undefined && (
                    <div>
                      <p className="text-sm text-muted-foreground">Eligibility Score</p>
                      <p className="text-2xl font-bold">{applicant.eligibilityScore}%</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="academic">
          <Card>
            <CardHeader>
              <CardTitle>Academic Details</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Academic details will be displayed here.</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="course">
          <Card>
            <CardHeader>
              <CardTitle>Course Selection</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-3">
                <HiOutlineAcademicCap className="h-8 w-8 text-primary" />
                <div>
                  <p className="font-medium">{applicant.courseName}</p>
                  <p className="text-sm text-muted-foreground">Course ID: {applicant.courseId}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="checklist">
          <Card>
            <CardHeader>
              <CardTitle>Application Checklist</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {CHECKLIST_ITEMS.map((item) => (
                  <div key={item.key} className="flex items-start gap-3">
                    <div className="mt-0.5 h-5 w-5 rounded-full border-2 border-primary flex items-center justify-center">
                      <HiOutlineCheckCircle className="h-3 w-3 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">{item.label}</p>
                      <p className="text-sm text-muted-foreground">{item.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Application Progress</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {completedSteps.map((step, index) => (
                  <div key={index} className="flex items-center gap-2 text-sm">
                    <div className="h-2 w-2 rounded-full bg-emerald-500" />
                    {step}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <div>
          <Card>
            <CardHeader>
              <CardTitle>Timeline</CardTitle>
            </CardHeader>
            <CardContent>
              <Timeline events={events} />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
