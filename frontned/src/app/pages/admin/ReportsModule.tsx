"use client";

import { useState } from "react";
import { PageHeader } from "@/app/components/common/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useGenerateReport } from "@/app/hooks/queries/useAdmin";
import { Download, FileSpreadsheet, FileText } from "lucide-react";

const REPORT_TYPES = ["daily", "weekly", "monthly"] as const;
const REPORT_CATEGORIES = ["department", "faculty", "admission"] as const;

export function ReportsModule() {
  const [config, setConfig] = useState<{
    type: "daily" | "weekly" | "monthly";
    category: "department" | "faculty" | "admission";
    startDate: string;
    endDate: string;
  }>({
    type: "monthly",
    category: "admission",
    startDate: "",
    endDate: "",
  });
  const generateMutation = useGenerateReport();

  const handleGenerate = async (format: "pdf" | "excel") => {
    await generateMutation.mutateAsync(config);
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Reports" description="Generate and download system reports" />

      <Card>
        <CardHeader>
          <CardTitle>Report Configuration</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="type">Report Type</Label>
              <Select
                value={config.type}
                onValueChange={(value: "daily" | "weekly" | "monthly") =>
                  setConfig({ ...config, type: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {REPORT_TYPES.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type.charAt(0).toUpperCase() + type.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select
                value={config.category}
                onValueChange={(value: "department" | "faculty" | "admission") =>
                  setConfig({ ...config, category: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {REPORT_CATEGORIES.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category.charAt(0).toUpperCase() + category.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="startDate">Start Date</Label>
              <Input
                id="startDate"
                type="date"
                value={config.startDate}
                onChange={(e) => setConfig({ ...config, startDate: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="endDate">End Date</Label>
              <Input
                id="endDate"
                type="date"
                value={config.endDate}
                onChange={(e) => setConfig({ ...config, endDate: e.target.value })}
              />
            </div>
          </div>

          <div className="flex gap-2 pt-4">
            <Button onClick={() => handleGenerate("pdf")} disabled={generateMutation.isPending}>
              <FileText className="mr-2 h-4 w-4" />
              Generate PDF
            </Button>
            <Button
              variant="outline"
              onClick={() => handleGenerate("excel")}
              disabled={generateMutation.isPending}
            >
              <FileSpreadsheet className="mr-2 h-4 w-4" />
              Generate Excel
            </Button>
            <Button variant="outline" disabled={generateMutation.isPending}>
              <Download className="mr-2 h-4 w-4" />
              Print Friendly
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
