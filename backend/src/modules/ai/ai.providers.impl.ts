import type { AIProvider, AIProviderConfig } from './ai.providers';
import type {
  AISummaryInput,
  AISummaryOutput,
  AIEligibilityInput,
  AIEligibilityOutput,
  AIRiskAnalysisInput,
  AIRiskAnalysisOutput,
  AIScholarshipInput,
  AIScholarshipOutput,
  AICounselingNotesInput,
  AICounselingNotesOutput,
  AIAdmissionEmailInput,
  AIAdmissionEmailOutput,
  AIWhatsAppDraftInput,
  AIWhatsAppDraftOutput,
  AINextActionInput,
  AINextActionOutput,
} from './ai.types';
import { ApiError } from '../../shared/utils/api-error.util';
import { HttpStatus, ErrorCode } from '../../shared/constants';
import { logger } from '../../shared/utils/logger.util';

const SAFETY_GUARDRAILS = `
IMPORTANT SAFETY CONSTRAINTS:
- You are a decision SUPPORT system only.
- You must NOT approve, reject, allocate seats, alter official eligibility, change payment status, or create students.
- All outputs are recommendations. Human authorization is required for all admission decisions.
- Do not generate content that could be interpreted as official admission decisions unless explicitly framed as a draft for human review.
`;

type OpenAIChatMessage = {
  role: 'system' | 'user' | 'assistant';
  content: string;
};

type OpenAIChatResponse = {
  choices: Array<{
    message: {
      role: string;
      content: string;
    };
  }>;
};

function buildSummaryPrompt(input: AISummaryInput, context?: Record<string, unknown>): string {
  return `${SAFETY_GUARDRAILS}
Generate a concise summary for the following applicant. Output JSON only.

Applicant: ${input.applicantName}
Course Interest: ${input.courseInterest}
Academic Score: ${input.academicScore}
Documents Verified: ${input.documentsVerified}
${context ? `Context: ${JSON.stringify(context)}` : ''}

JSON schema:
{
  "summary": string,
  "confidence": number (0-1)
}`;
}

function buildEligibilityPrompt(input: AIEligibilityInput, context?: Record<string, unknown>): string {
  return `${SAFETY_GUARDRAILS}
Explain eligibility for the following applicant/course. Output JSON only.

Applicant ID: ${input.applicantId}
Course ID: ${input.courseId}
Academic Score: ${input.academicScore}
Documents Verified: ${input.documentsVerified}
${context ? `Context: ${JSON.stringify(context)}` : ''}

JSON schema:
{
  "isEligible": boolean,
  "score": number (0-100),
  "reasons": string[]
}`;
}

function buildRiskPrompt(input: AIRiskAnalysisInput, context?: Record<string, unknown>): string {
  return `${SAFETY_GUARDRAILS}
Analyze risk for the following applicant. Output JSON only.

Applicant ID: ${input.applicantId}
Academic Score: ${input.academicScore}
Attendance Percentage: ${input.attendancePercentage}
Previous Defaults: ${input.previousDefaults}
${context ? `Context: ${JSON.stringify(context)}` : ''}

JSON schema:
{
  "riskScore": number (0-100),
  "riskLevel": "LOW" | "MEDIUM" | "HIGH",
  "factors": string[]
}`;
}

function buildScholarshipPrompt(input: AIScholarshipInput, context?: Record<string, unknown>): string {
  return `${SAFETY_GUARDRAILS}
Recommend scholarships for the following applicant. Output JSON only.

Applicant ID: ${input.applicantId}
Academic Score: ${input.academicScore}
Family Income: ${input.familyIncome}
Category: ${input.category}
${context ? `Context: ${JSON.stringify(context)}` : ''}

JSON schema:
{
  "recommendedScholarships": [
    {
      "name": string,
      "amount": number,
      "eligibility": boolean
    }
  ]
}`;
}

function buildCounselingNotesPrompt(input: AICounselingNotesInput, context?: Record<string, unknown>): string {
  return `${SAFETY_GUARDRAILS}
Structure counseling notes for the following applicant. Output JSON only.

Applicant ID: ${input.applicantId}
Counseling Notes: ${input.counselingNotes}
Previous Interactions: ${JSON.stringify(input.previousInteractions)}
${context ? `Context: ${JSON.stringify(context)}` : ''}

JSON schema:
{
  "structuredNotes": string,
  "keyPoints": string[],
  "nextSteps": string[]
}`;
}

function buildEmailPrompt(input: AIAdmissionEmailInput, context?: Record<string, unknown>): string {
  return `${SAFETY_GUARDRAILS}
Generate a professional admission email draft for the following applicant. This is a DRAFT only and must not be sent without human review. Output JSON only.

Applicant ID: ${input.applicantId}
Applicant Name: ${input.applicantName}
Course Name: ${input.courseName}
Status: ${input.status}
${context ? `Context: ${JSON.stringify(context)}` : ''}

JSON schema:
{
  "subject": string,
  "body": string
}`;
}

function buildWhatsAppPrompt(input: AIWhatsAppDraftInput, context?: Record<string, unknown>): string {
  return `${SAFETY_GUARDRAILS}
Generate a WhatsApp message draft for the following applicant. This is a DRAFT only. Output JSON only.

Applicant ID: ${input.applicantId}
Applicant Name: ${input.applicantName}
Message Intent: ${input.message}
${context ? `Context: ${JSON.stringify(context)}` : ''}

JSON schema:
{
  "draft": string,
  "characterCount": number
}`;
}

function buildNextActionPrompt(input: AINextActionInput, context?: Record<string, unknown>): string {
  return `${SAFETY_GUARDRAILS}
Recommend the next best action for the following applicant. Output JSON only.

Applicant ID: ${input.applicantId}
Current Stage: ${input.currentStage}
Pending Actions: ${JSON.stringify(input.pendingActions)}
${context ? `Context: ${JSON.stringify(context)}` : ''}

JSON schema:
{
  "recommendedAction": string,
  "priority": "HIGH" | "MEDIUM" | "LOW",
  "reasoning": string
}`;
}

function buildMessages(
  operation: string,
  input: unknown,
  context?: Record<string, unknown>,
): OpenAIChatMessage[] {
  let userContent: string;
  switch (operation) {
    case 'generateSummary':
      userContent = buildSummaryPrompt(input as AISummaryInput, context);
      break;
    case 'checkEligibility':
      userContent = buildEligibilityPrompt(input as AIEligibilityInput, context);
      break;
    case 'analyzeRisk':
      userContent = buildRiskPrompt(input as AIRiskAnalysisInput, context);
      break;
    case 'recommendScholarships':
      userContent = buildScholarshipPrompt(input as AIScholarshipInput, context);
      break;
    case 'generateCounselingNotes':
      userContent = buildCounselingNotesPrompt(input as AICounselingNotesInput, context);
      break;
    case 'generateAdmissionEmail':
      userContent = buildEmailPrompt(input as AIAdmissionEmailInput, context);
      break;
    case 'generateWhatsAppDraft':
      userContent = buildWhatsAppPrompt(input as AIWhatsAppDraftInput, context);
      break;
    case 'recommendNextAction':
      userContent = buildNextActionPrompt(input as AINextActionInput, context);
      break;
    default:
      userContent = JSON.stringify(input);
  }

  return [
    {
      role: 'system',
      content: 'You are an AI assistant for AICollegeOS. Always respond with valid JSON only. No markdown, no explanations outside JSON.',
    },
    {
      role: 'user',
      content: userContent,
    },
  ];
}

function sanitizeError(error: unknown): Error {
  if (error instanceof ApiError) {
    const message = error.message ?? '';
    if (
      message.includes('AI provider request timed out') ||
      message.includes('AI provider returned an empty response') ||
      message.includes('AI provider returned a malformed response') ||
      message.includes('AI provider responded with status 401') ||
      message.includes('AI provider responded with status 403') ||
      message.includes('AI provider responded with status 429')
    ) {
      return error;
    }

    if (message.includes('AI provider responded with status 5')) {
      return new ApiError(
        HttpStatus.BAD_GATEWAY,
        'AI provider request failed',
        ErrorCode.INTERNAL_ERROR,
      );
    }

    return error;
  }

  if (error instanceof Error) {
    if (error.message.includes('API key') || error.message.includes('api_key')) {
      return new ApiError(
        HttpStatus.SERVICE_UNAVAILABLE,
        'AI provider is not configured correctly',
        ErrorCode.INTERNAL_ERROR,
      );
    }
    return new ApiError(
      HttpStatus.BAD_GATEWAY,
      'AI provider request failed',
      ErrorCode.INTERNAL_ERROR,
    );
  }

  return new ApiError(
    HttpStatus.INTERNAL_SERVER_ERROR,
    'An unexpected AI error occurred',
    ErrorCode.INTERNAL_ERROR,
  );
}

function extractJSON(text: string): unknown {
  const trimmed = text.trim();
  if (trimmed.startsWith('```')) {
    const match = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (match) {
      return JSON.parse(match[1].trim());
    }
  }
  return JSON.parse(trimmed);
}

export class OpenAIProvider implements AIProvider {
  readonly name = 'OPENAI';
  readonly isAvailable: boolean;

  constructor(private readonly config: AIProviderConfig) {
    this.isAvailable = Boolean(config.apiKey && config.model);
  }

  async generateSummary(input: AISummaryInput, context?: Record<string, unknown>): Promise<AISummaryOutput> {
    const raw = await this.complete('generateSummary', input, context);
    const parsed = raw as Record<string, unknown>;
    return {
      summary: String(parsed.summary ?? ''),
      confidence: Number(parsed.confidence ?? 0),
      generatedAt: new Date(),
    };
  }

  async checkEligibility(input: AIEligibilityInput, context?: Record<string, unknown>): Promise<AIEligibilityOutput> {
    const raw = await this.complete('checkEligibility', input, context);
    const parsed = raw as Record<string, unknown>;
    return {
      isEligible: Boolean(parsed.isEligible),
      score: Number(parsed.score ?? 0),
      reasons: Array.isArray(parsed.reasons) ? parsed.reasons.map(String) : [],
      generatedAt: new Date(),
    };
  }

  async analyzeRisk(input: AIRiskAnalysisInput, context?: Record<string, unknown>): Promise<AIRiskAnalysisOutput> {
    const raw = await this.complete('analyzeRisk', input, context);
    const parsed = raw as Record<string, unknown>;
    const riskLevel = String(parsed.riskLevel ?? 'MEDIUM');
    return {
      riskScore: Number(parsed.riskScore ?? 0),
      riskLevel: riskLevel as AIRiskAnalysisOutput['riskLevel'],
      factors: Array.isArray(parsed.factors) ? parsed.factors.map(String) : [],
      generatedAt: new Date(),
    };
  }

  async recommendScholarships(input: AIScholarshipInput, context?: Record<string, unknown>): Promise<AIScholarshipOutput> {
    const raw = await this.complete('recommendScholarships', input, context);
    const parsed = raw as Record<string, unknown>;
    const items = Array.isArray(parsed.recommendedScholarships) ? parsed.recommendedScholarships : [];
    return {
      recommendedScholarships: items.map((item) => ({
        name: String((item as Record<string, unknown>).name ?? ''),
        amount: Number((item as Record<string, unknown>).amount ?? 0),
        eligibility: Boolean((item as Record<string, unknown>).eligibility),
      })),
      generatedAt: new Date(),
    };
  }

  async generateCounselingNotes(input: AICounselingNotesInput, context?: Record<string, unknown>): Promise<AICounselingNotesOutput> {
    const raw = await this.complete('generateCounselingNotes', input, context);
    const parsed = raw as Record<string, unknown>;
    return {
      structuredNotes: String(parsed.structuredNotes ?? ''),
      keyPoints: Array.isArray(parsed.keyPoints) ? parsed.keyPoints.map(String) : [],
      nextSteps: Array.isArray(parsed.nextSteps) ? parsed.nextSteps.map(String) : [],
      generatedAt: new Date(),
    };
  }

  async generateAdmissionEmail(input: AIAdmissionEmailInput, context?: Record<string, unknown>): Promise<AIAdmissionEmailOutput> {
    const raw = await this.complete('generateAdmissionEmail', input, context);
    const parsed = raw as Record<string, unknown>;
    return {
      subject: String(parsed.subject ?? ''),
      body: String(parsed.body ?? ''),
      generatedAt: new Date(),
    };
  }

  async generateWhatsAppDraft(input: AIWhatsAppDraftInput, context?: Record<string, unknown>): Promise<AIWhatsAppDraftOutput> {
    const raw = await this.complete('generateWhatsAppDraft', input, context);
    const parsed = raw as Record<string, unknown>;
    const draft = String(parsed.draft ?? '');
    return {
      draft,
      characterCount: draft.length,
      generatedAt: new Date(),
    };
  }

  async recommendNextAction(input: AINextActionInput, context?: Record<string, unknown>): Promise<AINextActionOutput> {
    const raw = await this.complete('recommendNextAction', input, context);
    const parsed = raw as Record<string, unknown>;
    const priority = String(parsed.priority ?? 'MEDIUM');
    return {
      recommendedAction: String(parsed.recommendedAction ?? ''),
      priority: priority as AINextActionOutput['priority'],
      reasoning: String(parsed.reasoning ?? ''),
      generatedAt: new Date(),
    };
  }

  private async complete(operation: string, input: unknown, context?: Record<string, unknown>): Promise<unknown> {
    if (!this.isAvailable) {
      throw new ApiError(
        HttpStatus.SERVICE_UNAVAILABLE,
        'AI provider is not configured',
        ErrorCode.INTERNAL_ERROR,
      );
    }

    const messages = buildMessages(operation, input, context);
    const body = {
      model: this.config.model,
      messages,
      temperature: 0.2,
      max_tokens: 1024,
      response_format: { type: 'json_object' },
    };

    let lastError: Error = new Error('AI provider request failed');
    for (let attempt = 0; attempt <= this.config.maxRetries; attempt++) {
      try {
        const response = await this.fetchWithTimeout(
          `${this.config.baseURL ?? 'https://api.openai.com/v1'}/chat/completions`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${this.config.apiKey}`,
            },
            body: JSON.stringify(body),
          },
          this.config.timeoutMs,
        );

        if (!response.ok) {
          const text = await response.text().catch(() => '');
          logger.warn('AI provider request failed', {
            status: response.status,
            body: text.slice(0, 500),
          });
          throw new ApiError(
            HttpStatus.BAD_GATEWAY,
            `AI provider responded with status ${response.status}`,
            ErrorCode.INTERNAL_ERROR,
          );
        }

        const data = (await response.json()) as OpenAIChatResponse;
        const content = data.choices?.[0]?.message?.content;
        if (!content) {
          throw new ApiError(
            HttpStatus.BAD_GATEWAY,
            'AI provider returned an empty response',
            ErrorCode.INTERNAL_ERROR,
          );
        }

        try {
          return extractJSON(content);
        } catch {
          logger.warn('Malformed AI JSON response', { content: content.slice(0, 500) });
          throw new ApiError(
            HttpStatus.BAD_GATEWAY,
            'AI provider returned a malformed response',
            ErrorCode.INTERNAL_ERROR,
          );
        }
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));
        if (attempt < this.config.maxRetries) {
          const backoffMs = Math.min(1000 * 2 ** attempt, 30000);
          await new Promise((resolve) => setTimeout(resolve, backoffMs));
        }
      }
    }

    throw sanitizeError(lastError);
  }

  private async fetchWithTimeout(url: string, init: RequestInit, timeoutMs: number): Promise<Response> {
    const controller = new AbortController();
    const timeoutHandle = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const response = await Promise.race([
        fetch(url, {
          ...init,
          signal: controller.signal,
        }),
        new Promise<never>((_, reject) => {
          setTimeout(() => {
            controller.abort();
            reject(
              new ApiError(
                HttpStatus.GATEWAY_TIMEOUT,
                'AI provider request timed out',
                ErrorCode.INTERNAL_ERROR,
              ),
            );
          }, timeoutMs);
        }),
      ]);

      return response;
    } catch (error) {
      if ((error as Error).name === 'AbortError' || (error instanceof ApiError && error.message === 'AI provider request timed out')) {
        throw new ApiError(
          HttpStatus.GATEWAY_TIMEOUT,
          'AI provider request timed out',
          ErrorCode.INTERNAL_ERROR,
        );
      }
      throw error;
    } finally {
      clearTimeout(timeoutHandle);
    }
  }
}

export class AIProviderFactory {
  static create(config: AIProviderConfig): AIProvider {
    switch (config.provider) {
      case 'OPENAI':
        if (!config.apiKey || !config.model) {
          throw new ApiError(
            HttpStatus.SERVICE_UNAVAILABLE,
            'AI provider is not configured',
            ErrorCode.INTERNAL_ERROR,
          );
        }
        return new OpenAIProvider(config);
      case 'ANTHROPIC':
        throw new ApiError(
          HttpStatus.NOT_IMPLEMENTED,
          'ANTHROPIC provider is not yet implemented',
          ErrorCode.INTERNAL_ERROR,
        );
      case 'AZURE_OPENAI':
        throw new ApiError(
          HttpStatus.NOT_IMPLEMENTED,
          'AZURE_OPENAI provider is not yet implemented',
          ErrorCode.INTERNAL_ERROR,
        );
      case 'MOCK':
        throw new ApiError(
          HttpStatus.SERVICE_UNAVAILABLE,
          'MOCK provider is not available in production. Configure a real AI provider.',
          ErrorCode.INTERNAL_ERROR,
        );
      default:
        throw new ApiError(
          HttpStatus.BAD_REQUEST,
          `Unsupported AI provider: ${config.provider}`,
          ErrorCode.VALIDATION_ERROR,
        );
    }
  }
}
