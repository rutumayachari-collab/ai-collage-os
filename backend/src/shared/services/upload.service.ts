import multer, { type FileFilterCallback, type Multer } from 'multer';
import type { Request } from 'express';
import { uploadConfig } from '../../config/app.config';
import { ErrorCode, HttpStatus } from '../constants';
import { ApiError } from '../utils/api-error.util';

const fileFilter = (_req: Request, file: Express.Multer.File, callback: FileFilterCallback): void => {
  if (!uploadConfig.allowedMimeTypes.includes(file.mimetype)) {
    callback(
      new ApiError(
        HttpStatus.BAD_REQUEST,
        `Unsupported file type: ${file.mimetype}`,
        ErrorCode.UPLOAD_ERROR,
      ),
    );
    return;
  }
  callback(null, true);
};

/**
 * Shared in-memory upload handler. Buffers are handed to a storage service by
 * feature modules, so no local disk writes happen in production.
 */
export const uploader: Multer = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: uploadConfig.maxFileSizeBytes },
  fileFilter,
});
