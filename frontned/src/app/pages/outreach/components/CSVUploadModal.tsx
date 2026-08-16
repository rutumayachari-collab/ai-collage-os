"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Upload,
  FileSpreadsheet,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  ShieldAlert,
  Sparkles,
  Download,
} from "lucide-react";
import { callingAgentService } from "@/app/services/calling-agent.service";
import type { CSVValidationReport, StudentLeadInput } from "@/app/types/outreach";
import { toast } from "sonner";

interface CSVUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  campaignId: string;
  onImportSuccess: () => void;
}

const SAMPLE_CSV_ROWS: Record<string, string>[] = [
  {
    name: "Rahul Sharma",
    phone: "+91-9876543210",
    email: "rahul.sharma@example.com",
    courseInterest: "B.Tech AI & ML",
    academicQualification: "12th HSC (PCM)",
    academicScore: "88",
    preferredLanguage: "Marathi",
    leadStage: "HIGH_INTENT",
    leadSource: "Education Fair Pune",
    notes: "Expressed strong interest in AI lab facilities and merit scholarships.",
  },
  {
    name: "Priya Patil",
    phone: "+91-9823456789",
    email: "priya.patil@example.com",
    courseInterest: "B.Tech CSE",
    academicQualification: "12th CBSE",
    academicScore: "93",
    preferredLanguage: "Hindi",
    leadStage: "INTERESTED",
    leadSource: "Online Web Portal",
    notes: "Inquired about CSE placements and top recruiting partners.",
  },
  {
    name: "Amit Deshmukh",
    phone: "+91-9765432109",
    email: "amit.d@example.com",
    courseInterest: "B.Tech Data Science",
    academicQualification: "12th HSC",
    academicScore: "78",
    preferredLanguage: "English",
    leadStage: "NEW",
    leadSource: "Social Media Ad",
    notes: "Wants fee structure breakdown and parent discussion callback.",
  },
  {
    name: "Ananya Sen",
    phone: "+91-9830123456",
    email: "ananya.sen@example.com",
    courseInterest: "B.Tech CSE",
    academicQualification: "12th ISC (PCM)",
    academicScore: "85",
    preferredLanguage: "Bengali",
    leadStage: "COUNSELLING_REQUIRED",
    leadSource: "Kolkata Seminar",
    notes: "Interested in hostel accommodation and campus tour visit.",
  },
  {
    name: "Karthik Sundaram",
    phone: "+91-9444123456",
    email: "karthik.s@example.com",
    courseInterest: "B.Tech ECE",
    academicQualification: "12th State Board",
    academicScore: "91",
    preferredLanguage: "Tamil",
    leadStage: "INTERESTED",
    leadSource: "Direct Campus Walk-in",
    notes: "Parent requested callback tomorrow afternoon.",
  },
  {
    name: "Harpreet Singh",
    phone: "+91-9814123456",
    email: "harpreet.s@example.com",
    courseInterest: "B.Tech Mechanical",
    academicQualification: "12th Punjab Board",
    academicScore: "74",
    preferredLanguage: "Punjabi",
    leadStage: "NEW",
    leadSource: "Website Form",
    notes: "Inquired about robotics lab and core placements.",
  },
  {
    name: "Bhavna Patel",
    phone: "+91-9879123456",
    email: "bhavna.p@example.com",
    courseInterest: "B.Tech AI & ML",
    academicQualification: "12th GSEB",
    academicScore: "86",
    preferredLanguage: "Gujarati",
    leadStage: "HIGH_INTENT",
    leadSource: "Ahmedabad Fair",
    notes: "Looking for campus tour slot with family this weekend.",
  },
  {
    name: "Duplicate Entry Lead",
    phone: "+91-9876543210", // duplicate phone
    email: "duplicate@example.com",
    courseInterest: "B.Tech CSE",
    academicScore: "70",
    preferredLanguage: "English",
    notes: "Duplicate lead test record",
  },
];

export function CSVUploadModal({
  isOpen,
  onClose,
  campaignId,
  onImportSuccess,
}: CSVUploadModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [isValidating, setIsValidating] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [report, setReport] = useState<CSVValidationReport | null>(null);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFile = event.target.files?.[0];
    if (!uploadedFile) return;
    setFile(uploadedFile);
    setIsValidating(true);

    try {
      const text = await uploadedFile.text();
      const lines = text.split("\n").filter((l) => l.trim().length > 0);
      if (lines.length < 2) {
        toast.error("CSV file must have a header row and at least one data row");
        setIsValidating(false);
        return;
      }

      const headers = lines[0].split(",").map((h) => h.trim().replace(/^"|"$/g, ""));
      const parsedRows: Record<string, string>[] = [];

      for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(",").map((v) => v.trim().replace(/^"|"$/g, ""));
        const rowObj: Record<string, string> = {};
        headers.forEach((h, idx) => {
          rowObj[h] = values[idx] || "";
        });
        parsedRows.push(rowObj);
      }

      const valReport = await callingAgentService.validateCSV(parsedRows, campaignId);
      setReport(valReport);
      toast.success(`Validated ${valReport.totalRows} leads (${valReport.validRowsCount} valid)`);
    } catch (err: any) {
      toast.error(err?.message || "Failed to parse and validate CSV");
    } finally {
      setIsValidating(false);
    }
  };

  const handleLoadDemoData = async () => {
    setIsValidating(true);
    try {
      const valReport = await callingAgentService.validateCSV(SAMPLE_CSV_ROWS, campaignId);
      setReport(valReport);
      toast.success(`Loaded and validated ${valReport.totalRows} demo prospective leads`);
    } catch (err: any) {
      toast.error(err?.message || "Failed to validate demo data");
    } finally {
      setIsValidating(false);
    }
  };

  const handleDownloadSampleTemplate = () => {
    const csvContent =
      "name,phone,email,courseInterest,academicQualification,academicScore,preferredLanguage,leadStage,leadSource,notes\n" +
      SAMPLE_CSV_ROWS.map((r) =>
        [
          `"${r.name}"`,
          `"${r.phone}"`,
          `"${r.email || ""}"`,
          `"${r.courseInterest}"`,
          `"${r.academicQualification || ""}"`,
          `"${r.academicScore || ""}"`,
          `"${r.preferredLanguage || "English"}"`,
          `"${r.leadStage || "NEW"}"`,
          `"${r.leadSource || "Web"}"`,
          `"${r.notes || ""}"`,
        ].join(","),
      ).join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "nexora_admissions_student_leads_template.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Sample Admissions CSV Template downloaded");
  };

  const handleImport = async () => {
    if (!report || report.validRowsCount === 0) {
      toast.error("No valid prospective student leads to import");
      return;
    }

    setIsImporting(true);
    try {
      const validStudents: StudentLeadInput[] = report.rows
        .filter((r) => r.isValid)
        .map((r) => r.student);

      const result = await callingAgentService.importStudents(campaignId, validStudents);
      toast.success(
        `Successfully imported ${result.importedCount} student leads into the Smart Priority Queue!`,
      );
      onImportSuccess();
      onClose();
    } catch (err: any) {
      toast.error(err?.message || "Failed to import student leads");
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-4xl max-h-[88vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div className="size-8 rounded-lg bg-primary/15 text-primary grid place-items-center">
              <FileSpreadsheet className="size-5" />
            </div>
            <div>
              <DialogTitle className="text-xl font-display font-semibold">
                Import Prospective Student Leads
              </DialogTitle>
              <DialogDescription className="text-sm">
                Upload student CSV file to validate contact eligibility, DNC suppression, and
                calculate smart priority scores.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-5 py-3">
          {/* Upload Zone & Demo Buttons */}
          <div className="grid gap-4 md:grid-cols-3">
            <label className="md:col-span-2 relative flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-border bg-card/60 p-6 hover:bg-card/90 transition-colors cursor-pointer group">
              <Upload className="size-8 text-muted-foreground group-hover:text-primary transition-colors mb-2" />
              <p className="text-sm font-medium text-foreground">
                Click to upload student CSV file
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Accepts .csv format (Headers: name, phone, courseInterest, score, language)
              </p>
              <input
                type="file"
                accept=".csv"
                className="sr-only"
                onChange={handleFileUpload}
                disabled={isValidating}
              />
            </label>

            <div className="flex flex-col gap-2 justify-center">
              <Button
                variant="outline"
                size="sm"
                className="justify-start gap-2 h-11"
                onClick={handleLoadDemoData}
                disabled={isValidating}
              >
                <Sparkles className="size-4 text-sky" />
                <span>Load Demo Lead Batch</span>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="justify-start gap-2 h-11 text-xs text-muted-foreground hover:text-foreground"
                onClick={handleDownloadSampleTemplate}
              >
                <Download className="size-4" />
                <span>Download Sample CSV</span>
              </Button>
            </div>
          </div>

          {/* Validation Metrics */}
          {report && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                <Card className="panel p-3 text-center">
                  <p className="text-2xl font-bold font-display text-foreground">
                    {report.totalRows}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">Total Rows</p>
                </Card>
                <Card className="panel p-3 text-center border-success/30 bg-success/5">
                  <p className="text-2xl font-bold font-display text-success">
                    {report.validRowsCount}
                  </p>
                  <p className="text-xs text-success/80 mt-0.5 flex items-center justify-center gap-1">
                    <CheckCircle2 className="size-3" /> Valid Leads
                  </p>
                </Card>
                <Card className="panel p-3 text-center border-destructive/30 bg-destructive/5">
                  <p className="text-2xl font-bold font-display text-destructive">
                    {report.invalidRowsCount}
                  </p>
                  <p className="text-xs text-destructive/80 mt-0.5 flex items-center justify-center gap-1">
                    <XCircle className="size-3" /> Invalid
                  </p>
                </Card>
                <Card className="panel p-3 text-center border-warning/30 bg-warning/5">
                  <p className="text-2xl font-bold font-display text-warning">
                    {report.duplicateRowsCount}
                  </p>
                  <p className="text-xs text-warning/80 mt-0.5 flex items-center justify-center gap-1">
                    <AlertTriangle className="size-3" /> Duplicates
                  </p>
                </Card>
                <Card className="panel p-3 text-center border-purple-500/30 bg-purple-500/5">
                  <p className="text-2xl font-bold font-display text-purple-400">
                    {report.dncSuppressedCount}
                  </p>
                  <p className="text-xs text-purple-400/80 mt-0.5 flex items-center justify-center gap-1">
                    <ShieldAlert className="size-3" /> DNC Suppressed
                  </p>
                </Card>
              </div>

              {/* Table Preview */}
              <div className="rounded-xl border border-border overflow-hidden">
                <div className="bg-muted/40 px-4 py-2.5 border-b border-border flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Validation & Smart Priority Preview
                  </span>
                  <span className="text-xs text-muted-foreground">
                    Showing {report.rows.length} records
                  </span>
                </div>
                <div className="max-h-64 overflow-y-auto divide-y divide-border/60">
                  {report.rows.map((row) => (
                    <div
                      key={row.rowNumber}
                      className={`px-4 py-3 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2 transition-colors ${
                        row.isValid ? "hover:bg-primary/5" : "bg-destructive/5"
                      }`}
                    >
                      <div className="flex items-start gap-3 min-w-0">
                        <span className="font-mono text-muted-foreground shrink-0 w-6">
                          #{row.rowNumber}
                        </span>
                        <div className="min-w-0">
                          <p className="font-medium text-foreground text-sm truncate">
                            {row.student.name}
                          </p>
                          <p className="text-muted-foreground truncate">
                            {row.student.phone} · {row.student.courseInterest}
                            {row.student.academicScore && ` (${row.student.academicScore}%)`} ·{" "}
                            {row.student.preferredLanguage}
                          </p>
                          {row.errors.length > 0 && (
                            <p className="text-destructive font-medium mt-0.5">
                              ⚠️ {row.errors.join(", ")}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                        <Badge
                          variant="outline"
                          className={`text-[11px] ${
                            row.calculatedPriority === "URGENT"
                              ? "border-destructive text-destructive bg-destructive/10"
                              : row.calculatedPriority === "HIGH"
                                ? "border-sky text-sky bg-sky/10"
                                : "border-muted-foreground text-muted-foreground"
                          }`}
                        >
                          {row.calculatedPriority} ({row.priorityScore})
                        </Badge>
                        <Badge
                          variant={row.isValid ? "default" : "destructive"}
                          className="text-[11px]"
                        >
                          {row.isValid ? "Valid" : "Excluded"}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={onClose} disabled={isImporting}>
            Cancel
          </Button>
          <Button
            onClick={handleImport}
            disabled={!report || report.validRowsCount === 0 || isImporting}
            className="gap-2"
          >
            {isImporting ? (
              <>
                <div className="size-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
                Importing...
              </>
            ) : (
              <>
                <CheckCircle2 className="size-4" />
                Import {report?.validRowsCount || 0} Valid Leads
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
