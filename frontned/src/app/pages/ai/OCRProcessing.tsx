import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

const API_BASE = import.meta.env.VITE_API_URL || "";

type OCRProcessingRequest = {
  provider: "TESSERACT" | "GOOGLE_VISION" | "AZURE_DOCUMENT_INTELLIGENCE";
  documentType:
    | "AADHAAR"
    | "PAN"
    | "PASSPORT"
    | "DRIVING_LICENSE"
    | "BIRTH_CERTIFICATE"
    | "MARKSHEET"
    | "PHOTO"
    | "OTHER";
  fileUrl: string;
  mimeType: string;
  fileSizeBytes: number;
  language?: string;
};

type OCRProcessingResult = {
  extractedText: string;
  confidence: number;
  confidenceLevel: "HIGH" | "MEDIUM" | "LOW";
  fields: Record<string, string>;
  processingTimeMs: number;
  provider: string;
  processedAt: string;
};

type OCREngineHealth = {
  provider: string;
  isHealthy: boolean;
  lastChecked: string;
  errorMessage?: string;
};

export function OCRProcessing() {
  const queryClient = useQueryClient();
  const [provider, setProvider] = useState<OCRProcessingRequest["provider"]>("TESSERACT");
  const [documentType, setDocumentType] = useState<OCRProcessingRequest["documentType"]>("AADHAAR");
  const [fileUrl, setFileUrl] = useState("");
  const [mimeType, setMimeType] = useState("");
  const [fileSizeBytes, setFileSizeBytes] = useState(0);

  const { data: health, isLoading: healthLoading } = useQuery({
    queryKey: ["ocr-health"],
    queryFn: async (): Promise<OCREngineHealth[]> => {
      const res = await fetch(`${API_BASE}/ocr/health`);
      if (!res.ok) throw new Error("Failed to fetch OCR health");
      return res.json();
    },
  });

  const processMutation = useMutation({
    mutationFn: async (): Promise<OCRProcessingResult> => {
      const res = await fetch(`${API_BASE}/ocr/process`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ provider, documentType, fileUrl, mimeType, fileSizeBytes }),
      });
      if (!res.ok) throw new Error("Failed to process document");
      return res.json();
    },
    onSuccess: () => {
      toast.success("Document processed successfully");
      queryClient.invalidateQueries();
    },
    onError: () => toast.error("Failed to process document"),
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">OCR Processing</h1>
        <p className="text-muted-foreground">
          Extract text and data from documents using OCR providers
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Provider Health</CardTitle>
          <CardDescription>Status of OCR engines</CardDescription>
        </CardHeader>
        <CardContent>
          {healthLoading ? (
            <p className="text-sm text-muted-foreground">Loading health status...</p>
          ) : (
            <div className="grid gap-4 md:grid-cols-3">
              {health?.map((engine) => (
                <div
                  key={engine.provider}
                  className="flex items-center justify-between rounded-md border p-3"
                >
                  <div>
                    <p className="font-medium">{engine.provider}</p>
                    <p className="text-xs text-muted-foreground">
                      Last checked: {new Date(engine.lastChecked).toLocaleString()}
                    </p>
                  </div>
                  <Badge variant={engine.isHealthy ? "default" : "destructive"}>
                    {engine.isHealthy ? "Healthy" : "Unhealthy"}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Process Document</CardTitle>
          <CardDescription>Upload and process a document</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium">Provider</label>
              <Select
                value={provider}
                onValueChange={(value) => setProvider(value as OCRProcessingRequest["provider"])}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="TESSERACT">Tesseract</SelectItem>
                  <SelectItem value="GOOGLE_VISION">Google Vision</SelectItem>
                  <SelectItem value="AZURE_DOCUMENT_INTELLIGENCE">
                    Azure Document Intelligence
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Document Type</label>
              <Select
                value={documentType}
                onValueChange={(value) =>
                  setDocumentType(value as OCRProcessingRequest["documentType"])
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="AADHAAR">Aadhaar</SelectItem>
                  <SelectItem value="PAN">PAN</SelectItem>
                  <SelectItem value="PASSPORT">Passport</SelectItem>
                  <SelectItem value="DRIVING_LICENSE">Driving License</SelectItem>
                  <SelectItem value="BIRTH_CERTIFICATE">Birth Certificate</SelectItem>
                  <SelectItem value="MARKSHEET">Marksheet</SelectItem>
                  <SelectItem value="PHOTO">Photo</SelectItem>
                  <SelectItem value="OTHER">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">File URL</label>
              <input
                type="text"
                value={fileUrl}
                onChange={(e) => setFileUrl(e.target.value)}
                className="w-full rounded-md border px-3 py-2"
                placeholder="https://example.com/document.pdf"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">MIME Type</label>
              <input
                type="text"
                value={mimeType}
                onChange={(e) => setMimeType(e.target.value)}
                className="w-full rounded-md border px-3 py-2"
                placeholder="application/pdf"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">File Size (bytes)</label>
              <input
                type="number"
                value={fileSizeBytes}
                onChange={(e) => setFileSizeBytes(Number(e.target.value))}
                className="w-full rounded-md border px-3 py-2"
                min="0"
              />
            </div>
          </div>
          <Button
            onClick={() => processMutation.mutate()}
            disabled={processMutation.isPending || !fileUrl || !mimeType || !fileSizeBytes}
          >
            {processMutation.isPending ? "Processing..." : "Process Document"}
          </Button>
          {processMutation.data && (
            <div className="space-y-2 rounded-md border p-4">
              <div className="flex items-center gap-2">
                <Badge
                  variant={
                    processMutation.data.confidenceLevel === "HIGH"
                      ? "default"
                      : processMutation.data.confidenceLevel === "MEDIUM"
                        ? "secondary"
                        : "destructive"
                  }
                >
                  {processMutation.data.confidenceLevel} Confidence
                </Badge>
                <span className="text-sm text-muted-foreground">
                  {(processMutation.data.confidence * 100).toFixed(0)}%
                </span>
              </div>
              <div>
                <p className="text-sm font-medium">Extracted Text:</p>
                <p className="text-sm text-muted-foreground">
                  {processMutation.data.extractedText}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium">Fields:</p>
                <pre className="text-xs text-muted-foreground overflow-auto">
                  {JSON.stringify(processMutation.data.fields, null, 2)}
                </pre>
              </div>
              <p className="text-xs text-muted-foreground">
                Processing Time: {processMutation.data.processingTimeMs}ms
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
