import { BaseRepository } from '../../shared/repositories/base.repository';
import { CourseModel, type CourseDocument, type CourseSchemaType } from './course.model';

export class CourseRepository extends BaseRepository<CourseSchemaType> {
  constructor() {
    super(CourseModel);
  }

  public async findByCourseId(courseId: string): Promise<CourseDocument | null> {
    return this.model.findOne({ courseId, deletedAt: { $exists: false } }).exec();
  }

  public async findByCode(code: string): Promise<CourseDocument | null> {
    return this.model.findOne({ code: code.toUpperCase(), deletedAt: { $exists: false } }).exec();
  }

  public async findByName(name: string): Promise<CourseDocument | null> {
    return this.model.findOne({ name: name.trim(), deletedAt: { $exists: false } }).exec();
  }

  public async findByCoordinator(coordinatorId: string): Promise<CourseDocument | null> {
    return this.model.findOne({
      $or: [
        { primaryCoordinatorId: coordinatorId },
        { coCoordinatorIds: coordinatorId },
      ],
      deletedAt: { $exists: false },
    }).exec();
  }

  public async findByDepartment(departmentId: string): Promise<CourseDocument[]> {
    return this.model.find({ primaryDepartmentId: departmentId, deletedAt: { $exists: false } }).exec();
  }

  public async listCourses(filter: Record<string, unknown> = {}, page = 1, limit = 20, sort: Record<string, 1 | -1> = { createdAt: -1 }): Promise<{ items: CourseDocument[]; total: number }> {
    const query = { ...filter, deletedAt: { $exists: false } };
    return this.paginate(query, page, limit, sort);
  }

  public async searchCourses(searchQuery: string, page = 1, limit = 20): Promise<{ items: CourseDocument[]; total: number }> {
    const filter = { $text: { $search: searchQuery }, deletedAt: { $exists: false } };
    const sort = { score: { $meta: 'textScore' } };
    const [items, total] = await Promise.all([
      this.model.find(filter).sort(sort as unknown as Record<string, 1 | -1>).skip((page - 1) * limit).limit(limit).exec(),
      this.model.countDocuments(filter).exec(),
    ]);
    return { items, total };
  }

  public async filterCourses(filters: Record<string, unknown>, page = 1, limit = 20, sort: Record<string, 1 | -1> = { createdAt: -1 }): Promise<{ items: CourseDocument[]; total: number }> {
    const query: Record<string, unknown> = { deletedAt: { $exists: false } };

    if (filters.status) query.status = filters.status;
    if (filters.isActive !== undefined) query.isActive = filters.isActive;
    if (filters.departmentId) query.primaryDepartmentId = filters.departmentId;
    if (filters.programType) query.programType = filters.programType;
    if (filters.degree) query.degree = filters.degree;
    if (filters.coordinatorId) query.primaryCoordinatorId = filters.coordinatorId;
    if (filters.tags && Array.isArray(filters.tags)) query.tags = { $in: filters.tags };

    if (filters.intakeCapacityFrom || filters.intakeCapacityTo) {
      query.intakeCapacity = {};
      if (filters.intakeCapacityFrom) (query.intakeCapacity as Record<string, unknown>).$gte = filters.intakeCapacityFrom;
      if (filters.intakeCapacityTo) (query.intakeCapacity as Record<string, unknown>).$lte = filters.intakeCapacityTo;
    }

    if (filters.durationYears) query.durationYears = filters.durationYears;

    return this.paginate(query, page, limit, sort);
  }

  public async courseStatistics(courseId: string): Promise<CourseDocument | null> {
    return this.model.findOne({ _id: courseId, deletedAt: { $exists: false } }).exec();
  }

  public async archiveCourse(courseId: string, archivedBy: string): Promise<CourseDocument | null> {
    const result = await this.model.findByIdAndUpdate(
      courseId,
      { $set: { status: 'ARCHIVED', isActive: false, updatedBy: archivedBy, updatedAt: new Date() } },
      { new: true, runValidators: true },
    ).exec();
    return result;
  }

  public async restoreArchivedCourse(courseId: string, restoredBy: string): Promise<CourseDocument | null> {
    const result = await this.model.findByIdAndUpdate(
      courseId,
      { $set: { status: 'ACTIVE', isActive: true, updatedBy: restoredBy, updatedAt: new Date() } },
      { new: true, runValidators: true },
    ).exec();
    return result;
  }

  public async updateCurriculum(courseId: string, newVersion: string, historyRecord: CourseSchemaType['curriculumHistory'][0]): Promise<CourseDocument | null> {
    const result = await this.model.findByIdAndUpdate(
      courseId,
      { $set: { curriculumVersion: newVersion, updatedAt: new Date() }, $push: { curriculumHistory: historyRecord } },
      { new: true, runValidators: true },
    ).exec();
    return result;
  }

  public async updateSemesterStructure(courseId: string, semesters: CourseSchemaType['semesters']): Promise<CourseDocument | null> {
    const result = await this.model.findByIdAndUpdate(
      courseId,
      { $set: { semesters, updatedAt: new Date() } },
      { new: true, runValidators: true },
    ).exec();
    return result;
  }

  public async getCurriculumHistory(courseId: string): Promise<CourseSchemaType['curriculumHistory']> {
    const course = await this.model.findOne({ _id: courseId, deletedAt: { $exists: false } }, { curriculumHistory: 1 }).exec();
    return course?.curriculumHistory || [];
  }

  public async bulkCreate(courses: Partial<CourseSchemaType>[]): Promise<CourseDocument[]> {
    return this.model.insertMany(courses, { ordered: true }) as Promise<CourseDocument[]>;
  }

  public async bulkUpdate(ids: string[], updates: Partial<CourseSchemaType>, updatedBy: string): Promise<{ modifiedCount: number }> {
    const result = await this.model.updateMany(
      { _id: { $in: ids } },
      { $set: { ...updates, updatedBy, updatedAt: new Date() } },
    ).exec();
    return { modifiedCount: result.modifiedCount };
  }

  public async softDelete(courseId: string, deletedBy: string): Promise<boolean> {
    const result = await this.model.updateOne({ _id: courseId }, { $set: { deletedAt: new Date(), deletedBy } }).exec();
    return result.modifiedCount > 0;
  }

  public async restore(courseId: string): Promise<CourseDocument | null> {
    const result = await this.model.updateOne({ _id: courseId }, { $unset: { deletedAt: '', deletedBy: '' } }).exec();
    if (result.modifiedCount > 0) {
      return this.model.findById(courseId).exec();
    }
    return null;
  }

  public async existsByCourseId(courseId: string): Promise<boolean> {
    return this.exists({ courseId, deletedAt: { $exists: false } });
  }

  public async existsByCode(code: string): Promise<boolean> {
    return this.exists({ code: code.toUpperCase(), deletedAt: { $exists: false } });
  }

  public async existsByName(name: string): Promise<boolean> {
    return this.exists({ name: name.trim(), deletedAt: { $exists: false } });
  }

  public async existsByEmail(email: string): Promise<boolean> {
    return this.exists({ email: email.toLowerCase(), deletedAt: { $exists: false } });
  }

  public async existsByPhone(phone: string): Promise<boolean> {
    return this.exists({ phone, deletedAt: { $exists: false } });
  }

  public async findByEmail(email: string): Promise<CourseDocument | null> {
    return this.model.findOne({ email: email.toLowerCase(), deletedAt: { $exists: false } }).exec();
  }

  public async findByPhone(phone: string): Promise<CourseDocument | null> {
    return this.model.findOne({ phone, deletedAt: { $exists: false } }).exec();
  }

  public async countStudents(courseId: string): Promise<number> {
    return this.count({ courseId });
  }

  public async countSubjects(courseId: string): Promise<number> {
    return this.count({ courseId });
  }

  public async countFaculty(courseId: string): Promise<number> {
    return this.count({ courseId });
  }

  public async countActiveTimetables(courseId: string): Promise<number> {
    return this.count({ courseId });
  }

  public async countCompletedCredits(courseId: string): Promise<number> {
    return this.count({ courseId });
  }

  public async isCourseInUse(courseId: string): Promise<boolean> {
    const [studentCount, subjectCount] = await Promise.all([
      this.countStudents(courseId),
      this.countSubjects(courseId),
    ]);
    return studentCount > 0 || subjectCount > 0;
  }
}

export const courseRepository = new CourseRepository();
