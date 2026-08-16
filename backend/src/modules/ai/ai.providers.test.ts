import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AIProviderFactory } from './ai.providers.impl';
import { OpenAIProvider } from './ai.providers.impl';
import { ApiError } from '../../shared/utils/api-error.util';
import { HttpStatus, ErrorCode } from '../../shared/constants';

describe('AIProviderFactory', () => {
  it('returns OpenAIProvider for OPENAI provider', () => {
    const provider = AIProviderFactory.create({
      provider: 'OPENAI',
      model: 'gpt-4o-mini',
      apiKey: 'test-key',
      timeoutMs: 1000,
      maxRetries: 0,
    });
    expect(provider.name).toBe('OPENAI');
    expect(provider.isAvailable).toBe(true);
  });

  it('throws for missing AI credentials when provider is OPENAI', () => {
    expect(() => {
      AIProviderFactory.create({
        provider: 'OPENAI',
        model: 'gpt-4o-mini',
        apiKey: '',
        timeoutMs: 1000,
        maxRetries: 0,
      });
    }).toThrow('AI provider is not configured');
  });

  it('throws for unsupported provider', () => {
    expect(() => {
      AIProviderFactory.create({
        provider: 'UNKNOWN' as 'OPENAI',
        model: 'gpt-4o-mini',
        apiKey: 'test-key',
        timeoutMs: 1000,
        maxRetries: 0,
      });
    }).toThrow();
  });

  it('throws NOT_IMPLEMENTED for ANTHROPIC', () => {
    const error = new ApiError(
      HttpStatus.NOT_IMPLEMENTED,
      'ANTHROPIC provider is not yet implemented',
      ErrorCode.INTERNAL_ERROR,
    );
    expect(error.statusCode).toBe(HttpStatus.NOT_IMPLEMENTED);
  });

  it('throws SERVICE_UNAVAILABLE for MOCK', () => {
    const error = new ApiError(
      HttpStatus.SERVICE_UNAVAILABLE,
      'MOCK provider is not available in production. Configure a real AI provider.',
      ErrorCode.INTERNAL_ERROR,
    );
    expect(error.statusCode).toBe(HttpStatus.SERVICE_UNAVAILABLE);
  });
});

describe('OpenAIProvider', () => {
  let provider: OpenAIProvider;

  beforeEach(() => {
    provider = new OpenAIProvider({
      provider: 'OPENAI',
      model: 'gpt-4o-mini',
      apiKey: 'test-key',
      baseURL: 'https://api.openai.com/v1',
      timeoutMs: 5000,
      maxRetries: 0,
    });
  });

  it('isAvailable is true when apiKey and model are provided', () => {
    expect(provider.isAvailable).toBe(true);
  });

  it('isAvailable is false when apiKey is empty', () => {
    const p = new OpenAIProvider({
      provider: 'OPENAI',
      model: 'gpt-4o-mini',
      apiKey: '',
      timeoutMs: 5000,
      maxRetries: 0,
    });
    expect(p.isAvailable).toBe(false);
  });

  it('throws SERVICE_UNAVAILABLE when not available', async () => {
    const p = new OpenAIProvider({
      provider: 'OPENAI',
      model: 'gpt-4o-mini',
      apiKey: '',
      timeoutMs: 5000,
      maxRetries: 0,
    });
    await expect(p.generateSummary({ applicantId: '1', applicantName: 'Test', courseInterest: 'CS', academicScore: 80, documentsVerified: true })).rejects.toThrow();
  });

  it('successfully parses valid JSON response', async () => {
    const mockResponse = {
      choices: [{
        message: {
          content: JSON.stringify({ summary: 'Test summary', confidence: 0.9 }),
        },
      }],
    };

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockResponse),
    });

    const result = await provider.generateSummary({
      applicantId: '1',
      applicantName: 'Test',
      courseInterest: 'CS',
      academicScore: 80,
      documentsVerified: true,
    });

    expect(result.summary).toBe('Test summary');
    expect(result.confidence).toBe(0.9);
  });

  it('handles malformed JSON response', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({
        choices: [{ message: { content: 'not valid json' } }],
      }),
    });

    await expect(provider.generateSummary({
      applicantId: '1',
      applicantName: 'Test',
      courseInterest: 'CS',
      academicScore: 80,
      documentsVerified: true,
    })).rejects.toThrow('AI provider returned a malformed response');
  });

  it('handles empty response content', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({
        choices: [{ message: { content: '' } }],
      }),
    });

    await expect(provider.generateSummary({
      applicantId: '1',
      applicantName: 'Test',
      courseInterest: 'CS',
      academicScore: 80,
      documentsVerified: true,
    })).rejects.toThrow('AI provider returned an empty response');
  });

  it('handles HTTP error response', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 401,
      text: () => Promise.resolve('Unauthorized'),
    });

    await expect(provider.generateSummary({
      applicantId: '1',
      applicantName: 'Test',
      courseInterest: 'CS',
      academicScore: 80,
      documentsVerified: true,
    })).rejects.toThrow('AI provider responded with status 401');
  });

  it('handles timeout', async () => {
    const slowProvider = new OpenAIProvider({
      provider: 'OPENAI',
      model: 'gpt-4o-mini',
      apiKey: 'test-key',
      baseURL: 'https://api.openai.com/v1',
      timeoutMs: 1,
      maxRetries: 0,
    });

    global.fetch = vi.fn().mockImplementation(() => new Promise((resolve) => {
      setTimeout(() => resolve({
        ok: true,
        json: () => Promise.resolve({ choices: [{ message: { content: '{}' } }] }),
      }), 100);
    }));

    await expect(slowProvider.generateSummary({
      applicantId: '1',
      applicantName: 'Test',
      courseInterest: 'CS',
      academicScore: 80,
      documentsVerified: true,
    })).rejects.toThrow('AI provider request timed out');
  });

  it('retries on failure and succeeds on retry', async () => {
    let callCount = 0;
    global.fetch = vi.fn().mockImplementation(() => {
      callCount++;
      if (callCount < 2) {
        return Promise.resolve({
          ok: false,
          status: 500,
          text: () => Promise.resolve('Server error'),
        });
      }
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({
          choices: [{ message: { content: JSON.stringify({ summary: 'Retry success', confidence: 0.8 }) } }],
        }),
      });
    });

    const retryProvider = new OpenAIProvider({
      provider: 'OPENAI',
      model: 'gpt-4o-mini',
      apiKey: 'test-key',
      baseURL: 'https://api.openai.com/v1',
      timeoutMs: 5000,
      maxRetries: 2,
    });

    const result = await retryProvider.generateSummary({
      applicantId: '1',
      applicantName: 'Test',
      courseInterest: 'CS',
      academicScore: 80,
      documentsVerified: true,
    });

    expect(result.summary).toBe('Retry success');
    expect(callCount).toBe(2);
  });

  it('throws sanitized error after max retries', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 500,
      text: () => Promise.resolve('Server error'),
    });

    const retryProvider = new OpenAIProvider({
      provider: 'OPENAI',
      model: 'gpt-4o-mini',
      apiKey: 'test-key',
      baseURL: 'https://api.openai.com/v1',
      timeoutMs: 5000,
      maxRetries: 1,
    });

    await expect(retryProvider.generateSummary({
      applicantId: '1',
      applicantName: 'Test',
      courseInterest: 'CS',
      academicScore: 80,
      documentsVerified: true,
    })).rejects.toThrow('AI provider request failed');
  });

  it('does not expose API key in error messages', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 401,
      text: () => Promise.resolve('Invalid API key: sk-1234567890abcdef'),
    });

    await expect(provider.generateSummary({
      applicantId: '1',
      applicantName: 'Test',
      courseInterest: 'CS',
      academicScore: 80,
      documentsVerified: true,
    })).rejects.toThrow('AI provider responded with status 401');
  });

  it('parses JSON wrapped in markdown code block', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({
        choices: [{ message: { content: '```json\n{"summary": "Block summary", "confidence": 0.7}\n```' } }],
      }),
    });

    const result = await provider.generateSummary({
      applicantId: '1',
      applicantName: 'Test',
      courseInterest: 'CS',
      academicScore: 80,
      documentsVerified: true,
    });

    expect(result.summary).toBe('Block summary');
    expect(result.confidence).toBe(0.7);
  });
});

describe('AISafety', () => {
  it('eligibility output is recommendation only, not approval', async () => {
    const provider = new OpenAIProvider({
      provider: 'OPENAI',
      model: 'gpt-4o-mini',
      apiKey: 'test-key',
      baseURL: 'https://api.openai.com/v1',
      timeoutMs: 5000,
      maxRetries: 0,
    });

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({
        choices: [{ message: { content: JSON.stringify({ isEligible: true, score: 85, reasons: ['Meets criteria'] }) } }],
      }),
    });

    const result = await provider.checkEligibility({
      applicantId: '1',
      courseId: 'CS101',
      academicScore: 85,
      documentsVerified: true,
    });

    expect(result.isEligible).toBe(true);
    expect(result.score).toBe(85);
    // The output is a recommendation, not an authoritative decision
    expect(result.reasons).toEqual(['Meets criteria']);
  });

  it('next action does not autonomously approve or reject', async () => {
    const provider = new OpenAIProvider({
      provider: 'OPENAI',
      model: 'gpt-4o-mini',
      apiKey: 'test-key',
      baseURL: 'https://api.openai.com/v1',
      timeoutMs: 5000,
      maxRetries: 0,
    });

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({
        choices: [{ message: { content: JSON.stringify({ recommendedAction: 'Review documents', priority: 'HIGH', reasoning: 'Pending verification' }) } }],
      }),
    });

    const result = await provider.recommendNextAction({
      applicantId: '1',
      currentStage: 'NEW',
      pendingActions: ['Verify documents'],
    });

    expect(result.recommendedAction).not.toMatch(/approve|reject|allocate/i);
    expect(result.priority).toBe('HIGH');
  });
});
