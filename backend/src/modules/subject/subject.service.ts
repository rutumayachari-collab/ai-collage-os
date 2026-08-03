import { ConflictError, NotFoundError, BadRequestError } from '../../shared/utils/api-error.util';
import { subjectRepository } from './subject.repository';
import { courseRepository } from '../course/course.repository';
import { departmentRepository } from '../department/department.repository';
import { facultyRepository } from '../faculty/faculty.repository';
import type { SubjectDocument, SubjectSchemaType } from './subject.model';
import type { CreateSubjectInput, UpdateSubjectInput, SubjectQueryInput, BulkImportInput } from './subject.validator';

export class SubjectService {
  public async createSubject(input: CreateSubjectInput, createdBy: string): Promise<SubjectDocument> {
    const normalizedSubjectId = input.subjectId.trim().toUpperCase();
    const normalizedCode = input.code.trim().toUpperCase();
    const normalizedName = input.name.trim();

    if (await subjectRepository.existsBySubjectId(normalizedSubjectId)) {
      throw new ConflictError('A subject with this subject ID already exists');
    }

    if (await subjectRepository.existsByCode(normalizedCode)) {
      throw new ConflictError('A subject with this code already exists');
    }

    await this.validateCourse(input.courseId);
    await this.validateDepartment(input.departmentId);

    if (input.primaryFacultyId && input.coFacultyIds.includes(input.primaryFacultyId)) {
      throw new BadRequestError('Primary faculty cannot also be a co-faculty');
    }

    await this.validateFacultyIds(input.primaryFacultyId, input.coFacultyIds);

    const prerequisiteErrors = this.validatePrerequisites(input.prerequisiteSubjectIds, normalizedSubjectId);
    if (prerequisiteErrors.length > 0) {
      throw new BadRequestError(prerequisiteErrors.join('; '));
    }

    this.validateHours(input.theoryHours, input.tutorialHours, input.practicalHours, input.credits);
    this.validateAiMetadataFields(input);

    const cleanedInput = this.cleanEmptyStrings(input);

    return subjectRepository.create({
      ...cleanedInput,
      subjectId: normalizedSubjectId,
      code: normalizedCode,
      name: normalizedName,
      status: input.status || 'ACTIVE',
      isActive: input.isActive ?? true,
      createdBy,
      updatedBy: createdBy,
    });
  }

  public async updateSubject(id: string, input: UpdateSubjectInput, updatedBy: string): Promise<SubjectDocument | null> {
    const subject = await subjectRepository.findById(id);
    if (!subject) {
      throw new NotFoundError('Subject not found');
    }

    if (subject.deletedAt) {
      throw new BadRequestError('Cannot update a deleted subject');
    }

    if (input.name && input.name !== subject.name) {
      const normalizedName = input.name.trim();
      const existing = await subjectRepository.findByName(normalizedName, subject.courseId);
      if (existing && existing.id !== id) {
        throw new ConflictError('A subject with this name already exists in this course');
      }
    }

    const updatedPrimary = input.primaryFacultyId !== undefined ? input.primaryFacultyId : subject.primaryFacultyId;
    const updatedCoFaculty = input.coFacultyIds !== undefined ? input.coFacultyIds : subject.coFacultyIds;

    if (updatedPrimary && updatedCoFaculty.includes(updatedPrimary)) {
      throw new BadRequestError('Primary faculty cannot also be a co-faculty');
    }

    await this.validateFacultyIds(updatedPrimary, updatedCoFaculty);

    const prerequisiteIds = input.prerequisiteSubjectIds !== undefined ? input.prerequisiteSubjectIds : subject.prerequisiteSubjectIds;
    const prerequisiteErrors = this.validatePrerequisites(prerequisiteIds, subject.subjectId);
    if (prerequisiteErrors.length > 0) {
      throw new BadRequestError(prerequisiteErrors.join('; '));
    }

    if (
      input.theoryHours !== undefined ||
      input.tutorialHours !== undefined ||
      input.practicalHours !== undefined ||
      input.credits !== undefined
    ) {
      this.validateHours(
        input.theoryHours ?? subject.theoryHours,
        input.tutorialHours ?? subject.tutorialHours,
        input.practicalHours ?? subject.practicalHours,
        input.credits ?? subject.credits,
      );
    }

    this.validateAiMetadataFields(input);

    const cleanedInput = this.cleanEmptyStrings(input);

    const updated = await subjectRepository.updateById(id, {
      ...cleanedInput,
      updatedBy,
      updatedAt: new Date(),
    });

    return updated;
  }

  public async getSubject(id: string): Promise<SubjectDocument | null> {
    return subjectRepository.findById(id);
  }

  public async getSubjectBySubjectId(subjectId: string): Promise<SubjectDocument | null> {
    return subjectRepository.findBySubjectId(subjectId);
  }

  public async getSubjectByCode(code: string): Promise<SubjectDocument | null> {
    return subjectRepository.findByCode(code);
  }

  public async deleteSubject(id: string, deletedBy: string): Promise<void> {
    const subject = await subjectRepository.findById(id);
    if (!subject) {
      throw new NotFoundError('Subject not found');
    }

    if (subject.deletedAt) {
      throw new BadRequestError('Subject is already deleted');
    }

    if (subject.status === 'ARCHIVED') {
      throw new BadRequestError('Cannot delete an archived subject. Restore it first.');
    }

    if (await subjectRepository.isSubjectInUse(id)) {
      throw new BadRequestError('Cannot delete subject while it has associated faculty, students, attendance, or results');
    }

    await subjectRepository.softDelete(id, deletedBy);
  }

  public async listSubjects(query: SubjectQueryInput): Promise<{ items: SubjectDocument[]; total: number }> {
    const filter: Record<string, unknown> = {};

    if (query.search) {
      filter.$text = { $search: query.search };
    }

    if (query.courseId) filter.courseId = query.courseId;
    if (query.departmentId) filter.departmentId = query.departmentId;
    if (query.semester) filter.semester = query.semester;
    if (query.academicYear) filter.academicYear = query.academicYear;
    if (query.regulationYear) filter.regulationYear = query.regulationYear;
    if (query.subjectType) filter.subjectType = query.subjectType;
    if (query.category) filter.category = query.category;
    if (query.isActive !== undefined) filter.isActive = query.isActive;
    if (query.status) filter.status = query.status;
    if (query.primaryFacultyId) filter.primaryFacultyId = query.primaryFacultyId;
    if (query.predictedDifficulty) filter.predictedDifficulty = query.predictedDifficulty;
    if (query.difficultyTrend) filter.difficultyTrend = query.difficultyTrend;

    const sortOption: Record<string, 1 | -1> = {};
    if (query.sort) {
      sortOption[query.sort] = query.order === 'asc' ? 1 : -1;
    } else {
      sortOption.createdAt = -1;
    }

    return subjectRepository.listSubjects(filter, query.page, query.limit, sortOption);
  }

  public async searchSubjects(searchQuery: string, page = 1, limit = 20): Promise<{ items: SubjectDocument[]; total: number }> {
    return subjectRepository.searchSubjects(searchQuery, page, limit);
  }

  public async filterSubjects(filters: Record<string, unknown>, page = 1, limit = 20, sort: Record<string, 1 | -1> = { createdAt: -1 }): Promise<{ items: SubjectDocument[]; total: number }> {
    return subjectRepository.filterSubjects(filters, page, limit, sort);
  }

  public async assignPrimaryFaculty(subjectId: string, facultyId: string): Promise<SubjectDocument | null> {
    const subject = await subjectRepository.findById(subjectId);
    if (!subject) {
      throw new NotFoundError('Subject not found');
    }

    if (subject.deletedAt) {
      throw new BadRequestError('Cannot modify a deleted subject');
    }

    if (subject.status === 'ARCHIVED') {
      throw new BadRequestError('Cannot modify an archived subject');
    }

    await this.validateFaculty(facultyId);
    await this.validateCourse(subject.courseId);
    await this.validateDepartment(subject.departmentId);

    if (subject.coFacultyIds.includes(facultyId)) {
      throw new BadRequestError('Faculty is already assigned as a co-faculty');
    }

    return subjectRepository.assignPrimaryFaculty(subjectId, facultyId);
  }

  public async addCoFaculty(subjectId: string, facultyId: string): Promise<SubjectDocument | null> {
    const subject = await subjectRepository.findById(subjectId);
    if (!subject) {
      throw new NotFoundError('Subject not found');
    }

    if (subject.deletedAt) {
      throw new BadRequestError('Cannot modify a deleted subject');
    }

    if (subject.status === 'ARCHIVED') {
      throw new BadRequestError('Cannot modify an archived subject');
    }

    await this.validateFaculty(facultyId);
    await this.validateCourse(subject.courseId);
    await this.validateDepartment(subject.departmentId);

    if (subject.primaryFacultyId === facultyId) {
      throw new BadRequestError('Faculty is already assigned as primary faculty');
    }

    if (subject.coFacultyIds.includes(facultyId)) {
      throw new BadRequestError('Faculty is already assigned as a co-faculty');
    }

    return subjectRepository.addCoFaculty(subjectId, facultyId);
  }

  public async removeCoFaculty(subjectId: string, facultyId: string): Promise<SubjectDocument | null> {
    const subject = await subjectRepository.findById(subjectId);
    if (!subject) {
      throw new NotFoundError('Subject not found');
    }

    if (subject.deletedAt) {
      throw new BadRequestError('Cannot modify a deleted subject');
    }

    if (subject.status === 'ARCHIVED') {
      throw new BadRequestError('Cannot modify an archived subject');
    }

    return subjectRepository.removeCoFaculty(subjectId, facultyId);
  }

  public async addPrerequisite(subjectId: string, prerequisiteSubjectId: string): Promise<SubjectDocument | null> {
    const subject = await subjectRepository.findById(subjectId);
    if (!subject) {
      throw new NotFoundError('Subject not found');
    }

    if (subject.deletedAt) {
      throw new BadRequestError('Cannot modify a deleted subject');
    }

    if (subject.status === 'ARCHIVED') {
      throw new BadRequestError('Cannot modify an archived subject');
    }

    const prerequisite = await subjectRepository.findBySubjectId(prerequisiteSubjectId);
    if (!prerequisite) {
      throw new BadRequestError('Prerequisite subject does not exist');
    }

    if (subject.subjectId === prerequisiteSubjectId) {
      throw new BadRequestError('A subject cannot be its own prerequisite');
    }

    const circularCheck = await this.detectCircularPrerequisites(subjectId, prerequisiteSubjectId);
    if (circularCheck) {
      throw new BadRequestError('Adding this prerequisite would create a circular dependency');
    }

    if (subject.prerequisiteSubjectIds.includes(prerequisiteSubjectId)) {
      throw new BadRequestError('Prerequisite already assigned');
    }

    return subjectRepository.addPrerequisite(subjectId, prerequisiteSubjectId);
  }

  public async removePrerequisite(subjectId: string, prerequisiteSubjectId: string): Promise<SubjectDocument | null> {
    const subject = await subjectRepository.findById(subjectId);
    if (!subject) {
      throw new NotFoundError('Subject not found');
    }

    if (subject.deletedAt) {
      throw new BadRequestError('Cannot modify a deleted subject');
    }

    if (subject.status === 'ARCHIVED') {
      throw new BadRequestError('Cannot modify an archived subject');
    }

    if (!subject.prerequisiteSubjectIds.includes(prerequisiteSubjectId)) {
      throw new BadRequestError('Prerequisite not assigned');
    }

    return subjectRepository.removePrerequisite(subjectId, prerequisiteSubjectId);
  }

  public async validatePrerequisiteGraph(subjectId: string): Promise<{ valid: boolean; cycles: string[][] }> {
    const subject = await subjectRepository.findById(subjectId);
    if (!subject) {
      throw new NotFoundError('Subject not found');
    }

    const allSubjects = await subjectRepository.findMany({ deletedAt: { $exists: false } });
    const subjectMap = new Map<string, string[]>();
    for (const s of allSubjects) {
      subjectMap.set(s.subjectId, s.prerequisiteSubjectIds);
    }

    const cycles: string[][] = [];
    const visited = new Set<string>();
    const recursionStack = new Set<string>();
    const path: string[] = [];

    const dfs = (node: string): boolean => {
      visited.add(node);
      recursionStack.add(node);
      path.push(node);

      const neighbors = subjectMap.get(node) || [];
      for (const neighbor of neighbors) {
        if (!visited.has(neighbor)) {
          if (dfs(neighbor)) return true;
        } else if (recursionStack.has(neighbor)) {
          const cycleStart = path.indexOf(neighbor);
          cycles.push([...path.slice(cycleStart), neighbor]);
          return true;
        }
      }

      recursionStack.delete(node);
      path.pop();
      return false;
    };

    for (const key of subjectMap.keys()) {
      if (!visited.has(key)) {
        dfs(key);
      }
    }

    return { valid: cycles.length === 0, cycles };
  }

  public async getPrerequisiteGraph(subjectId: string): Promise<SubjectDocument[]> {
    const subject = await subjectRepository.findById(subjectId);
    if (!subject) {
      throw new NotFoundError('Subject not found');
    }

    return subjectRepository.getPrerequisiteGraph(subjectId);
  }

  public async updateOutcomeMapping(subjectId: string, mapping: SubjectSchemaType['outcomeMapping']): Promise<SubjectDocument | null> {
    const subject = await subjectRepository.findById(subjectId);
    if (!subject) {
      throw new NotFoundError('Subject not found');
    }

    if (subject.deletedAt) {
      throw new BadRequestError('Cannot modify a deleted subject');
    }

    if (subject.status === 'ARCHIVED') {
      throw new BadRequestError('Cannot modify an archived subject');
    }

    if (!mapping || !mapping.courseOutcomes || mapping.courseOutcomes.length === 0) {
      throw new BadRequestError('At least one course outcome is required');
    }

    const totalWeightage = mapping.courseOutcomes.reduce((sum, co) => sum + co.weightage, 0);
    if (totalWeightage > 100) {
      throw new BadRequestError('Total course outcome weightage cannot exceed 100');
    }

    const coIds = new Set(mapping.courseOutcomes.map(co => co.id));
    for (const po of mapping.programOutcomes) {
      for (const coId of po.relatedCourseOutcomes) {
        if (!coIds.has(coId)) {
          throw new BadRequestError(`Program outcome references unknown course outcome: ${coId}`);
        }
      }
    }

    const usedPOs = new Set<string>();
    for (const ga of mapping.graduateAttributes) {
      for (const po of ga.mappedProgramOutcomes) {
        if (usedPOs.has(po)) {
          throw new BadRequestError(`Graduate attribute maps duplicate program outcome: ${po}`);
        }
        usedPOs.add(po);
      }
    }

    return subjectRepository.updateOutcomeMapping(subjectId, mapping);
  }

  public async getOutcomeMapping(subjectId: string): Promise<SubjectDocument | null> {
    return subjectRepository.getOutcomeMapping(subjectId);
  }

  public async calculateOutcomeCoverage(subjectId: string): Promise<number | null> {
    const subject = await subjectRepository.findById(subjectId);
    if (!subject) {
      throw new NotFoundError('Subject not found');
    }

    if (!subject.outcomeMapping) {
      return null;
    }

    const totalWeightage = subject.outcomeMapping.courseOutcomes.reduce((sum, co) => sum + co.weightage, 0);
    return Math.round(totalWeightage);
  }

  public async createVersion(subjectId: string, version: string, changeSummary: string, changedBy: string): Promise<SubjectDocument | null> {
    const subject = await subjectRepository.findById(subjectId);
    if (!subject) {
      throw new NotFoundError('Subject not found');
    }

    if (subject.deletedAt) {
      throw new BadRequestError('Cannot create version for a deleted subject');
    }

    if (subject.status === 'ARCHIVED') {
      throw new BadRequestError('Cannot create version for an archived subject');
    }

    const existingVersion = subject.versionHistory.find(v => v.version === version);
    if (existingVersion) {
      throw new ConflictError('Version already exists');
    }

    const snapshot: SubjectSchemaType['versionHistory'][0]['snapshot'] = {
      subjectId: subject.subjectId,
      code: subject.code,
      name: subject.name,
      description: subject.description || '',
      courseId: subject.courseId,
      departmentId: subject.departmentId,
      semester: subject.semester,
      academicYear: subject.academicYear,
      regulationYear: subject.regulationYear,
      subjectType: subject.subjectType,
      category: subject.category,
      credits: subject.credits,
      theoryHours: subject.theoryHours,
      tutorialHours: subject.tutorialHours,
      practicalHours: subject.practicalHours,
      totalHours: subject.totalHours,
      deliveryMode: subject.deliveryMode,
      primaryFacultyId: subject.primaryFacultyId,
      coFacultyIds: subject.coFacultyIds,
      syllabusUnits: subject.syllabusUnits,
      courseOutcomes: subject.courseOutcomes,
      learningObjectives: subject.learningObjectives,
      textbooks: subject.textbooks,
      referenceBooks: subject.referenceBooks,
      internalMarks: subject.internalMarks,
      externalMarks: subject.externalMarks,
      passingMarks: subject.passingMarks,
      gradingScheme: subject.gradingScheme,
      attendanceRequirement: subject.attendanceRequirement,
      prerequisiteSubjectIds: subject.prerequisiteSubjectIds,
      outcomeMapping: subject.outcomeMapping,
      learningResources: subject.learningResources,
      documents: subject.documents,
      aiMetadata: {
        predictedDifficulty: subject.predictedDifficulty,
        predictedPassRate: subject.predictedPassRate,
        averagePerformance: subject.averagePerformance,
        recommendationScore: subject.recommendationScore,
        aiInsights: subject.aiInsights,
        confidenceScore: subject.confidenceScore,
        lastPredictedAt: subject.lastPredictedAt,
        historicalPassRate: subject.historicalPassRate,
        historicalFailureRate: subject.historicalFailureRate,
        averageAttendance: subject.averageAttendance,
        averageMarks: subject.averageMarks,
        difficultyTrend: subject.difficultyTrend,
        semesterPopularity: subject.semesterPopularity,
        studentFeedbackScore: subject.studentFeedbackScore,
      },
    };

    const versionRecord: SubjectSchemaType['versionHistory'][0] = {
      version,
      status: 'DRAFT',
      changedBy,
      changedAt: new Date(),
      changeSummary: changeSummary.trim(),
      snapshot,
      isCurrent: false,
    };

    return subjectRepository.createVersion(subjectId, versionRecord);
  }

  public async approveVersion(subjectId: string, version: string, approvedBy: string): Promise<SubjectDocument | null> {
    const subject = await subjectRepository.findById(subjectId);
    if (!subject) {
      throw new NotFoundError('Subject not found');
    }

    const versionRecord = subject.versionHistory.find(v => v.version === version);
    if (!versionRecord) {
      throw new NotFoundError('Version not found');
    }

    if (versionRecord.status === 'APPROVED') {
      throw new BadRequestError('Version is already approved');
    }

    if (versionRecord.status === 'REJECTED') {
      throw new BadRequestError('Cannot approve a rejected version');
    }

    if (versionRecord.status === 'SUPERSEDED') {
      throw new BadRequestError('Cannot approve a superseded version');
    }

    return subjectRepository.approveVersion(subjectId, version, approvedBy);
  }

  public async rejectVersion(subjectId: string, version: string, rejectedBy: string, reason: string): Promise<SubjectDocument | null> {
    const subject = await subjectRepository.findById(subjectId);
    if (!subject) {
      throw new NotFoundError('Subject not found');
    }

    const versionRecord = subject.versionHistory.find(v => v.version === version);
    if (!versionRecord) {
      throw new NotFoundError('Version not found');
    }

    if (versionRecord.status === 'REJECTED') {
      throw new BadRequestError('Version is already rejected');
    }

    if (versionRecord.status === 'APPROVED') {
      throw new BadRequestError('Cannot reject an approved version');
    }

    if (versionRecord.status === 'SUPERSEDED') {
      throw new BadRequestError('Cannot reject a superseded version');
    }

    return subjectRepository.rejectVersion(subjectId, version, rejectedBy, reason.trim());
  }

  public async publishVersion(subjectId: string, version: string): Promise<SubjectDocument | null> {
    const subject = await subjectRepository.findById(subjectId);
    if (!subject) {
      throw new NotFoundError('Subject not found');
    }

    const versionRecord = subject.versionHistory.find(v => v.version === version);
    if (!versionRecord) {
      throw new NotFoundError('Version not found');
    }

    if (versionRecord.status !== 'APPROVED') {
      throw new BadRequestError('Only approved versions can be published');
    }

    return subjectRepository.publishVersion(subjectId, version);
  }

  public async restoreVersion(subjectId: string, version: string): Promise<SubjectDocument | null> {
    const subject = await subjectRepository.findById(subjectId);
    if (!subject) {
      throw new NotFoundError('Subject not found');
    }

    if (subject.deletedAt) {
      throw new BadRequestError('Cannot restore version for a deleted subject');
    }

    if (subject.status === 'ARCHIVED') {
      throw new BadRequestError('Cannot restore version for an archived subject');
    }

    const versionRecord = subject.versionHistory.find(v => v.version === version);
    if (!versionRecord) {
      throw new NotFoundError('Version not found');
    }

    if (versionRecord.status === 'SUPERSEDED') {
      throw new BadRequestError('Cannot restore a superseded version');
    }

    return subjectRepository.restoreVersion(subjectId, version);
  }

  public async compareVersions(subjectId: string, versionA: string, versionB: string): Promise<{ versionA: SubjectSchemaType['versionHistory'][0]; versionB: SubjectSchemaType['versionHistory'][0] } | null> {
    const subject = await subjectRepository.findById(subjectId);
    if (!subject) {
      throw new NotFoundError('Subject not found');
    }

    const vA = subject.versionHistory.find(v => v.version === versionA);
    const vB = subject.versionHistory.find(v => v.version === versionB);

    if (!vA || !vB) {
      throw new NotFoundError('One or both versions not found');
    }

    return { versionA: vA, versionB: vB };
  }

  public async getVersionHistory(subjectId: string): Promise<SubjectDocument | null> {
    return subjectRepository.getVersionHistory(subjectId);
  }

  public async addDocument(subjectId: string, document: SubjectSchemaType['documents'][0]): Promise<SubjectDocument | null> {
    const subject = await subjectRepository.findById(subjectId);
    if (!subject) {
      throw new NotFoundError('Subject not found');
    }

    if (subject.deletedAt) {
      throw new BadRequestError('Cannot add document to a deleted subject');
    }

    if (subject.status === 'ARCHIVED') {
      throw new BadRequestError('Cannot add document to an archived subject');
    }

    if (!document.fileUrl || !document.name || !document.type) {
      throw new BadRequestError('Document name, type, and file URL are required');
    }

    if (subject.documents.some((d) => d.id === document.id)) {
      throw new BadRequestError('Document with this ID already exists');
    }

    return subjectRepository.addDocument(subjectId, document);
  }

  public async updateDocument(subjectId: string, documentId: string, updates: Partial<SubjectSchemaType['documents'][0]>): Promise<SubjectDocument | null> {
    const subject = await subjectRepository.findById(subjectId);
    if (!subject) {
      throw new NotFoundError('Subject not found');
    }

    if (subject.deletedAt) {
      throw new BadRequestError('Cannot update document on a deleted subject');
    }

    if (subject.status === 'ARCHIVED') {
      throw new BadRequestError('Cannot update document on an archived subject');
    }

    const document = subject.documents.find(d => d.id === documentId);
    if (!document) {
      throw new NotFoundError('Document not found');
    }

    if (document.verified) {
      throw new BadRequestError('Cannot update a verified document');
    }

    return subjectRepository.updateDocument(subjectId, documentId, updates);
  }

  public async verifyDocument(subjectId: string, documentId: string, verified: boolean, verifiedBy?: string): Promise<SubjectDocument | null> {
    const subject = await subjectRepository.findById(subjectId);
    if (!subject) {
      throw new NotFoundError('Subject not found');
    }

    const document = subject.documents.find(d => d.id === documentId);
    if (!document) {
      throw new NotFoundError('Document not found');
    }

    if (document.verified === verified) {
      throw new BadRequestError(`Document is already ${verified ? 'verified' : 'unverified'}`);
    }

    return subjectRepository.verifyDocument(subjectId, documentId, verified, verifiedBy);
  }

  public async removeDocument(subjectId: string, documentId: string): Promise<SubjectDocument | null> {
    const subject = await subjectRepository.findById(subjectId);
    if (!subject) {
      throw new NotFoundError('Subject not found');
    }

    if (subject.deletedAt) {
      throw new BadRequestError('Cannot remove document from a deleted subject');
    }

    if (subject.status === 'ARCHIVED') {
      throw new BadRequestError('Cannot remove document from an archived subject');
    }

    const document = subject.documents.find(d => d.id === documentId);
    if (!document) {
      throw new NotFoundError('Document not found');
    }

    if (document.verified) {
      throw new BadRequestError('Cannot remove a verified document');
    }

    return subjectRepository.removeDocument(subjectId, documentId);
  }

  public async listDocuments(subjectId: string): Promise<SubjectDocument | null> {
    return subjectRepository.listDocuments(subjectId);
  }

  public async addLearningResource(subjectId: string, resource: SubjectSchemaType['learningResources'][0]): Promise<SubjectDocument | null> {
    const subject = await subjectRepository.findById(subjectId);
    if (!subject) {
      throw new NotFoundError('Subject not found');
    }

    if (subject.deletedAt) {
      throw new BadRequestError('Cannot add learning resource to a deleted subject');
    }

    if (subject.status === 'ARCHIVED') {
      throw new BadRequestError('Cannot add learning resource to an archived subject');
    }

    if (!resource.title || !resource.url || !resource.type) {
      throw new BadRequestError('Resource title, type, and URL are required');
    }

    if (subject.learningResources.some((r) => r.id === resource.id)) {
      throw new BadRequestError('Learning resource with this ID already exists');
    }

    return subjectRepository.addLearningResource(subjectId, resource);
  }

  public async updateLearningResource(subjectId: string, resourceId: string, updates: Partial<SubjectSchemaType['learningResources'][0]>): Promise<SubjectDocument | null> {
    const subject = await subjectRepository.findById(subjectId);
    if (!subject) {
      throw new NotFoundError('Subject not found');
    }

    if (subject.deletedAt) {
      throw new BadRequestError('Cannot update learning resource on a deleted subject');
    }

    if (subject.status === 'ARCHIVED') {
      throw new BadRequestError('Cannot update learning resource on an archived subject');
    }

    const resource = subject.learningResources.find(r => r.id === resourceId);
    if (!resource) {
      throw new NotFoundError('Learning resource not found');
    }

    return subjectRepository.updateLearningResource(subjectId, resourceId, updates);
  }

  public async removeLearningResource(subjectId: string, resourceId: string): Promise<SubjectDocument | null> {
    const subject = await subjectRepository.findById(subjectId);
    if (!subject) {
      throw new NotFoundError('Subject not found');
    }

    if (subject.deletedAt) {
      throw new BadRequestError('Cannot remove learning resource from a deleted subject');
    }

    if (subject.status === 'ARCHIVED') {
      throw new BadRequestError('Cannot remove learning resource from an archived subject');
    }

    const resource = subject.learningResources.find(r => r.id === resourceId);
    if (!resource) {
      throw new NotFoundError('Learning resource not found');
    }

    return subjectRepository.removeLearningResource(subjectId, resourceId);
  }

  public async verifyLearningResource(subjectId: string, resourceId: string): Promise<SubjectDocument | null> {
    const subject = await subjectRepository.findById(subjectId);
    if (!subject) {
      throw new NotFoundError('Subject not found');
    }

    const resource = subject.learningResources.find(r => r.id === resourceId);
    if (!resource) {
      throw new NotFoundError('Learning resource not found');
    }

    return subjectRepository.verifyLearningResource(subjectId, resourceId);
  }

  public async recommendLearningResources(subjectId: string, limit = 10): Promise<SubjectDocument | null> {
    return subjectRepository.recommendLearningResources(subjectId, limit);
  }

  public async listLearningResources(subjectId: string, type?: string): Promise<SubjectDocument | null> {
    return subjectRepository.listLearningResources(subjectId, type);
  }

  public async getSubjectStatistics(subjectId: string): Promise<SubjectDocument | null> {
    return subjectRepository.getSubjectStatistics(subjectId);
  }

  public async recalculateStatistics(subjectId: string): Promise<SubjectDocument | null> {
    const subject = await subjectRepository.findById(subjectId);
    if (!subject) {
      throw new NotFoundError('Subject not found');
    }

    if (subject.deletedAt) {
      throw new BadRequestError('Cannot recalculate statistics for a deleted subject');
    }

    const statistics = subject.subjectStatistics;
    if (!statistics) {
      throw new BadRequestError('No statistics available to recalculate');
    }

    const updatedStatistics: SubjectSchemaType['subjectStatistics'] = {
      ...statistics,
      lastCalculatedAt: new Date(),
    };

    return subjectRepository.updateSubjectStatistics(subjectId, updatedStatistics);
  }

  public async archiveSubject(id: string, archivedBy: string): Promise<SubjectDocument | null> {
    const subject = await subjectRepository.findById(id);
    if (!subject) {
      throw new NotFoundError('Subject not found');
    }

    if (subject.deletedAt) {
      throw new BadRequestError('Cannot archive a deleted subject');
    }

    if (subject.status === 'ARCHIVED') {
      throw new BadRequestError('Subject is already archived');
    }

    return subjectRepository.archive(id, archivedBy);
  }

  public async restoreArchivedSubject(id: string, restoredBy: string): Promise<SubjectDocument | null> {
    const subject = await subjectRepository.findById(id);
    if (!subject) {
      throw new NotFoundError('Subject not found');
    }

    if (subject.status !== 'ARCHIVED') {
      throw new BadRequestError('Only archived subjects can be restored');
    }

    return subjectRepository.restoreArchive(id, restoredBy);
  }

  public async restoreSubject(id: string): Promise<SubjectDocument | null> {
    const subject = await subjectRepository.findById(id);
    if (!subject) {
      throw new NotFoundError('Subject not found');
    }

    if (!subject.deletedAt) {
      throw new BadRequestError('Subject is not deleted');
    }

    return subjectRepository.restore(id);
  }

  public async bulkCreateSubjects(input: BulkImportInput, createdBy: string): Promise<{ created: number; failed: number; errors: string[] }> {
    let created = 0;
    let failed = 0;
    const errors: string[] = [];

    for (const subjectData of input.subjects) {
      try {
        await this.createSubject(subjectData, createdBy);
        created++;
      } catch (error) {
        failed++;
        errors.push(`${subjectData.subjectId || 'unknown'}: ${(error as Error).message}`);
      }
    }

    return { created, failed, errors };
  }

  public async bulkUpdateSubjects(ids: string[], updates: UpdateSubjectInput, updatedBy: string): Promise<{ updated: number; failed: number }> {
    let updated = 0;
    let failed = 0;

    for (const id of ids) {
      try {
        const result = await this.updateSubject(id, updates, updatedBy);
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

  private async validateCourse(courseId: string): Promise<void> {
    const course = await courseRepository.findById(courseId);
    if (!course) {
      throw new BadRequestError('Course does not exist');
    }
  }

  private async validateDepartment(departmentId: string): Promise<void> {
    const department = await departmentRepository.findById(departmentId);
    if (!department) {
      throw new BadRequestError('Department does not exist');
    }
  }

  private async validateFaculty(facultyId: string): Promise<void> {
    const faculty = await facultyRepository.findByFacultyId(facultyId);
    if (!faculty) {
      throw new BadRequestError('Faculty does not exist');
    }
  }

  private async validateFacultyIds(primaryFacultyId?: string, coFacultyIds: string[] = []): Promise<void> {
    if (primaryFacultyId) {
      await this.validateFaculty(primaryFacultyId);
    }

    const seen = new Set<string>();
    for (const facultyId of coFacultyIds) {
      if (seen.has(facultyId)) {
        throw new BadRequestError(`Duplicate faculty ID in co-faculty list: ${facultyId}`);
      }
      seen.add(facultyId);
      await this.validateFaculty(facultyId);
    }
  }

  private validatePrerequisites(prerequisiteIds: string[], currentSubjectId?: string): string[] {
    const errors: string[] = [];

    if (currentSubjectId && prerequisiteIds.includes(currentSubjectId)) {
      errors.push('A subject cannot be its own prerequisite');
    }

    const seen = new Set<string>();
    for (const id of prerequisiteIds) {
      if (seen.has(id)) {
        errors.push(`Duplicate prerequisite subject ID: ${id}`);
      }
      seen.add(id);
    }

    return errors;
  }

  private validateHours(theoryHours: number, tutorialHours: number, practicalHours: number, credits: number): void {
    const totalHours = theoryHours + tutorialHours + practicalHours;
    if (totalHours > 30) {
      throw new BadRequestError('Total hours per week cannot exceed 30');
    }

    if (totalHours < credits) {
      throw new BadRequestError('Total hours must be at least equal to credits');
    }
  }

  private validateAiMetadataFields(input: Partial<CreateSubjectInput | UpdateSubjectInput>): void {
    if (input.confidenceScore !== undefined && (input.confidenceScore < 0 || input.confidenceScore > 100)) {
      throw new BadRequestError('AI confidence score must be between 0 and 100');
    }
    if (input.predictedPassRate !== undefined && (input.predictedPassRate < 0 || input.predictedPassRate > 100)) {
      throw new BadRequestError('AI predicted pass rate must be between 0 and 100');
    }
    if (input.averagePerformance !== undefined && (input.averagePerformance < 0 || input.averagePerformance > 100)) {
      throw new BadRequestError('AI average performance must be between 0 and 100');
    }
    if (input.recommendationScore !== undefined && (input.recommendationScore < 0 || input.recommendationScore > 100)) {
      throw new BadRequestError('AI recommendation score must be between 0 and 100');
    }
    if (input.historicalPassRate !== undefined && (input.historicalPassRate < 0 || input.historicalPassRate > 100)) {
      throw new BadRequestError('AI historical pass rate must be between 0 and 100');
    }
    if (input.historicalFailureRate !== undefined && (input.historicalFailureRate < 0 || input.historicalFailureRate > 100)) {
      throw new BadRequestError('AI historical failure rate must be between 0 and 100');
    }
    if (input.averageAttendance !== undefined && (input.averageAttendance < 0 || input.averageAttendance > 100)) {
      throw new BadRequestError('AI average attendance must be between 0 and 100');
    }
    if (input.averageMarks !== undefined && (input.averageMarks < 0 || input.averageMarks > 100)) {
      throw new BadRequestError('AI average marks must be between 0 and 100');
    }
    if (input.studentFeedbackScore !== undefined && (input.studentFeedbackScore < 0 || input.studentFeedbackScore > 5)) {
      throw new BadRequestError('AI student feedback score must be between 0 and 5');
    }
    if (input.semesterPopularity !== undefined && (input.semesterPopularity < 0 || input.semesterPopularity > 100)) {
      throw new BadRequestError('AI semester popularity must be between 0 and 100');
    }
  }

  private async detectCircularPrerequisites(subjectId: string, newPrerequisiteId: string): Promise<boolean> {
    const subject = await subjectRepository.findBySubjectId(subjectId);
    if (!subject) return false;

    const allSubjects = await subjectRepository.findMany({ deletedAt: { $exists: false } });
    const subjectMap = new Map<string, string[]>();
    for (const s of allSubjects) {
      subjectMap.set(s.subjectId, s.prerequisiteSubjectIds);
    }

    const tempGraph = new Map(subjectMap);
    if (!tempGraph.has(newPrerequisiteId)) {
      tempGraph.set(newPrerequisiteId, []);
    }
    const prereqOfSubject = tempGraph.get(newPrerequisiteId) || [];
    if (!prereqOfSubject.includes(subjectId)) {
      tempGraph.set(newPrerequisiteId, [...prereqOfSubject, subjectId]);
    }

    const visitedTemp = new Set<string>();
    const recursionStackTemp = new Set<string>();

    const dfsTemp = (node: string): boolean => {
      visitedTemp.add(node);
      recursionStackTemp.add(node);

      const neighbors = tempGraph.get(node) || [];
      for (const neighbor of neighbors) {
        if (!visitedTemp.has(neighbor)) {
          if (dfsTemp(neighbor)) return true;
        } else if (recursionStackTemp.has(neighbor)) {
          return true;
        }
      }

      recursionStackTemp.delete(node);
      return false;
    };

    return dfsTemp(newPrerequisiteId);
  }
}

export const subjectService = new SubjectService();
