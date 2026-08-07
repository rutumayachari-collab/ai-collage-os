export type { OCRDocument, OCRProcessingHistory, OCRProcessingRequest, OCRProcessingResult, OCRProvider, OCRStatus, OCRDocumentType, OCRConfidenceLevel, OCREngineHealth } from './ocr.types';
export type { OCRProviderInterface, OCRProviderConfig } from './ocr.providers';
export { TesseractOCRProvider, GoogleVisionOCRProvider, AzureDocumentIntelligenceProvider } from './ocr.providers.impl';
