export interface OCRProviderInterface {
  readonly name: string;
  readonly isHealthy: boolean;

  processDocument(request: { provider: string; documentType: string; fileUrl: string; mimeType: string; fileSizeBytes: number; language?: string }): Promise<{ extractedText: string; confidence: number; confidenceLevel: string; fields: Record<string, string>; processingTimeMs: number; provider: string; processedAt: Date }>;
  validateConfiguration(): Promise<boolean>;
  getHealthStatus(): Promise<{ provider: string; isHealthy: boolean; lastChecked: Date; errorMessage?: string }>;
}

export interface OCRProviderConfig {
  apiKey?: string;
  endpoint?: string;
  region?: string;
  language?: string;
  timeoutMs?: number;
}
