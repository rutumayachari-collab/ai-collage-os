export interface StudentAddress {
  street: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;
}

export interface StudentCurrentAddress {
  street: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;
  type: StudentAddressType;
}

export interface StudentEmergencyContact {
  name: string;
  relation: string;
  phone: string;
  email?: string;
}

export interface StudentPreviousQualification {
  institution: string;
  board: string;
  year: number;
  percentage: number;
  marksObtained?: number;
  totalMarks?: number;
}

export interface StudentDoc {
  name: string;
  type: StudentDocumentType;
  url: string;
  fileSize: number;
  uploadedAt: Date;
  uploadedBy: string;
}

export interface StudentProfileCompletion {
  personalInfo: boolean;
  contactInfo: boolean;
  academicInfo: boolean;
  guardianInfo: boolean;
  documents: boolean;
}

export type StudentGender = 'MALE' | 'FEMALE' | 'OTHER' | 'PREFER_NOT_TO_SAY';
export type StudentStatus = 'ACTIVE' | 'ALUMNI' | 'SUSPENDED' | 'WITHDRAWN' | 'GRADUATED';
export type StudentAdmissionType = 'MERIT' | 'MANAGEMENT' | 'NRI' | 'MANAGEMENT_QUOTA' | 'OTHER';
export type StudentGuardianRelation = 'FATHER' | 'MOTHER' | 'GUARDIAN' | 'OTHER';
export type StudentAddressType = 'HOSTEL' | 'PG' | 'RENTED' | 'FAMILY';
export type StudentDocumentType = 'AADHAR' | 'MARKSHEET' | 'PHOTO' | 'SIGNATURE' | 'OTHER';
