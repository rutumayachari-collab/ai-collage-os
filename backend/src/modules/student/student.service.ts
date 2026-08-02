import { ConflictError, NotFoundError } from '../../shared/utils/api-error.util';
import { studentRepository } from './student.repository';
import type { StudentDocument } from './student.model';
import type { StudentProfileCompletion, StudentCurrentAddress, StudentPreviousQualification } from './student.types';
import type { CreateStudentInput } from './student.validator';

const PROFILE_COMPLETION_WEIGHTS = {
  personalInfo: 25,
  contactInfo: 25,
  academicInfo: 25,
  guardianInfo: 15,
  documents: 10,
} as const;

export class StudentService {
  public async create(input: {
    userId: string;
    studentId: string;
    rollNumber: string;
    firstName: string;
    lastName: string;
    dateOfBirth: Date;
    gender: string;
    nationality: string;
    email: string;
    phone: string;
    address: {
      street: string;
      city: string;
      state: string;
      country: string;
      postalCode: string;
    };
    emergencyContact: {
      name: string;
      relation: string;
      phone: string;
      email?: string;
    };
    departmentId: string;
    courseId: string;
    batch: string;
    academicYear: string;
    semester: number;
    admissionNumber: string;
    admissionDate: Date;
    admissionType: string;
    guardianName: string;
    guardianRelation: string;
    guardianPhone: string;
    createdBy: string;
    [key: string]: unknown;
  }): Promise<StudentDocument> {
    const existing = await studentRepository.findByEmail(input.email);
    if (existing) {
      throw new ConflictError('A student with this email already exists');
    }

    const existingPhone = await studentRepository.findByPhone(input.phone);
    if (existingPhone) {
      throw new ConflictError('A student with this phone number already exists');
    }

    const existingStudentId = await studentRepository.findByStudentId(input.studentId);
    if (existingStudentId) {
      throw new ConflictError('A student with this student ID already exists');
    }

    const existingAdmissionNumber = await studentRepository.findByAdmissionNumber(input.admissionNumber);
    if (existingAdmissionNumber) {
      throw new ConflictError('A student with this admission number already exists');
    }

    const existingRollNumber = await studentRepository.findByRollNumber(
      input.rollNumber,
      input.departmentId,
      input.batch,
      input.semester,
      (input.section as string | undefined) || undefined,
    );
    if (existingRollNumber) {
      throw new ConflictError('A student with this roll number already exists in this class');
    }

    const profileCompletion = this.calculateProfileCompletion({
      personalInfo: true,
      contactInfo: true,
      academicInfo: true,
      guardianInfo: true,
      documents: false,
    });

    return studentRepository.create({
      ...input,
      section: (input.section as string | undefined) || undefined,
      bloodGroup: (input.bloodGroup as string | undefined) || undefined,
      alternatePhone: (input.alternatePhone as string | undefined) || undefined,
      currentAddress: input.currentAddress as StudentCurrentAddress | undefined,
      religion: (input.religion as string | undefined) || undefined,
      category: (input.category as string | undefined) || undefined,
      aadharNumber: (input.aadharNumber as string | undefined) || undefined,
      photo: (input.photo as string | undefined) || undefined,
      signature: (input.signature as string | undefined) || undefined,
      quota: (input.quota as string | undefined) || undefined,
      previousQualification: input.previousQualification as StudentPreviousQualification | undefined,
      parentId: (input.parentId as string | undefined) || undefined,
      guardianEmail: (input.guardianEmail as string | undefined) || undefined,
      guardianOccupation: (input.guardianOccupation as string | undefined) || undefined,
      guardianIncome: (input.guardianIncome as number | undefined) || undefined,
      status: 'ACTIVE',
      isActive: true,
      isVerified: false,
      remarks: (input.remarks as string | undefined) || undefined,
      tags: (input.tags as string[] | undefined) || [],
      documents: [],
      profileCompletion,
      createdBy: input.createdBy,
      updatedBy: input.createdBy,
    });
  }

  public async findById(id: string): Promise<StudentDocument | null> {
    return studentRepository.findById(id);
  }

  public async findMany(query: {
    page: number;
    limit: number;
    sort?: string;
    order?: 'asc' | 'desc';
    search?: string;
    departmentId?: string;
    courseId?: string;
    batch?: string;
    academicYear?: string;
    semester?: number;
    section?: string;
    status?: string;
    gender?: string;
    isActive?: boolean;
    isVerified?: boolean;
  }): Promise<{ items: StudentDocument[]; total: number }> {
    const filter: Record<string, unknown> = { deletedAt: { $exists: false } };

    if (query.search) {
      filter.$text = { $search: query.search };
    }

    if (query.departmentId) filter.departmentId = query.departmentId;
    if (query.courseId) filter.courseId = query.courseId;
    if (query.batch) filter.batch = query.batch;
    if (query.academicYear) filter.academicYear = query.academicYear;
    if (query.semester) filter.semester = query.semester;
    if (query.section) filter.section = query.section;
    if (query.status) filter.status = query.status;
    if (query.gender) filter.gender = query.gender;
    if (query.isActive !== undefined) filter.isActive = query.isActive;
    if (query.isVerified !== undefined) filter.isVerified = query.isVerified;

    const sortOption: Record<string, 1 | -1> = {};
    if (query.sort) {
      sortOption[query.sort] = query.order === 'asc' ? 1 : -1;
    } else {
      sortOption.createdAt = -1;
    }

    const { items, total } = await studentRepository.paginate(filter, query.page, query.limit, sortOption);

    return { items, total };
  }

  public async update(id: string, input: Record<string, unknown>, updatedBy: string): Promise<StudentDocument | null> {
    const student = await studentRepository.findById(id);
    if (!student) {
      throw new NotFoundError('Student not found');
    }

    if (input.email && input.email !== student.email) {
      const existing = await studentRepository.findByEmail(input.email as string);
      if (existing && existing.id !== id) {
        throw new ConflictError('A student with this email already exists');
      }
    }

    if (input.phone && input.phone !== student.phone) {
      const existing = await studentRepository.findByPhone(input.phone as string);
      if (existing && existing.id !== id) {
        throw new ConflictError('A student with this phone number already exists');
      }
    }

    const updated = await studentRepository.updateById(id, {
      ...input,
      updatedBy,
      updatedAt: new Date(),
    });

    if (updated) {
      const completion = this.calculateProfileCompletion(this.getProfileStatus(updated));
      await studentRepository.updateProfileCompletion(updated.id as string, completion);
      if (completion === 100 && !updated.profileCompletedAt) {
        await studentRepository.updateById(updated.id as string, { profileCompletedAt: new Date() });
      }
    }

    return updated;
  }

  public async softDelete(id: string, deletedBy: string): Promise<void> {
    const existing = await studentRepository.findById(id);
    if (!existing) {
      throw new NotFoundError('Student not found');
    }
    await studentRepository.softDelete(id, deletedBy);
  }

  public async restore(id: string): Promise<StudentDocument | null> {
    const existing = await studentRepository.findById(id);
    if (!existing) {
      throw new NotFoundError('Student not found');
    }
    return studentRepository.restore(id);
  }

  public async getProfile(userId: string): Promise<StudentDocument | null> {
    return studentRepository.findByUserId(userId);
  }

  public async updateProfile(userId: string, input: Record<string, unknown>, updatedBy: string): Promise<StudentDocument | null> {
    const student = await studentRepository.findByUserId(userId);
    if (!student) {
      throw new NotFoundError('Student profile not found');
    }

    const allowedFields = [
      'firstName', 'lastName', 'dateOfBirth', 'gender', 'bloodGroup', 'nationality', 'religion', 'category',
      'photo', 'signature', 'phone', 'alternatePhone', 'address', 'currentAddress', 'emergencyContact',
      'guardianName', 'guardianRelation', 'guardianPhone', 'guardianEmail', 'guardianOccupation', 'guardianIncome',
    ];

    const filteredInput: Record<string, unknown> = {};
    for (const key of allowedFields) {
      if (input[key] !== undefined) {
        filteredInput[key] = input[key];
      }
    }

    const updated = await studentRepository.updateById(student.id as string, {
      ...filteredInput,
      updatedBy,
      updatedAt: new Date(),
    });

    if (updated) {
      const completion = this.calculateProfileCompletion(this.getProfileStatus(updated));
      await studentRepository.updateProfileCompletion(updated.id as string, completion);
      if (completion === 100 && !updated.profileCompletedAt) {
        await studentRepository.updateById(updated.id as string, { profileCompletedAt: new Date() });
      }
    }

    return updated;
  }

  public async uploadDocument(userId: string, document: { name: string; type: string; url: string; fileSize: number }, uploadedBy: string): Promise<StudentDocument | null> {
    const student = await studentRepository.findByUserId(userId);
    if (!student) {
      throw new NotFoundError('Student profile not found');
    }

    const documents = [...student.documents, { ...document, uploadedAt: new Date(), uploadedBy }];
    const updated = await studentRepository.updateById(student.id as string, {
      documents,
      updatedBy: uploadedBy,
      updatedAt: new Date(),
    });

    if (updated) {
      const completion = this.calculateProfileCompletion(this.getProfileStatus(updated));
      await studentRepository.updateProfileCompletion(updated.id as string, completion);
      if (completion === 100 && !updated.profileCompletedAt) {
        await studentRepository.updateById(updated.id as string, { profileCompletedAt: new Date() });
      }
    }

    return updated;
  }

  public async linkParent(studentId: string, parentId: string, updatedBy: string): Promise<StudentDocument | null> {
    const student = await studentRepository.findById(studentId);
    if (!student) {
      throw new NotFoundError('Student not found');
    }
    return studentRepository.updateById(studentId, { parentId, updatedBy, updatedAt: new Date() });
  }

  public async unlinkParent(studentId: string, updatedBy: string): Promise<StudentDocument | null> {
    const student = await studentRepository.findById(studentId);
    if (!student) {
      throw new NotFoundError('Student not found');
    }
    return studentRepository.updateById(studentId, { parentId: undefined, updatedBy, updatedAt: new Date() });
  }

  public async bulkImport(students: CreateStudentInput[], createdBy: string): Promise<{ created: number; failed: number; errors: string[] }> {
    let created = 0;
    let failed = 0;
    const errors: string[] = [];

    for (const studentData of students) {
      try {
        await this.create({ ...studentData, createdBy });
        created++;
      } catch (error) {
        failed++;
        errors.push(`${studentData.studentId || 'unknown'}: ${(error as Error).message}`);
      }
    }

    return { created, failed, errors };
  }

  public async bulkUpdate(ids: string[], updates: Record<string, unknown>, updatedBy: string): Promise<{ updated: number; failed: number }> {
    let updated = 0;
    let failed = 0;

    for (const id of ids) {
      try {
        const result = await studentRepository.updateById(id, { ...updates, updatedBy, updatedAt: new Date() });
        if (result) {
          updated++;
        } else {
          failed++;
        }
      } catch {
        failed++;
      }
    }

    return { updated, failed };
  }

  public async bulkDelete(ids: string[], deletedBy: string): Promise<{ deleted: number; failed: number }> {
    let deleted = 0;
    let failed = 0;

    for (const id of ids) {
      try {
        const result = await studentRepository.softDelete(id, deletedBy);
        if (result) {
          deleted++;
        } else {
          failed++;
        }
      } catch {
        failed++;
      }
    }

    return { deleted, failed };
  }

  private getProfileStatus(student: StudentDocument): StudentProfileCompletion {
    return {
      personalInfo: Boolean(student.firstName && student.lastName && student.dateOfBirth && student.gender && student.nationality),
      contactInfo: Boolean(student.email && student.phone && student.address?.street && student.emergencyContact?.name),
      academicInfo: Boolean(student.departmentId && student.courseId && student.batch && student.admissionNumber && student.admissionDate),
      guardianInfo: Boolean(student.guardianName && student.guardianRelation && student.guardianPhone),
      documents: student.documents.length > 0,
    };
  }

  private calculateProfileCompletion(completion: StudentProfileCompletion): number {
    let total = 0;
    total += completion.personalInfo ? PROFILE_COMPLETION_WEIGHTS.personalInfo : 0;
    total += completion.contactInfo ? PROFILE_COMPLETION_WEIGHTS.contactInfo : 0;
    total += completion.academicInfo ? PROFILE_COMPLETION_WEIGHTS.academicInfo : 0;
    total += completion.guardianInfo ? PROFILE_COMPLETION_WEIGHTS.guardianInfo : 0;
    total += completion.documents ? PROFILE_COMPLETION_WEIGHTS.documents : 0;
    return Math.min(100, total);
  }
}

export const studentService = new StudentService();
