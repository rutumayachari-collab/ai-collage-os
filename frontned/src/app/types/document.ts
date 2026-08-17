export type DocumentType =
  | "PHOTO"
  | "SIGNATURE"
  | "MARKSHEET"
  | "CERTIFICATE"
  | "ID_PROOF"
  | "ADDRESS_PROOF"
  | "ENTRANCE_SCORE"
  | "TRANSFER_CERTIFICATE"
  | "MIGRATION"
  | "OTHER";
export type DocumentStatus =
  | "NOT_REQUIRED"
  | "PENDING"
  | "UPLOADED"
  | "VERIFIED"
  | "REJECTED"
  | "EXPIRED"
  | "REQUIRES_REUPLOAD"
  | "UNDER_REVIEW";

export interface Document {
  id: string;
  documentVerificationId?: string;
  applicantId: string;
  applicationNumber?: string;
  documentId: string;
  type: DocumentType;
  name: string;
  fileUrl: string;
  fileSize: number;
  mimeType: string;
  uploadedBy: string;
  uploadedAt: string;
  status: DocumentStatus;
  description?: string;
  verifiedBy?: string;
  verifiedAt?: string;
  rejectionReason?: string;
  previousVersionId?: string;
  isCurrent: boolean;
  currentVersion?: number;
  ocrStatus?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateDocumentDto {
  applicantId: string;
  applicationNumber?: string;
  documentId: string;
  type: DocumentType;
  name: string;
  fileUrl: string;
  fileSize: number;
  mimeType: string;
  uploadedBy: string;
  description?: string;
  status?: DocumentStatus;
  verifiedBy?: string;
  verifiedAt?: string;
  rejectionReason?: string;
  previousVersionId?: string;
  isCurrent?: boolean;
}

export interface UpdateDocumentDto {
  status?: DocumentStatus;
  description?: string;
  verifiedBy?: string;
  verifiedAt?: string;
  rejectionReason?: string;
  isCurrent?: boolean;
}
