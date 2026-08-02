import { z } from 'zod';
import { emailSchema, phoneSchema, objectIdSchema } from '../../shared/validators';

export const facultyAddressSchema = z.object({
  street: z.string().trim().min(1, 'Street is required'),
  city: z.string().trim().min(1, 'City is required'),
  state: z.string().trim().min(1, 'State is required'),
  country: z.string().trim().min(1, 'Country is required'),
  postalCode: z.string().trim().min(1, 'Postal code is required'),
});

export const facultyCurrentAddressSchema = facultyAddressSchema.extend({
  type: z.enum(['HOSTEL', 'PG', 'RENTED', 'FAMILY']).optional(),
});

export const facultyEmergencyContactSchema = z.object({
  name: z.string().trim().min(1, 'Emergency contact name is required'),
  relation: z.string().trim().min(1, 'Relation is required'),
  phone: phoneSchema,
  email: z.string().trim().email('A valid email is required').optional().or(z.literal('')),
});

export const facultyQualificationSchema = z.object({
  degree: z.string().trim().min(1, 'Degree is required'),
  field: z.string().trim().min(1, 'Field is required'),
  institution: z.string().trim().min(1, 'Institution is required'),
  year: z.coerce.number().int().min(1950).max(new Date().getFullYear()),
  percentage: z.coerce.number().int().min(0).max(100).optional(),
  grade: z.string().trim().optional().or(z.literal('')),
});

export const facultyCertificationSchema = z.object({
  name: z.string().trim().min(1, 'Certification name is required'),
  issuingAuthority: z.string().trim().min(1, 'Issuing authority is required'),
  issueDate: z.coerce.date(),
  expiryDate: z.coerce.date().optional().or(z.literal('')),
  credentialId: z.string().trim().optional().or(z.literal('')),
});

export const facultyExperienceSchema = z.object({
  totalYears: z.coerce.number().int().min(0).max(50),
  industryYears: z.coerce.number().int().min(0).max(50),
  teachingYears: z.coerce.number().int().min(0).max(50),
  currentDesignation: z.string().trim().min(1, 'Current designation is required'),
  previousDesignations: z.array(z.object({
    designation: z.string().trim().min(1),
    organization: z.string().trim().min(1),
    from: z.coerce.date(),
    to: z.coerce.date().optional().or(z.literal('')),
  })).default([]),
});

export const facultyEmploymentHistoryItemSchema = z.object({
  organization: z.string().trim().min(1, 'Organization is required'),
  designation: z.string().trim().min(1, 'Designation is required'),
  department: z.string().trim().optional().or(z.literal('')),
  from: z.coerce.date(),
  to: z.coerce.date().optional().or(z.literal('')),
  employmentType: z.enum(['FULL_TIME', 'PART_TIME', 'CONTRACT', 'VISITING']),
  responsibilities: z.string().trim().optional().or(z.literal('')),
  reasonForLeaving: z.string().trim().optional().or(z.literal('')),
  createdAt: z.coerce.date(),
});

export const facultyResearchProjectSchema = z.object({
  title: z.string().trim().min(1, 'Project title is required').max(200),
  description: z.string().trim().min(1, 'Description is required').max(2000),
  fundingAgency: z.string().trim().optional().or(z.literal('')),
  amount: z.coerce.number().int().min(0).optional(),
  startDate: z.coerce.date(),
  endDate: z.coerce.date().optional().or(z.literal('')),
  status: z.enum(['PROPOSED', 'ONGOING', 'COMPLETED', 'CANCELLED']),
  role: z.enum(['PRINCIPAL_INVESTIGATOR', 'CO_INVESTIGATOR', 'TEAM_MEMBER']),
  teamMembers: z.array(z.string().trim()).default([]),
  publications: z.array(z.string().trim()).default([]),
  patents: z.array(z.string().trim()).default([]),
  createdAt: z.coerce.date(),
});

export const facultyPublicationSchema = z.object({
  type: z.enum(['JOURNAL', 'CONFERENCE', 'BOOK', 'BOOK_CHAPTER', 'PATENT']),
  title: z.string().trim().min(1, 'Title is required'),
  authors: z.array(z.string().trim()).min(1, 'At least one author is required'),
  publicationName: z.string().trim().min(1, 'Publication name is required'),
  year: z.coerce.number().int().min(1900).max(new Date().getFullYear() + 1),
  doi: z.string().trim().optional().or(z.literal('')),
  isbn: z.string().trim().optional().or(z.literal('')),
  url: z.string().trim().url().optional().or(z.literal('')),
});

export const facultyLanguageSchema = z.object({
  language: z.string().trim().min(1, 'Language is required'),
  proficiency: z.enum(['NATIVE', 'FLUENT', 'INTERMEDIATE', 'BASIC']),
});

export const facultyOfficeHourSchema = z.object({
  day: z.enum(['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY']),
  startTime: z.string().trim().regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format, use HH:mm'),
  endTime: z.string().trim().regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format, use HH:mm'),
  isActive: z.boolean().default(true),
  room: z.string().trim().optional().or(z.literal('')),
});

export const facultyTeachingLoadSchema = z.object({
  totalCreditHours: z.coerce.number().int().min(0).max(30),
  theoryHours: z.coerce.number().int().min(0).max(30),
  practicalHours: z.coerce.number().int().min(0).max(30),
  tutorialHours: z.coerce.number().int().min(0).max(30),
  coursesAssigned: z.coerce.number().int().min(0),
  subjectsAssigned: z.coerce.number().int().min(0),
  timetableSlotsAssigned: z.coerce.number().int().min(0),
  maxLoad: z.coerce.number().int().min(1).max(40),
  currentSemester: z.string().trim().min(1, 'Current semester is required'),
  academicYear: z.string().trim().regex(/^\d{4}-\d{4}$/, 'Academic year must be in format YYYY-YYYY'),
  overload: z.boolean().default(false),
});

export const facultyLeaveBalanceSchema = z.object({
  totalLeaves: z.coerce.number().int().min(0).max(30),
  usedLeaves: z.coerce.number().int().min(0),
  remainingLeaves: z.coerce.number().int().min(0),
  carryForwardLeaves: z.coerce.number().int().min(0),
  casualLeaves: z.object({
    total: z.coerce.number().int().min(0),
    used: z.coerce.number().int().min(0),
    remaining: z.coerce.number().int().min(0),
  }),
  sickLeaves: z.object({
    total: z.coerce.number().int().min(0),
    used: z.coerce.number().int().min(0),
    remaining: z.coerce.number().int().min(0),
  }),
  earnedLeaves: z.object({
    total: z.coerce.number().int().min(0),
    used: z.coerce.number().int().min(0),
    remaining: z.coerce.number().int().min(0),
  }),
  researchLeaves: z.object({
    total: z.coerce.number().int().min(0),
    used: z.coerce.number().int().min(0),
    remaining: z.coerce.number().int().min(0),
  }),
  currentLeave: z.object({
    type: z.enum(['CASUAL', 'SICK', 'EARNED', 'MATERNITY', 'PATERNITY', 'RESEARCH']),
    from: z.coerce.date(),
    to: z.coerce.date(),
    reason: z.string().trim().min(1, 'Reason is required'),
    approvedBy: z.string().trim().min(1, 'Approver ID is required'),
    status: z.enum(['PENDING', 'APPROVED', 'REJECTED']),
  }).optional(),
  lastUpdated: z.coerce.date(),
});

export const facultyAiTeachingProfileSchema = z.object({
  predictedPerformance: z.enum(['EXCELLENT', 'GOOD', 'AVERAGE', 'BELOW_AVERAGE']).nullable().default(null),
  predictedRetentionRisk: z.coerce.number().int().min(0).max(100).nullable().default(null),
  recommendedTraining: z.array(z.string().trim()).default([]),
  workloadScore: z.coerce.number().int().min(0).max(100).nullable().default(null),
  researchPotential: z.coerce.number().int().min(0).max(100).nullable().default(null),
  studentSatisfactionPrediction: z.coerce.number().int().min(0).max(100).nullable().default(null),
  courseFitScores: z.array(z.object({
    courseId: objectIdSchema,
    score: z.coerce.number().int().min(0).max(100),
    reasoning: z.string().trim().optional().or(z.literal('')),
  })).default([]),
  lastPredictionDate: z.coerce.date().nullable().default(null),
  aiGeneratedInsights: z.string().trim().nullable().default(null),
  confidenceScore: z.coerce.number().int().min(0).max(100).nullable().default(null),
  modelVersion: z.string().trim().nullable().default(null),
});

export const facultyUnavailabilityPeriodSchema = z.object({
  from: z.coerce.date(),
  to: z.coerce.date(),
  reason: z.string().trim().min(1, 'Reason is required'),
  type: z.enum(['LEAVE', 'CONFERENCE', 'RESEARCH', 'OTHER']),
});

export const facultyPreferredTimeSlotSchema = z.object({
  day: z.string().trim().min(1, 'Day is required'),
  startTime: z.string().trim().regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format, use HH:mm'),
  endTime: z.string().trim().regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format, use HH:mm'),
});

export const facultyAvailabilitySchema = z.object({
  isAvailable: z.boolean().default(true),
  unavailablePeriods: z.array(facultyUnavailabilityPeriodSchema).default([]),
  preferredSubjects: z.array(z.string().trim()).default([]),
  preferredTimeSlots: z.array(facultyPreferredTimeSlotSchema).default([]),
  maxWeeklyHours: z.coerce.number().int().min(1).max(60),
  currentWeeklyHours: z.coerce.number().int().min(0).max(60),
  lastUpdated: z.coerce.date(),
});

export const facultyDocumentSchema = z.object({
  name: z.string().trim().min(1, 'Document name is required'),
  type: z.enum(['RESUME', 'PHOTO', 'SIGNATURE', 'AADHAR', 'PAN', 'QUALIFICATION', 'EXPERIENCE_CERTIFICATE', 'RESEARCH_PAPER', 'OTHER']),
  url: z.string().trim().min(1, 'Document URL is required'),
  fileSize: z.coerce.number().int().min(0),
  verified: z.boolean().default(false),
  verifiedAt: z.coerce.date().optional().or(z.literal('')),
  verifiedBy: z.string().trim().optional().or(z.literal('')),
});

export const facultyCommitteeAssignmentSchema = z.object({
  committeeId: z.string().trim().min(1, 'Committee ID is required'),
  committeeName: z.string().trim().min(1, 'Committee name is required'),
  role: z.enum(['CHAIR', 'MEMBER', 'SECRETARY', 'COORDINATOR']),
  startDate: z.coerce.date(),
  endDate: z.coerce.date().optional().or(z.literal('')),
  status: z.enum(['ACTIVE', 'COMPLETED', 'CANCELLED']).default('ACTIVE'),
  remarks: z.string().trim().max(500).optional().or(z.literal('')),
});

export const facultyPerformanceMetricsSchema = z.object({
  averageRating: z.coerce.number().int().min(0).max(5),
  totalFeedbacks: z.coerce.number().int().min(0),
  lastFeedbackDate: z.coerce.date().optional().or(z.literal('')),
  studentSatisfaction: z.coerce.number().int().min(0).max(100).optional(),
  researchScore: z.coerce.number().int().min(0).max(100).optional(),
  overallScore: z.coerce.number().int().min(0).max(100).optional(),
});

export const facultySalaryMetadataSchema = z.object({
  basicPay: z.coerce.number().int().min(0).optional(),
  gradePay: z.coerce.number().int().min(0).optional(),
  allowances: z.record(z.coerce.number().int().min(0)).optional(),
  bankAccount: z.string().trim().optional().or(z.literal('')),
  bankIfsc: z.string().trim().optional().or(z.literal('')),
});

export const createFacultySchema = z.object({
  facultyId: z.string().trim().regex(/^[A-Z]{2,4}\d{3,6}$/, 'Faculty ID must be 2-4 uppercase letters followed by 3-6 digits'),
  employeeId: z.string().trim().min(1, 'Employee ID is required').max(30),
  userId: objectIdSchema.optional(),
  title: z.enum(['MR', 'MRS', 'MS', 'DR', 'PROF']),
  firstName: z.string().trim().min(2, 'First name must be at least 2 characters').max(50),
  lastName: z.string().trim().min(2, 'Last name must be at least 2 characters').max(50),
  dateOfBirth: z.coerce.date(),
  gender: z.enum(['MALE', 'FEMALE', 'OTHER', 'PREFER_NOT_TO_SAY']),
  bloodGroup: z.enum(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']).optional(),
  nationality: z.string().trim().min(1, 'Nationality is required'),
  religion: z.string().trim().optional().or(z.literal('')),
  category: z.enum(['GENERAL', 'OBC', 'SC', 'ST', 'EWS', 'OTHER']).optional(),
  aadharNumber: z.string().trim().regex(/^\d{12}$/, 'Aadhar number must be 12 digits').optional().or(z.literal('')),
  panNumber: z.string().trim().regex(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/, 'Invalid PAN format').optional().or(z.literal('')),
  photo: z.string().trim().url().optional().or(z.literal('')),
  signature: z.string().trim().url().optional().or(z.literal('')),
  email: emailSchema,
  phone: phoneSchema,
  officialEmail: emailSchema,
  officialPhone: z.string().trim().optional().or(z.literal('')),
  alternatePhone: phoneSchema.optional().or(z.literal('')),
  address: facultyAddressSchema,
  currentAddress: facultyCurrentAddressSchema.optional(),
  emergencyContact: facultyEmergencyContactSchema,
  joiningDate: z.coerce.date(),
  employeeType: z.enum(['PERMANENT', 'CONTRACT', 'VISITING', 'ADJUNCT']),
  designation: z.enum(['PROFESSOR', 'ASSOCIATE_PROFESSOR', 'ASSISTANT_PROFESSOR', 'LECTURER', 'VISITING_FACULTY', 'HOD', 'DEAN', 'PRINCIPAL']),
  academicRank: z.enum(['PROFESSOR', 'ASSOCIATE_PROFESSOR', 'ASSISTANT_PROFESSOR', 'LECTURER', 'SENIOR_LECTURER']),
  departmentId: objectIdSchema,
  supportingDepartmentIds: z.array(objectIdSchema).default([]),
  employmentStatus: z.enum(['ACTIVE', 'INACTIVE', 'ON_LEAVE', 'RETIRED', 'TERMINATED']).default('ACTIVE'),
  isActive: z.boolean().default(true),
  qualifications: z.array(facultyQualificationSchema).min(1, 'At least one qualification is required'),
  specializations: z.array(z.string().trim()).default([]),
  certifications: z.array(facultyCertificationSchema).default([]),
  experience: facultyExperienceSchema,
  employmentHistory: z.array(facultyEmploymentHistoryItemSchema).default([]),
  researchInterests: z.array(z.string().trim()).default([]),
  researchProjects: z.array(facultyResearchProjectSchema).default([]),
  publications: z.array(facultyPublicationSchema).default([]),
  skills: z.array(z.string().trim()).default([]),
  languages: z.array(facultyLanguageSchema).default([]),
  officeLocation: z.string().trim().optional().or(z.literal('')),
  officeHours: z.array(facultyOfficeHourSchema).default([]),
  teachingLoad: facultyTeachingLoadSchema.optional(),
  leaveBalance: facultyLeaveBalanceSchema.optional(),
  aiTeachingProfile: facultyAiTeachingProfileSchema.optional(),
  availability: facultyAvailabilitySchema.optional(),
  documents: z.array(facultyDocumentSchema).default([]),
  committeeAssignments: z.array(facultyCommitteeAssignmentSchema).default([]),
  status: z.enum(['ACTIVE', 'INACTIVE', 'ARCHIVED']).default('ACTIVE'),
  tags: z.array(z.string().trim()).optional(),
  remarks: z.string().trim().optional().or(z.literal('')),
});

export const updateFacultySchema = createFacultySchema.partial().omit({
  facultyId: true,
  employeeId: true,
  userId: true,
});

export const facultyQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  sort: z.string().trim().optional(),
  order: z.enum(['asc', 'desc']).default('desc'),
  search: z.string().trim().optional(),
  departmentId: z.string().trim().optional(),
  designation: z.enum(['PROFESSOR', 'ASSOCIATE_PROFESSOR', 'ASSISTANT_PROFESSOR', 'LECTURER', 'VISITING_FACULTY', 'HOD', 'DEAN', 'PRINCIPAL']).optional(),
  employmentStatus: z.enum(['ACTIVE', 'INACTIVE', 'ON_LEAVE', 'RETIRED', 'TERMINATED']).optional(),
  isActive: z.coerce.boolean().optional(),
  isHOD: z.coerce.boolean().optional(),
  employeeType: z.enum(['PERMANENT', 'CONTRACT', 'VISITING', 'ADJUNCT']).optional(),
  academicRank: z.enum(['PROFESSOR', 'ASSOCIATE_PROFESSOR', 'ASSISTANT_PROFESSOR', 'LECTURER', 'SENIOR_LECTURER']).optional(),
  joiningDateFrom: z.coerce.date().optional(),
  joiningDateTo: z.coerce.date().optional(),
});

export const bulkImportSchema = z.object({
  faculty: z.array(createFacultySchema).min(1).max(500),
});

export const bulkUpdateSchema = z.object({
  ids: z.array(objectIdSchema).min(1).max(500),
  updates: updateFacultySchema,
});

export const assignDepartmentSchema = z.object({
  departmentId: objectIdSchema,
  isPrimary: z.boolean().default(true),
});

export const removeDepartmentSchema = z.object({
  departmentId: objectIdSchema,
});

export const assignCourseSchema = z.object({
  courseId: objectIdSchema,
});

export const assignSubjectSchema = z.object({
  subjectId: objectIdSchema,
});

export const updateOfficeSchema = z.object({
  officeLocation: z.string().trim().optional().or(z.literal('')),
  officeHours: z.array(facultyOfficeHourSchema).default([]),
});

export const updateResearchSchema = z.object({
  researchInterests: z.array(z.string().trim()).default([]),
  researchProjects: z.array(facultyResearchProjectSchema).default([]),
  publications: z.array(facultyPublicationSchema).default([]),
});

export type CreateFacultyInput = z.infer<typeof createFacultySchema>;
export type UpdateFacultyInput = z.infer<typeof updateFacultySchema>;
export type FacultyQueryInput = z.infer<typeof facultyQuerySchema>;
export type BulkImportInput = z.infer<typeof bulkImportSchema>;
export type BulkUpdateInput = z.infer<typeof bulkUpdateSchema>;
export type AssignDepartmentInput = z.infer<typeof assignDepartmentSchema>;
export type RemoveDepartmentInput = z.infer<typeof removeDepartmentSchema>;
export type AssignCourseInput = z.infer<typeof assignCourseSchema>;
export type AssignSubjectInput = z.infer<typeof assignSubjectSchema>;
export type UpdateOfficeInput = z.infer<typeof updateOfficeSchema>;
export type UpdateResearchInput = z.infer<typeof updateResearchSchema>;
