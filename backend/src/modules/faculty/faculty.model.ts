import { Schema, model, type HydratedDocument, type Model } from 'mongoose';
import type { FacultySchemaType } from './faculty.types';

export type FacultyDocument = HydratedDocument<FacultySchemaType>;
export { FacultySchemaType };

const facultySchema = new Schema<FacultySchemaType>(
  {
    facultyId: { type: String, required: true, unique: true, index: true },
    employeeId: { type: String, required: true, unique: true, index: true },
    userId: { type: String, index: true },
    title: { type: String, required: true, enum: ['MR', 'MRS', 'MS', 'DR', 'PROF'] },
    firstName: { type: String, required: true, trim: true, maxlength: 50 },
    lastName: { type: String, required: true, trim: true, maxlength: 50 },
    displayName: { type: String, required: true, trim: true, maxlength: 100 },
    dateOfBirth: { type: Date, required: true },
    gender: { type: String, required: true, enum: ['MALE', 'FEMALE', 'OTHER', 'PREFER_NOT_TO_SAY'] },
    bloodGroup: { type: String, enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'] },
    nationality: { type: String, required: true, trim: true },
    religion: { type: String, trim: true },
    category: { type: String, enum: ['GENERAL', 'OBC', 'SC', 'ST', 'EWS', 'OTHER'] },
    aadharNumber: { type: String, trim: true, unique: true, sparse: true },
    panNumber: { type: String, trim: true },
    photo: { type: String, trim: true },
    signature: { type: String, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
    phone: { type: String, required: true, unique: true, trim: true, index: true },
    officialEmail: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
    officialPhone: { type: String, trim: true },
    alternatePhone: { type: String, trim: true },
    address: {
      street: { type: String, required: true, trim: true },
      city: { type: String, required: true, trim: true },
      state: { type: String, required: true, trim: true },
      country: { type: String, required: true, trim: true },
      postalCode: { type: String, required: true, trim: true },
    },
    currentAddress: {
      street: { type: String, trim: true },
      city: { type: String, trim: true },
      state: { type: String, trim: true },
      country: { type: String, trim: true },
      postalCode: { type: String, trim: true },
      type: { type: String, enum: ['HOSTEL', 'PG', 'RENTED', 'FAMILY'] },
    },
    emergencyContact: {
      name: { type: String, required: true, trim: true },
      relation: { type: String, required: true, trim: true },
      phone: { type: String, required: true, trim: true },
      email: { type: String, trim: true },
    },
    joiningDate: { type: Date, required: true },
    employeeType: { type: String, required: true, enum: ['PERMANENT', 'CONTRACT', 'VISITING', 'ADJUNCT'], index: true },
    designation: { type: String, required: true, enum: ['PROFESSOR', 'ASSOCIATE_PROFESSOR', 'ASSISTANT_PROFESSOR', 'LECTURER', 'VISITING_FACULTY', 'HOD', 'DEAN', 'PRINCIPAL'], index: true },
    academicRank: { type: String, required: true, enum: ['PROFESSOR', 'ASSOCIATE_PROFESSOR', 'ASSISTANT_PROFESSOR', 'LECTURER', 'SENIOR_LECTURER'] },
    departmentId: { type: String, required: true, index: true },
    supportingDepartmentIds: [{ type: String, index: true }],
    isHOD: { type: Boolean, index: true },
    hodDepartmentId: { type: String, index: true },
    employmentStatus: { type: String, required: true, enum: ['ACTIVE', 'INACTIVE', 'ON_LEAVE', 'RETIRED', 'TERMINATED'], default: 'ACTIVE', index: true },
    isActive: { type: Boolean, required: true, default: true, index: true },
    qualifications: [
      {
        degree: { type: String, required: true, trim: true },
        field: { type: String, required: true, trim: true },
        institution: { type: String, required: true, trim: true },
        year: { type: Number, required: true, min: 1950 },
        percentage: { type: Number, min: 0, max: 100 },
        grade: { type: String, trim: true },
      },
    ],
    specializations: [{ type: String, trim: true, index: true }],
    certifications: [
      {
        name: { type: String, required: true, trim: true },
        issuingAuthority: { type: String, required: true, trim: true },
        issueDate: { type: Date, required: true },
        expiryDate: { type: Date },
        credentialId: { type: String, trim: true },
      },
    ],
    experience: {
      totalYears: { type: Number, required: true, min: 0, max: 50 },
      industryYears: { type: Number, required: true, min: 0, max: 50 },
      teachingYears: { type: Number, required: true, min: 0, max: 50 },
      currentDesignation: { type: String, required: true, trim: true },
      previousDesignations: [
        {
          designation: { type: String, required: true, trim: true },
          organization: { type: String, required: true, trim: true },
          from: { type: Date, required: true },
          to: { type: Date },
        },
      ],
    },
    employmentHistory: [
      {
        organization: { type: String, required: true, trim: true },
        designation: { type: String, required: true, trim: true },
        department: { type: String, trim: true },
        from: { type: Date, required: true },
        to: { type: Date },
        employmentType: { type: String, required: true, enum: ['FULL_TIME', 'PART_TIME', 'CONTRACT', 'VISITING'] },
        responsibilities: { type: String, trim: true },
        reasonForLeaving: { type: String, trim: true },
        createdAt: { type: Date, required: true },
      },
    ],
    researchInterests: [{ type: String, trim: true, index: true }],
    researchProjects: [
      {
        title: { type: String, required: true, trim: true, maxlength: 200 },
        description: { type: String, required: true, trim: true, maxlength: 2000 },
        fundingAgency: { type: String, trim: true },
        amount: { type: Number, min: 0 },
        startDate: { type: Date, required: true },
        endDate: { type: Date },
        status: { type: String, required: true, enum: ['PROPOSED', 'ONGOING', 'COMPLETED', 'CANCELLED'] },
        role: { type: String, required: true, enum: ['PRINCIPAL_INVESTIGATOR', 'CO_INVESTIGATOR', 'TEAM_MEMBER'] },
        teamMembers: [{ type: String, trim: true }],
        publications: [{ type: String, trim: true }],
        patents: [{ type: String, trim: true }],
        createdAt: { type: Date, required: true },
      },
    ],
    publications: [
      {
        type: { type: String, required: true, enum: ['JOURNAL', 'CONFERENCE', 'BOOK', 'BOOK_CHAPTER', 'PATENT'] },
        title: { type: String, required: true, trim: true },
        authors: [{ type: String, required: true, trim: true }],
        publicationName: { type: String, required: true, trim: true },
        year: { type: Number, required: true, min: 1900 },
        doi: { type: String, trim: true },
        isbn: { type: String, trim: true },
        url: { type: String, trim: true },
      },
    ],
    skills: [{ type: String, trim: true, index: true }],
    languages: [
      {
        language: { type: String, required: true, trim: true },
        proficiency: { type: String, required: true, enum: ['NATIVE', 'FLUENT', 'INTERMEDIATE', 'BASIC'] },
      },
    ],
    officeLocation: { type: String, trim: true },
    officeHours: [
      {
        day: { type: String, required: true, enum: ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'] },
        startTime: { type: String, required: true, trim: true },
        endTime: { type: String, required: true, trim: true },
        isActive: { type: Boolean, required: true, default: true },
        room: { type: String, trim: true },
      },
    ],
    courses: [{ type: String, index: true }],
    subjects: [{ type: String, index: true }],
    timetableSlots: [{ type: String, index: true }],
    teachingLoad: {
      totalCreditHours: { type: Number, required: true, min: 0, max: 30 },
      theoryHours: { type: Number, required: true, min: 0, max: 30 },
      practicalHours: { type: Number, required: true, min: 0, max: 30 },
      tutorialHours: { type: Number, required: true, min: 0, max: 30 },
      coursesAssigned: { type: Number, required: true, min: 0 },
      subjectsAssigned: { type: Number, required: true, min: 0 },
      timetableSlotsAssigned: { type: Number, required: true, min: 0 },
      maxLoad: { type: Number, required: true, min: 1, max: 40 },
      currentSemester: { type: String, required: true, trim: true },
      academicYear: { type: String, required: true, trim: true },
      overload: { type: Boolean, required: true, default: false },
      lastUpdated: { type: Date, required: true },
    },
    performanceMetrics: {
      averageRating: { type: Number, required: true, min: 0, max: 5 },
      totalFeedbacks: { type: Number, required: true, min: 0 },
      lastFeedbackDate: { type: Date },
      studentSatisfaction: { type: Number, min: 0, max: 100 },
      researchScore: { type: Number, min: 0, max: 100 },
      overallScore: { type: Number, min: 0, max: 100 },
    },
    leaveBalance: {
      totalLeaves: { type: Number, required: true, min: 0, max: 30 },
      usedLeaves: { type: Number, required: true, min: 0 },
      remainingLeaves: { type: Number, required: true, min: 0 },
      carryForwardLeaves: { type: Number, required: true, min: 0 },
      casualLeaves: {
        total: { type: Number, required: true, min: 0 },
        used: { type: Number, required: true, min: 0 },
        remaining: { type: Number, required: true, min: 0 },
      },
      sickLeaves: {
        total: { type: Number, required: true, min: 0 },
        used: { type: Number, required: true, min: 0 },
        remaining: { type: Number, required: true, min: 0 },
      },
      earnedLeaves: {
        total: { type: Number, required: true, min: 0 },
        used: { type: Number, required: true, min: 0 },
        remaining: { type: Number, required: true, min: 0 },
      },
      researchLeaves: {
        total: { type: Number, required: true, min: 0 },
        used: { type: Number, required: true, min: 0 },
        remaining: { type: Number, required: true, min: 0 },
      },
      currentLeave: {
        type: { type: String, enum: ['CASUAL', 'SICK', 'EARNED', 'MATERNITY', 'PATERNITY', 'RESEARCH'] },
        from: { type: Date },
        to: { type: Date },
        reason: { type: String, trim: true },
        approvedBy: { type: String, trim: true },
        status: { type: String, enum: ['PENDING', 'APPROVED', 'REJECTED'] },
      },
      lastUpdated: { type: Date, required: true },
    },
    salaryMetadata: {
      basicPay: { type: Number, min: 0 },
      gradePay: { type: Number, min: 0 },
      allowances: { type: Map, of: { type: Number, min: 0 } },
      bankAccount: { type: String, trim: true },
      bankIfsc: { type: String, trim: true },
    },
    aiTeachingProfile: {
      predictedPerformance: { type: String, enum: ['EXCELLENT', 'GOOD', 'AVERAGE', 'BELOW_AVERAGE'] },
      predictedRetentionRisk: { type: Number, min: 0, max: 100 },
      recommendedTraining: [{ type: String, trim: true }],
      workloadScore: { type: Number, min: 0, max: 100 },
      researchPotential: { type: Number, min: 0, max: 100 },
      studentSatisfactionPrediction: { type: Number, min: 0, max: 100 },
      courseFitScores: [
        {
          courseId: { type: String, required: true },
          score: { type: Number, required: true, min: 0, max: 100 },
          reasoning: { type: String, trim: true },
        },
      ],
      lastPredictionDate: { type: Date },
      aiGeneratedInsights: { type: String, trim: true },
      confidenceScore: { type: Number, min: 0, max: 100 },
      modelVersion: { type: String, trim: true },
    },
    availability: {
      isAvailable: { type: Boolean, required: true, default: true },
      unavailablePeriods: [
        {
          from: { type: Date, required: true },
          to: { type: Date, required: true },
          reason: { type: String, required: true, trim: true },
          type: { type: String, required: true, enum: ['LEAVE', 'CONFERENCE', 'RESEARCH', 'OTHER'] },
        },
      ],
      preferredSubjects: [{ type: String, trim: true }],
      preferredTimeSlots: [
        {
          day: { type: String, required: true, trim: true },
          startTime: { type: String, required: true, trim: true },
          endTime: { type: String, required: true, trim: true },
        },
      ],
      maxWeeklyHours: { type: Number, required: true, min: 1, max: 60 },
      currentWeeklyHours: { type: Number, required: true, min: 0, max: 60 },
      lastUpdated: { type: Date, required: true },
    },
    documents: [
      {
        name: { type: String, required: true, trim: true },
        type: { type: String, required: true, enum: ['RESUME', 'PHOTO', 'SIGNATURE', 'AADHAR', 'PAN', 'QUALIFICATION', 'EXPERIENCE_CERTIFICATE', 'RESEARCH_PAPER', 'OTHER'] },
        url: { type: String, required: true, trim: true },
        fileSize: { type: Number, required: true, min: 0 },
        uploadedAt: { type: Date, required: true },
        uploadedBy: { type: String, required: true },
        verified: { type: Boolean, required: true, default: false },
        verifiedAt: { type: Date },
        verifiedBy: { type: String, trim: true },
      },
    ],
    committeeAssignments: [
      {
        committeeId: { type: String, required: true, trim: true, index: true },
        committeeName: { type: String, required: true, trim: true },
        role: { type: String, required: true, enum: ['CHAIR', 'MEMBER', 'SECRETARY', 'COORDINATOR'] },
        startDate: { type: Date, required: true },
        endDate: { type: Date },
        status: { type: String, required: true, enum: ['ACTIVE', 'COMPLETED', 'CANCELLED'], default: 'ACTIVE' },
        remarks: { type: String, trim: true, maxlength: 500 },
      },
    ],
    status: { type: String, required: true, enum: ['ACTIVE', 'INACTIVE', 'ARCHIVED'], default: 'ACTIVE', index: true },
    tags: [{ type: String, trim: true, index: true }],
    remarks: { type: String, trim: true },
    createdBy: { type: String, required: true },
    updatedBy: { type: String, required: true },
    deletedAt: { type: Date, index: true },
    deletedBy: { type: String },
  },
  {
    timestamps: true,
    versionKey: false,
    toJSON: {
      transform: (_doc, ret: Record<string, unknown>) => {
        ret.id = ret._id;
        delete ret._id;
        delete ret.aadharNumber;
        delete ret.panNumber;
        return ret;
      },
    },
  },
);

facultySchema.index({ departmentId: 1, isHOD: 1 });
facultySchema.index({ departmentId: 1, isActive: 1, status: 1 });
facultySchema.index({ hodDepartmentId: 1, isActive: 1 });
facultySchema.index({ designation: 1, isActive: 1 });
facultySchema.index({ employmentStatus: 1, isActive: 1 });
facultySchema.index({ createdAt: -1 });
facultySchema.index({ 'committeeAssignments.committeeId': 1 });
facultySchema.index({ 'committeeAssignments.status': 1 });
facultySchema.index({ 'committeeAssignments.startDate': 1, 'committeeAssignments.endDate': 1 });
facultySchema.index({ firstName: 'text', lastName: 'text', displayName: 'text', email: 'text', officialEmail: 'text', specializations: 'text', skills: 'text' });
facultySchema.index({ deletedAt: 1 });
facultySchema.index({ isActive: 1, status: 1 });
facultySchema.index({ userId: 1 });
facultySchema.index({ employmentStatus: 1, deletedAt: 1 });

export const FacultyModel: Model<FacultySchemaType> = model<FacultySchemaType>('Faculty', facultySchema);
