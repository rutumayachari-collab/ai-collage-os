import { ConflictError, NotFoundError, BadRequestError } from '../../shared/utils/api-error.util';
import { examRepository } from './exam.repository';
import type { ExamDocument, ExamSchemaType } from './exam.model';
import type { CreateExamInput, UpdateExamInput, ExamQueryInput, BulkPublishResultInput } from './exam.validator';

export class ExamService {
  public async createExam(input: CreateExamInput, createdBy: string): Promise<ExamDocument> {
    const normalizedExamId = input.examId.trim().toUpperCase();
    const normalizedCode = input.code.trim().toUpperCase();
    const normalizedName = input.name.trim();

    if (await examRepository.existsByExamId(normalizedExamId)) {
      throw new ConflictError('An exam with this exam ID already exists');
    }

    if (await examRepository.existsByCode(normalizedCode)) {
      throw new ConflictError('An exam with this code already exists');
    }

    const cleanedInput = this.cleanEmptyStrings(input);

    return examRepository.create({
      ...cleanedInput,
      examId: normalizedExamId,
      code: normalizedCode,
      name: normalizedName,
      status: input.status || 'SCHEDULED',
      isActive: input.isActive ?? true,
      createdBy,
      updatedBy: createdBy,
    });
  }

  public async updateExam(id: string, input: UpdateExamInput, updatedBy: string): Promise<ExamDocument | null> {
    const exam = await examRepository.findById(id);
    if (!exam) {
      throw new NotFoundError('Exam not found');
    }

    if (exam.deletedAt) {
      throw new BadRequestError('Cannot update a deleted exam');
    }

    const cleanedInput = this.cleanEmptyStrings(input);

    const updated = await examRepository.updateById(id, {
      ...cleanedInput,
      updatedBy,
      updatedAt: new Date(),
    });

    return updated;
  }

  public async getExam(id: string): Promise<ExamDocument | null> {
    return examRepository.findById(id);
  }

  public async getExamByExamId(examId: string): Promise<ExamDocument | null> {
    return examRepository.findByExamId(examId);
  }

  public async getExamByCode(code: string): Promise<ExamDocument | null> {
    return examRepository.findByCode(code);
  }

  public async deleteExam(id: string, deletedBy: string): Promise<void> {
    const exam = await examRepository.findById(id);
    if (!exam) {
      throw new NotFoundError('Exam not found');
    }

    if (exam.deletedAt) {
      throw new BadRequestError('Exam is already deleted');
    }

    if (exam.status === 'ONGOING') {
      throw new BadRequestError('Cannot delete an exam that is ongoing');
    }

    await examRepository.softDelete(id, deletedBy);
  }

  public async listExams(query: ExamQueryInput): Promise<{ items: ExamDocument[]; total: number }> {
    const filter: Record<string, unknown> = {};

    if (query.search) {
      filter.$text = { $search: query.search };
    }

    if (query.courseId) filter.courseId = query.courseId;
    if (query.subjectId) filter.subjectId = query.subjectId;
    if (query.semester) filter.semester = query.semester;
    if (query.academicYear) filter.academicYear = query.academicYear;
    if (query.examType) filter.examType = query.examType;
    if (query.status) filter.status = query.status;
    if (query.isActive !== undefined) filter.isActive = query.isActive;

    const sortOption: Record<string, 1 | -1> = {};
    if (query.sort) {
      sortOption[query.sort] = query.order === 'asc' ? 1 : -1;
    } else {
      sortOption.createdAt = -1;
    }

    return examRepository.listExams(filter, query.page, query.limit, sortOption);
  }

  public async searchExams(searchQuery: string, page = 1, limit = 20): Promise<{ items: ExamDocument[]; total: number }> {
    return examRepository.searchExams(searchQuery, page, limit);
  }

  public async filterExams(filters: Record<string, unknown>, page = 1, limit = 20, sort: Record<string, 1 | -1> = { createdAt: -1 }): Promise<{ items: ExamDocument[]; total: number }> {
    return examRepository.filterExams(filters, page, limit, sort);
  }

  public async registerForExam(examId: string, studentId: string): Promise<ExamDocument | null> {
    const exam = await examRepository.findById(examId);
    if (!exam) {
      throw new NotFoundError('Exam not found');
    }

    if (exam.status === 'CANCELLED') {
      throw new BadRequestError('Cannot register for a cancelled exam');
    }

    if (exam.status === 'RESULTS_PUBLISHED') {
      throw new BadRequestError('Cannot register for an exam that has published results');
    }

    const existingRegistration = exam.registrations.find(r => r.studentId === studentId);
    if (existingRegistration) {
      throw new BadRequestError('Student is already registered for this exam');
    }

    const registration: ExamSchemaType['registrations'][0] = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
      studentId,
      status: 'REGISTERED',
      registeredAt: new Date(),
    };

    return examRepository.addRegistration(examId, registration);
  }

  public async publishResult(examId: string, studentId: string, marksObtained: number, grade: string, remarks: string): Promise<ExamDocument | null> {
    const exam = await examRepository.findById(examId);
    if (!exam) {
      throw new NotFoundError('Exam not found');
    }

    if (exam.status === 'CANCELLED') {
      throw new BadRequestError('Cannot publish results for a cancelled exam');
    }

    const isPassed = marksObtained >= exam.passingMarks;

    const result: ExamSchemaType['results'][0] = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
      studentId,
      marksObtained,
      grade,
      isPassed,
      remarks: remarks || '',
      publishedAt: new Date(),
    };

    const updatedExam = await examRepository.addResult(examId, result);
    if (updatedExam) {
      await this.updateExamStatus(examId, 'RESULTS_PUBLISHED');
    }

    return updatedExam;
  }

  public async updateResult(examId: string, resultId: string, updates: Partial<ExamSchemaType['results'][0]>): Promise<ExamDocument | null> {
    const exam = await examRepository.findById(examId);
    if (!exam) {
      throw new NotFoundError('Exam not found');
    }

    const result = exam.results.find(r => r.id === resultId);
    if (!result) {
      throw new NotFoundError('Result not found');
    }

    const isPassed = updates.marksObtained !== undefined ? updates.marksObtained >= exam.passingMarks : result.isPassed;

    const updatedResult: Partial<ExamSchemaType['results'][0]> = {
      ...updates,
      isPassed,
    };

    return examRepository.updateResult(examId, resultId, updatedResult);
  }

  public async bulkPublishResults(examId: string, input: BulkPublishResultInput): Promise<{ published: number; failed: number }> {
    const exam = await examRepository.findById(examId);
    if (!exam) {
      throw new NotFoundError('Exam not found');
    }

    if (exam.status === 'CANCELLED') {
      throw new BadRequestError('Cannot publish results for a cancelled exam');
    }

    let published = 0;
    let failed = 0;

    for (const resultInput of input.results) {
      try {
        const existingResult = exam.results.find(r => r.studentId === resultInput.studentId);
        if (existingResult) {
          await this.updateResult(examId, existingResult.id, resultInput);
        } else {
          const result: ExamSchemaType['results'][0] = {
            id: `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
            studentId: resultInput.studentId,
            marksObtained: resultInput.marksObtained,
            grade: resultInput.grade,
            isPassed: resultInput.marksObtained >= exam.passingMarks,
            remarks: resultInput.remarks || '',
            publishedAt: new Date(),
          };
          await examRepository.addResult(examId, result);
        }
        published++;
      } catch {
        failed++;
      }
    }

    if (published > 0) {
      await this.updateExamStatus(examId, 'RESULTS_PUBLISHED');
    }

    return { published, failed };
  }

  public async updateExamStatus(examId: string, status: ExamSchemaType['status']): Promise<ExamDocument | null> {
    const exam = await examRepository.findById(examId);
    if (!exam) {
      throw new NotFoundError('Exam not found');
    }

    if (exam.deletedAt) {
      throw new BadRequestError('Cannot update a deleted exam');
    }

    return examRepository.updateById(examId, {
      status,
      updatedAt: new Date(),
    });
  }

  public async getExamStatistics(examId: string): Promise<{ exam: ExamDocument; statistics: Record<string, unknown> } | null> {
    const exam = await examRepository.findById(examId);
    if (!exam) {
      return null;
    }

    const totalRegistrations = exam.registrations.length;
    const attended = exam.registrations.filter(r => r.status === 'ATTENDED').length;
    const absent = exam.registrations.filter(r => r.status === 'ABSENT').length;
    const withdrawn = exam.registrations.filter(r => r.status === 'WITHDRAWN').length;
    const resultsPublished = exam.results.length;
    const passed = exam.results.filter(r => r.isPassed).length;
    const failed = exam.results.filter(r => !r.isPassed).length;
    const averageMarks = resultsPublished > 0 ? exam.results.reduce((sum, r) => sum + r.marksObtained, 0) / resultsPublished : 0;
    const passRate = resultsPublished > 0 ? (passed / resultsPublished) * 100 : 0;

    const statistics = {
      totalRegistrations,
      attended,
      absent,
      withdrawn,
      resultsPublished,
      passed,
      failed,
      averageMarks: Math.round(averageMarks),
      passRate: Math.round(passRate),
    };

    return { exam, statistics };
  }

  public async restoreExam(id: string): Promise<ExamDocument | null> {
    const exam = await examRepository.findById(id);
    if (!exam) {
      throw new NotFoundError('Exam not found');
    }

    if (!exam.deletedAt) {
      throw new BadRequestError('Exam is not deleted');
    }

    return examRepository.restore(id);
  }

  public async bulkCreateExams(input: CreateExamInput[], createdBy: string): Promise<{ created: number; failed: number; errors: string[] }> {
    let created = 0;
    let failed = 0;
    const errors: string[] = [];

    for (const examData of input) {
      try {
        await this.createExam(examData, createdBy);
        created++;
      } catch (error) {
        failed++;
        errors.push(`${examData.examId || 'unknown'}: ${(error as Error).message}`);
      }
    }

    return { created, failed, errors };
  }

  public async bulkUpdateExams(ids: string[], updates: UpdateExamInput, updatedBy: string): Promise<{ updated: number; failed: number }> {
    let updated = 0;
    let failed = 0;

    for (const id of ids) {
      try {
        const result = await this.updateExam(id, updates, updatedBy);
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

  private cleanEmptyStrings(obj: Record<string, unknown>): Record<string, unknown> {
    const cleaned: Record<string, unknown> = {};
    for (const key of Object.keys(obj)) {
      const value = obj[key];
      if (value === '' || value === null || value === undefined) {
        continue;
      }
      if (value instanceof Date) {
        cleaned[key] = value;
        continue;
      }
      if (Array.isArray(value)) {
        cleaned[key] = value.map((item) => (typeof item === 'object' && item !== null && !(item instanceof Date) ? this.cleanEmptyStrings(item as Record<string, unknown>) : item));
      } else if (typeof value === 'object' && value !== null && !(value instanceof Date)) {
        cleaned[key] = this.cleanEmptyStrings(value as Record<string, unknown>);
      } else {
        cleaned[key] = value;
      }
    }
    return cleaned;
  }
}

export const examService = new ExamService();
