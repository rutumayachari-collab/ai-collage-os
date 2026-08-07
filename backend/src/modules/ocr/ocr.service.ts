import { BadRequestError } from '../../shared/utils/api-error.util';
import type { OCRProviderInterface } from './ocr.providers';
import { TesseractOCRProvider, GoogleVisionOCRProvider, AzureDocumentIntelligenceProvider } from './ocr.providers.impl';
import type { OCRProcessingRequest, OCRProcessingResult, OCRProvider, OCREngineHealth } from './ocr.types';

const providerRegistry: Record<OCRProvider, OCRProviderInterface> = {
  TESSERACT: new TesseractOCRProvider(),
  GOOGLE_VISION: new GoogleVisionOCRProvider(),
  AZURE_DOCUMENT_INTELLIGENCE: new AzureDocumentIntelligenceProvider(),
};

export class OCRService {
  private provider: OCRProviderInterface;

  constructor(provider: OCRProvider = 'TESSERACT') {
    this.provider = providerRegistry[provider];
  }

  async processDocument(request: OCRProcessingRequest): Promise<OCRProcessingResult> {
    if (!this.provider.isHealthy) {
      throw new BadRequestError(`OCR provider ${this.provider.name} is not healthy`);
    }

    const result = await this.provider.processDocument(request);
    return result as OCRProcessingResult;
  }

  async getProviderHealth(): Promise<OCREngineHealth[]> {
    const healthChecks = await Promise.all(
      Object.values(providerRegistry).map(async (provider) => provider.getHealthStatus()),
    );
    return healthChecks as OCREngineHealth[];
  }

  async validateProviders(): Promise<boolean> {
    const validations = await Promise.all(
      Object.values(providerRegistry).map(async (provider) => provider.validateConfiguration()),
    );
    return validations.every((isValid) => isValid);
  }
}

export const ocrService = new OCRService();
