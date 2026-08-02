import { BaseRepository } from '../../shared/repositories/base.repository';
import { SubjectModel, type SubjectDocument, type SubjectSchemaType } from './subject.model';

export class SubjectRepository extends BaseRepository<SubjectSchemaType> {
  constructor() {
    super(SubjectModel);
  }

  // ─── Lookup ────────────────────────────────────────────────────────────────

  public async findBySubjectId(subjectId: string): Promise<SubjectDocument | null> {
    return this.model.findOne({ subjectId, deletedAt: { $exists: false } }).exec();
  }

  public async findByCode(code: string): Promise<SubjectDocument | null> {
    return this.model.findOne({ code: code.toUpperCase(), deletedAt: { $exists: false } }).exec();
  }

  public async findByName(name: string, courseId?: string): Promise<SubjectDocument | null> {
    const query: Record<string, unknown> = { name: name.trim(), deletedAt: { $exists: false } };
    if (courseId) query.courseId = courseId;
    return this.model.findOne(query).exec();
  }

  public async findByCourse(courseId: string): Promise<SubjectDocument[]> {
    return this.model.find({ courseId, deletedAt: { $exists: false } }).exec();
  }

  public async findByDepartment(departmentId: string): Promise<SubjectDocument[]> {
    return this.model.find({ departmentId, deletedAt: { $exists: false } }).exec();
  }

  public async findBySemester(courseId: string, semester: number): Promise<SubjectDocument[]> {
    return this.model.find({ courseId, semester, deletedAt: { $exists: false } }).exec();
  }

  public async findByFaculty(facultyId: string): Promise<SubjectDocument[]> {
    return this.model.find({
      $or: [{ primaryFacultyId: facultyId }, { coFacultyIds: facultyId }],
      deletedAt: { $exists: false },
    }).exec();
  }

  public async findByOutcome(coId: string): Promise<SubjectDocument[]> {
    return this.model.find({
      'outcomeMapping.courseOutcomes.id': coId,
      deletedAt: { $exists: false },
    }).exec();
  }

  public async findByVersion(version: string): Promise<SubjectDocument | null> {
    return this.model.findOne({
      'versionHistory.version': version,
      deletedAt: { $exists: false },
    }).exec();
  }

  public async findByDocument(documentId: string): Promise<SubjectDocument | null> {
    return this.model.findOne({
      'documents.id': documentId,
      deletedAt: { $exists: false },
    }).exec();
  }

  public async findByLearningResource(resourceId: string): Promise<SubjectDocument | null> {
    return this.model.findOne({
      'learningResources.id': resourceId,
      deletedAt: { $exists: false },
    }).exec();
  }

  // ─── Search / Filter ───────────────────────────────────────────────────────

  public async listSubjects(filter: Record<string, unknown> = {}, page = 1, limit = 20, sort: Record<string, 1 | -1> = { createdAt: -1 }): Promise<{ items: SubjectDocument[]; total: number }> {
    const query = { ...filter, deletedAt: { $exists: false } };
    return this.paginate(query, page, limit, sort);
  }

  public async searchSubjects(searchQuery: string, page = 1, limit = 20): Promise<{ items: SubjectDocument[]; total: number }> {
    const filter = { $text: { $search: searchQuery }, deletedAt: { $exists: false } };
    const sort = { score: { $meta: 'textScore' } };
    const [items, total] = await Promise.all([
      this.model.find(filter).sort(sort as unknown as Record<string, 1 | -1>).skip((page - 1) * limit).limit(limit).exec(),
      this.model.countDocuments(filter).exec(),
    ]);
    return { items, total };
  }

  public async filterSubjects(filters: Record<string, unknown>, page = 1, limit = 20, sort: Record<string, 1 | -1> = { createdAt: -1 }): Promise<{ items: SubjectDocument[]; total: number }> {
    const query: Record<string, unknown> = { deletedAt: { $exists: false } };

    if (filters.courseId) query.courseId = filters.courseId;
    if (filters.departmentId) query.departmentId = filters.departmentId;
    if (filters.semester) query.semester = filters.semester;
    if (filters.academicYear) query.academicYear = filters.academicYear;
    if (filters.regulationYear) query.regulationYear = filters.regulationYear;
    if (filters.subjectType) query.subjectType = filters.subjectType;
    if (filters.category) query.category = filters.category;
    if (filters.isActive !== undefined) query.isActive = filters.isActive;
    if (filters.status) query.status = filters.status;
    if (filters.primaryFacultyId) query.primaryFacultyId = filters.primaryFacultyId;
    if (filters.predictedDifficulty) query.predictedDifficulty = filters.predictedDifficulty;
    if (filters.difficultyTrend) query.difficultyTrend = filters.difficultyTrend;

    if (filters.hasPrerequisites === true) {
      query.prerequisiteSubjectIds = { $exists: true, $ne: [] };
    } else if (filters.hasPrerequisites === false) {
      query.$or = [{ prerequisiteSubjectIds: { $exists: false } }, { prerequisiteSubjectIds: [] }];
    }

    if (filters.outcomeMapped === true) {
      query['outcomeMapping.courseOutcomes.0'] = { $exists: true };
    } else if (filters.outcomeMapped === false) {
      query['outcomeMapping.courseOutcomes.0'] = { $exists: false };
    }

    if (filters.hasDocuments === true) {
      query['documents.0'] = { $exists: true };
    } else if (filters.hasDocuments === false) {
      query['documents.0'] = { $exists: false };
    }

    if (filters.hasLearningResources === true) {
      query['learningResources.0'] = { $exists: true };
    } else if (filters.hasLearningResources === false) {
      query['learningResources.0'] = { $exists: false };
    }

    return this.paginate(query, page, limit, sort);
  }

  // ─── Faculty Management ────────────────────────────────────────────────────

  public async assignPrimaryFaculty(subjectId: string, facultyId: string): Promise<SubjectDocument | null> {
    const result = await this.model.findByIdAndUpdate(
      subjectId,
      { $set: { primaryFacultyId: facultyId, updatedAt: new Date() } },
      { new: true, runValidators: true },
    ).exec();
    return result;
  }

  public async addCoFaculty(subjectId: string, facultyId: string): Promise<SubjectDocument | null> {
    const result = await this.model.findByIdAndUpdate(
      subjectId,
      { $addToSet: { coFacultyIds: facultyId }, updatedAt: new Date() },
      { new: true, runValidators: true },
    ).exec();
    return result;
  }

  public async removeCoFaculty(subjectId: string, facultyId: string): Promise<SubjectDocument | null> {
    const result = await this.model.findByIdAndUpdate(
      subjectId,
      { $pull: { coFacultyIds: facultyId }, updatedAt: new Date() },
      { new: true, runValidators: true },
    ).exec();
    return result;
  }

  // ─── Prerequisite Management ───────────────────────────────────────────────

  public async addPrerequisite(subjectId: string, prerequisiteSubjectId: string): Promise<SubjectDocument | null> {
    const result = await this.model.findByIdAndUpdate(
      subjectId,
      { $addToSet: { prerequisiteSubjectIds: prerequisiteSubjectId }, updatedAt: new Date() },
      { new: true, runValidators: true },
    ).exec();
    return result;
  }

  public async removePrerequisite(subjectId: string, prerequisiteSubjectId: string): Promise<SubjectDocument | null> {
    const result = await this.model.findByIdAndUpdate(
      subjectId,
      { $pull: { prerequisiteSubjectIds: prerequisiteSubjectId }, updatedAt: new Date() },
      { new: true, runValidators: true },
    ).exec();
    return result;
  }

  public async getPrerequisiteGraph(subjectId: string): Promise<SubjectDocument[]> {
    const subject = await this.findById(subjectId);
    if (!subject || !subject.prerequisiteSubjectIds.length) return [];

    return this.model.find({
      subjectId: { $in: subject.prerequisiteSubjectIds },
      deletedAt: { $exists: false },
    }).exec();
  }

  // ─── Outcome Mapping ───────────────────────────────────────────────────────

  public async updateOutcomeMapping(subjectId: string, mapping: SubjectSchemaType['outcomeMapping']): Promise<SubjectDocument | null> {
    const result = await this.model.findByIdAndUpdate(
      subjectId,
      { $set: { outcomeMapping: mapping, updatedAt: new Date() } },
      { new: true, runValidators: true },
    ).exec();
    return result;
  }

  public async getOutcomeMapping(subjectId: string): Promise<SubjectDocument | null> {
    return this.model.findOne({ _id: subjectId, deletedAt: { $exists: false } }, { outcomeMapping: 1 }).exec();
  }

  public async calculateOutcomeCoverage(subjectId: string): Promise<number | null> {
    const subject = await this.findById(subjectId);
    if (!subject?.outcomeMapping) return null;

    const totalWeightage = subject.outcomeMapping.courseOutcomes.reduce((sum, co) => sum + co.weightage, 0);
    return Math.round(totalWeightage);
  }

  // ─── Version History ───────────────────────────────────────────────────────

  public async createVersion(subjectId: string, version: SubjectSchemaType['versionHistory'][0]): Promise<SubjectDocument | null> {
    const result = await this.model.findByIdAndUpdate(
      subjectId,
      { $push: { versionHistory: version }, updatedAt: new Date() },
      { new: true, runValidators: true },
    ).exec();
    return result;
  }

  public async approveVersion(subjectId: string, version: string, approvedBy: string): Promise<SubjectDocument | null> {
    const result = await this.model.findOneAndUpdate(
      { _id: subjectId, 'versionHistory.version': version },
      {
        $set: {
          'versionHistory.$.status': 'APPROVED',
          'versionHistory.$.approvedBy': approvedBy,
          'versionHistory.$.approvedAt': new Date(),
          updatedAt: new Date(),
        },
      },
      { new: true, runValidators: true },
    ).exec();
    return result;
  }

  public async rejectVersion(subjectId: string, version: string, rejectedBy: string, rejectionReason: string): Promise<SubjectDocument | null> {
    const result = await this.model.findOneAndUpdate(
      { _id: subjectId, 'versionHistory.version': version },
      {
        $set: {
          'versionHistory.$.status': 'REJECTED',
          'versionHistory.$.rejectedBy': rejectedBy,
          'versionHistory.$.rejectedAt': new Date(),
          'versionHistory.$.rejectionReason': rejectionReason,
          updatedAt: new Date(),
        },
      },
      { new: true, runValidators: true },
    ).exec();
    return result;
  }

  public async publishVersion(subjectId: string, version: string): Promise<SubjectDocument | null> {
    const result = await this.model.findOneAndUpdate(
      { _id: subjectId, 'versionHistory.version': version },
      {
        $set: {
          'versionHistory.$.status': 'APPROVED',
          'versionHistory.$.isCurrent': true,
          currentVersion: version,
          updatedAt: new Date(),
        },
      },
      { new: true, runValidators: true },
    ).exec();
    return result;
  }

  public async getVersionHistory(subjectId: string): Promise<SubjectDocument | null> {
    return this.model.findOne({ _id: subjectId, deletedAt: { $exists: false } }, { versionHistory: 1 }).exec();
  }

  public async restoreVersion(subjectId: string, version: string): Promise<SubjectDocument | null> {
    const subject = await this.findById(subjectId);
    if (!subject) return null;

    const versionRecord = subject.versionHistory.find(v => v.version === version);
    if (!versionRecord) return null;

    const snapshot = versionRecord.snapshot;
    const result = await this.model.findByIdAndUpdate(
      subjectId,
      {
        $set: {
          ...snapshot,
          updatedAt: new Date(),
        },
      },
      { new: true, runValidators: true },
    ).exec();
    return result;
  }

  public async compareVersions(subjectId: string, versionA: string, versionB: string): Promise<{ versionA: SubjectSchemaType['versionHistory'][0]; versionB: SubjectSchemaType['versionHistory'][0] } | null> {
    const subject = await this.findById(subjectId);
    if (!subject) return null;

    const vA = subject.versionHistory.find(v => v.version === versionA);
    const vB = subject.versionHistory.find(v => v.version === versionB);

    if (!vA || !vB) return null;

    return { versionA: vA, versionB: vB };
  }

  // ─── Documents ─────────────────────────────────────────────────────────────

  public async addDocument(subjectId: string, document: SubjectSchemaType['documents'][0]): Promise<SubjectDocument | null> {
    const result = await this.model.findByIdAndUpdate(
      subjectId,
      { $push: { documents: document }, updatedAt: new Date() },
      { new: true, runValidators: true },
    ).exec();
    return result;
  }

  public async updateDocument(subjectId: string, documentId: string, updates: Partial<SubjectSchemaType['documents'][0]>): Promise<SubjectDocument | null> {
    const result = await this.model.findOneAndUpdate(
      { _id: subjectId, 'documents.id': documentId },
      { $set: { 'documents.$': updates, updatedAt: new Date() } },
      { new: true, runValidators: true },
    ).exec();
    return result;
  }

  public async verifyDocument(subjectId: string, documentId: string, verified: boolean, verifiedBy?: string): Promise<SubjectDocument | null> {
    const updateDoc: Record<string, unknown> = {
      'documents.$.verified': verified,
      'documents.$.verifiedAt': new Date(),
      updatedAt: new Date(),
    };
    if (verifiedBy) updateDoc['documents.$.verifiedBy'] = verifiedBy;

    const result = await this.model.findOneAndUpdate(
      { _id: subjectId, 'documents.id': documentId },
      { $set: updateDoc },
      { new: true, runValidators: true },
    ).exec();
    return result;
  }

  public async removeDocument(subjectId: string, documentId: string): Promise<SubjectDocument | null> {
    const result = await this.model.findByIdAndUpdate(
      subjectId,
      { $pull: { documents: { id: documentId } }, updatedAt: new Date() },
      { new: true, runValidators: true },
    ).exec();
    return result;
  }

  public async listDocuments(subjectId: string): Promise<SubjectDocument | null> {
    return this.model.findOne({ _id: subjectId, deletedAt: { $exists: false } }, { documents: 1 }).exec();
  }

  public async getDocumentVersions(subjectId: string, documentId: string): Promise<SubjectDocument | null> {
    return this.model.findOne(
      { _id: subjectId, 'documents.id': documentId, deletedAt: { $exists: false } },
      { 'documents.$': 1 },
    ).exec();
  }

  // ─── Learning Resources ────────────────────────────────────────────────────

  public async addLearningResource(subjectId: string, resource: SubjectSchemaType['learningResources'][0]): Promise<SubjectDocument | null> {
    const result = await this.model.findByIdAndUpdate(
      subjectId,
      { $push: { learningResources: resource }, updatedAt: new Date() },
      { new: true, runValidators: true },
    ).exec();
    return result;
  }

  public async updateLearningResource(subjectId: string, resourceId: string, updates: Partial<SubjectSchemaType['learningResources'][0]>): Promise<SubjectDocument | null> {
    const result = await this.model.findOneAndUpdate(
      { _id: subjectId, 'learningResources.id': resourceId },
      { $set: { 'learningResources.$': updates, updatedAt: new Date() } },
      { new: true, runValidators: true },
    ).exec();
    return result;
  }

  public async removeLearningResource(subjectId: string, resourceId: string): Promise<SubjectDocument | null> {
    const result = await this.model.findByIdAndUpdate(
      subjectId,
      { $pull: { learningResources: { id: resourceId } }, updatedAt: new Date() },
      { new: true, runValidators: true },
    ).exec();
    return result;
  }

  public async verifyLearningResource(subjectId: string, resourceId: string): Promise<SubjectDocument | null> {
    const result = await this.model.findOneAndUpdate(
      { _id: subjectId, 'learningResources.id': resourceId },
      { $set: { 'learningResources.$.lastVerifiedAt': new Date(), updatedAt: new Date() } },
      { new: true, runValidators: true },
    ).exec();
    return result;
  }

  public async recommendLearningResources(subjectId: string, limit = 10): Promise<SubjectDocument | null> {
    return this.model.findOne(
      {
        _id: subjectId,
        deletedAt: { $exists: false },
        'learningResources.isRecommended': true,
      },
      { learningResources: { $slice: limit } },
    ).exec();
  }

  public async listLearningResources(subjectId: string, type?: string): Promise<SubjectDocument | null> {
    const query: Record<string, unknown> = { _id: subjectId, deletedAt: { $exists: false } };
    if (type) query['learningResources.type'] = type;

    return this.model.findOne(query, { learningResources: 1 }).exec();
  }

  // ─── Statistics ────────────────────────────────────────────────────────────

  public async getSubjectStatistics(subjectId: string): Promise<SubjectDocument | null> {
    return this.model.findOne({ _id: subjectId, deletedAt: { $exists: false } }, { subjectStatistics: 1 }).exec();
  }

  public async updateSubjectStatistics(subjectId: string, statistics: SubjectSchemaType['subjectStatistics']): Promise<SubjectDocument | null> {
    const result = await this.model.findByIdAndUpdate(
      subjectId,
      { $set: { subjectStatistics: statistics, updatedAt: new Date() } },
      { new: true, runValidators: true },
    ).exec();
    return result;
  }

  // ─── Archive / Restore ─────────────────────────────────────────────────────

  public async archive(subjectId: string, archivedBy: string): Promise<SubjectDocument | null> {
    const result = await this.model.findByIdAndUpdate(
      subjectId,
      { $set: { status: 'ARCHIVED', isActive: false, archivedBy, archivedAt: new Date(), updatedBy: archivedBy, updatedAt: new Date() } },
      { new: true, runValidators: true },
    ).exec();
    return result;
  }

  public async restoreArchive(subjectId: string, restoredBy: string): Promise<SubjectDocument | null> {
    const result = await this.model.findByIdAndUpdate(
      subjectId,
      { $set: { status: 'ACTIVE', isActive: true, archivedBy: undefined, archivedAt: undefined, updatedBy: restoredBy, updatedAt: new Date() } },
      { new: true, runValidators: true },
    ).exec();
    return result;
  }

  // ─── Soft Delete ───────────────────────────────────────────────────────────

  public async softDelete(subjectId: string, deletedBy: string): Promise<boolean> {
    const result = await this.model.updateOne({ _id: subjectId }, { $set: { deletedAt: new Date(), deletedBy } }).exec();
    return result.modifiedCount > 0;
  }

  public async restore(subjectId: string): Promise<SubjectDocument | null> {
    const result = await this.model.updateOne({ _id: subjectId }, { $unset: { deletedAt: '', deletedBy: '' } }).exec();
    if (result.modifiedCount > 0) {
      return this.model.findById(subjectId).exec();
    }
    return null;
  }

  // ─── Existence ─────────────────────────────────────────────────────────────

  public async existsBySubjectId(subjectId: string): Promise<boolean> {
    return this.exists({ subjectId, deletedAt: { $exists: false } });
  }

  public async existsByCode(code: string): Promise<boolean> {
    return this.exists({ code: code.toUpperCase(), deletedAt: { $exists: false } });
  }

  public async existsByName(name: string, courseId?: string): Promise<boolean> {
    const query: Record<string, unknown> = { name: name.trim(), deletedAt: { $exists: false } };
    if (courseId) query.courseId = courseId;
    return this.exists(query);
  }

  // ─── Counts / Usage ────────────────────────────────────────────────────────

  public async countFaculty(subjectId: string): Promise<number> {
    const subject = await this.findById(subjectId);
    if (!subject) return 0;
    return (subject.primaryFacultyId ? 1 : 0) + subject.coFacultyIds.length;
  }

  public async countStudents(subjectId: string): Promise<number> {
    return this.count({ subjectId });
  }

  public async countAttendance(subjectId: string): Promise<number> {
    return this.count({ subjectId });
  }

  public async countResults(subjectId: string): Promise<number> {
    return this.count({ subjectId });
  }

  public async isSubjectInUse(subjectId: string): Promise<boolean> {
    const [facultyCount, studentCount, attendanceCount, resultCount] = await Promise.all([
      this.countFaculty(subjectId),
      this.countStudents(subjectId),
      this.countAttendance(subjectId),
      this.countResults(subjectId),
    ]);
    return facultyCount > 0 || studentCount > 0 || attendanceCount > 0 || resultCount > 0;
  }

  // ─── Bulk ──────────────────────────────────────────────────────────────────

  public async bulkCreate(subjects: Partial<SubjectSchemaType>[]): Promise<SubjectDocument[]> {
    return this.model.insertMany(subjects, { ordered: true }) as Promise<SubjectDocument[]>;
  }

  public async bulkUpdate(ids: string[], updates: Partial<SubjectSchemaType>, updatedBy: string): Promise<{ modifiedCount: number }> {
    const result = await this.model.updateMany(
      { _id: { $in: ids } },
      { $set: { ...updates, updatedBy, updatedAt: new Date() } },
    ).exec();
    return { modifiedCount: result.modifiedCount };
  }
}

export const subjectRepository = new SubjectRepository();
