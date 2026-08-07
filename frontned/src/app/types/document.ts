export type DocumentType =
  "PHOTO" | "ID_PROOF" | "MARKSHEET" | "CERTIFICATE" | "TRANSFER" | "PHOTO_ID" | "OTHER";
export type DocumentStatus = "PENDING" | "UPLOADED" | "VERIFIED" | "REJECTED" | "EXPIRED";

export interface Document {
  id: string;
  applicantId: string;
  applicantName?: string;
  type: DocumentType;
  name: string;
  url: string;
  status: DocumentStatus;
  verifiedBy?: string;
  verifiedAt?: string;
  rejectionReason?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateDocumentDto {
  applicantId: string;
  type: DocumentType;
  name: string;
  url: string;
}

export interface UpdateDocumentDto {
  status?: DocumentStatus;
  verifiedBy?: string;
  rejectionReason?: string;
}
