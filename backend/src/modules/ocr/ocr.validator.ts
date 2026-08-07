import { z } from 'zod';

export const OCRProcessingSchema = z.object({
  provider: z.enum(['TESSERACT', 'GOOGLE_VISION', 'AZURE_DOCUMENT_INTELLIGENCE']),
  documentType: z.enum(['AADHAAR', 'PAN', 'PASSPORT', 'DRIVING_LICENSE', 'BIRTH_CERTIFICATE', 'MARKSHEET', 'PHOTO', 'OTHER']),
  fileUrl: z.string().url('Invalid file URL'),
  mimeType: z.string().min(1, 'MIME type is required'),
  fileSizeBytes: z.number().positive('File size must be positive'),
  language: z.string().optional(),
});
