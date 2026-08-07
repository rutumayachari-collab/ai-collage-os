export type InquiryStatus = "NEW" | "CONTACTED" | "QUALIFIED" | "CONVERTED" | "CLOSED";

export interface Inquiry {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  courseInterest: string;
  status: InquiryStatus;
  source: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  assignedTo?: string;
}

export interface CreateInquiryDto {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  courseInterest: string;
  source?: string;
  notes?: string;
}

export interface UpdateInquiryDto extends Partial<CreateInquiryDto> {
  status?: InquiryStatus;
  assignedTo?: string;
}
