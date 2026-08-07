"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
  HiOutlineSparkles,
  HiOutlineDocumentText,
  HiOutlineAcademicCap,
  HiOutlineCurrencyRupee,
} from "react-icons/hi2";
import { type LucideIcon } from "lucide-react";

interface AICopilotInsight {
  applicantId: string;
  applicantName: string;
  admissionProbability: number;
  riskScore: number;
  missingDocuments: string[];
  scholarshipRecommendation?: string;
  recommendedCourse?: string;
  recommendedNextAction: string;
  summary: string;
}

interface ApplicantSummaryProps {
  insight: AICopilotInsight;
  className?: string;
}

export function ApplicantSummary({ insight, className }: ApplicantSummaryProps) {
  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <HiOutlineSparkles className="h-5 w-5 text-sky" />
          <CardTitle className="text-base">AI Applicant Summary</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">{insight.summary}</p>
        {insight.recommendedCourse && (
          <div className="flex items-center gap-2">
            <HiOutlineAcademicCap className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">Recommended Course:</span>
            <span className="text-sm">{insight.recommendedCourse}</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

interface AdmissionProbabilityProps {
  probability: number;
  className?: string;
}

export function AdmissionProbability({ probability, className }: AdmissionProbabilityProps) {
  const getColor = (value: number) => {
    if (value >= 80) return "text-emerald-600";
    if (value >= 60) return "text-amber-600";
    return "text-destructive";
  };

  const getBadgeVariant = (value: number) => {
    if (value >= 80) return "default";
    if (value >= 60) return "secondary";
    return "destructive";
  };

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Admission Probability</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-2xl font-bold">{probability}%</span>
          <Badge variant={getBadgeVariant(probability)}>
            {probability >= 80 ? "High" : probability >= 60 ? "Medium" : "Low"}
          </Badge>
        </div>
        <Progress value={probability} className="h-2" />
      </CardContent>
    </Card>
  );
}

interface RiskScoreProps {
  score: number;
  className?: string;
}

export function RiskScore({ score, className }: RiskScoreProps) {
  const getColor = (value: number) => {
    if (value <= 30) return "text-emerald-600";
    if (value <= 60) return "text-amber-600";
    return "text-destructive";
  };

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Risk Score</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center justify-between">
          <span className={`text-2xl font-bold ${getColor(score)}`}>{score}/100</span>
          <span className={`text-sm font-medium ${getColor(score)}`}>
            {score <= 30 ? "Low Risk" : score <= 60 ? "Medium Risk" : "High Risk"}
          </span>
        </div>
        <Progress value={score} className="h-2" />
      </CardContent>
    </Card>
  );
}

interface MissingDocumentsProps {
  documents: string[];
  className?: string;
}

export function MissingDocuments({ documents, className }: MissingDocumentsProps) {
  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <HiOutlineDocumentText className="h-5 w-5 text-muted-foreground" />
          <CardTitle className="text-base">Missing Documents</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        {documents.length === 0 ? (
          <p className="text-sm text-emerald-600">All documents submitted</p>
        ) : (
          <ul className="space-y-2">
            {documents.map((doc, index) => (
              <li key={index} className="flex items-center gap-2 text-sm">
                <div className="h-2 w-2 rounded-full bg-destructive" />
                {doc}
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}

interface ScholarshipRecommendationProps {
  recommendation?: string;
  className?: string;
}

export function ScholarshipRecommendation({
  recommendation,
  className,
}: ScholarshipRecommendationProps) {
  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <HiOutlineCurrencyRupee className="h-5 w-5 text-sky" />
          <CardTitle className="text-base">Scholarship Recommendation</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        {recommendation ? (
          <p className="text-sm text-muted-foreground">{recommendation}</p>
        ) : (
          <p className="text-sm text-muted-foreground">No scholarship recommendations available</p>
        )}
      </CardContent>
    </Card>
  );
}

interface RecommendedCourseProps {
  course?: string;
  className?: string;
}

export function RecommendedCourse({ course, className }: RecommendedCourseProps) {
  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <HiOutlineAcademicCap className="h-5 w-5 text-sky" />
          <CardTitle className="text-base">Recommended Course</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        {course ? (
          <p className="text-sm font-medium">{course}</p>
        ) : (
          <p className="text-sm text-muted-foreground">No course recommendation available</p>
        )}
      </CardContent>
    </Card>
  );
}

interface RecommendedNextActionProps {
  action: string;
  className?: string;
}

export function RecommendedNextAction({ action, className }: RecommendedNextActionProps) {
  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <HiOutlineSparkles className="h-5 w-5 text-amber-500" />
          <CardTitle className="text-base">Recommended Next Action</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm font-medium">{action}</p>
      </CardContent>
    </Card>
  );
}

interface GenerateEmailProps {
  applicantName: string;
  context: string;
  className?: string;
}

export function GenerateEmail({ applicantName, context, className }: GenerateEmailProps) {
  const emailContent = `Dear ${applicantName},\n\nRegarding your application: ${context}\n\nPlease let us know if you have any questions.\n\nBest regards,\nAdmissions Team`;

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Generated Email</CardTitle>
      </CardHeader>
      <CardContent>
        <pre className="whitespace-pre-wrap text-sm text-muted-foreground">{emailContent}</pre>
      </CardContent>
    </Card>
  );
}

interface GenerateWhatsAppProps {
  applicantName: string;
  context: string;
  className?: string;
}

export function GenerateWhatsApp({ applicantName, context, className }: GenerateWhatsAppProps) {
  const message = `Hi ${applicantName.split(" ")[0]}, ${context}`;

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Generated WhatsApp Message</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">{message}</p>
      </CardContent>
    </Card>
  );
}

interface GenerateCounselingNotesProps {
  applicantName: string;
  notes: string;
  className?: string;
}

export function GenerateCounselingNotes({
  applicantName,
  notes,
  className,
}: GenerateCounselingNotesProps) {
  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Counseling Notes</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">
          <span className="font-medium">{applicantName}:</span> {notes}
        </p>
      </CardContent>
    </Card>
  );
}

interface GenerateAdmissionSummaryProps {
  applicantName: string;
  summary: string;
  className?: string;
}

export function GenerateAdmissionSummary({
  applicantName,
  summary,
  className,
}: GenerateAdmissionSummaryProps) {
  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Admission Summary</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">
          <span className="font-medium">{applicantName}:</span> {summary}
        </p>
      </CardContent>
    </Card>
  );
}
