import { BaseRepository } from '../../shared/repositories/base.repository';
import { FacultyModel, type FacultyDocument, type FacultySchemaType } from './faculty.model';

export class FacultyRepository extends BaseRepository<FacultySchemaType> {
  constructor() {
    super(FacultyModel);
  }

  public async findByFacultyId(facultyId: string): Promise<FacultyDocument | null> {
    return this.model.findOne({ facultyId, deletedAt: { $exists: false } }).exec();
  }

  public async findByEmployeeId(employeeId: string): Promise<FacultyDocument | null> {
    return this.model.findOne({ employeeId, deletedAt: { $exists: false } }).exec();
  }

  public async findByEmail(email: string): Promise<FacultyDocument | null> {
    return this.model.findOne({ email: email.toLowerCase(), deletedAt: { $exists: false } }).exec();
  }

  public async findByOfficialEmail(officialEmail: string): Promise<FacultyDocument | null> {
    return this.model.findOne({ officialEmail: officialEmail.toLowerCase(), deletedAt: { $exists: false } }).exec();
  }

  public async findByPhone(phone: string): Promise<FacultyDocument | null> {
    return this.model.findOne({ phone, deletedAt: { $exists: false } }).exec();
  }

  public async findByDepartment(departmentId: string): Promise<FacultyDocument[]> {
    return this.model.find({ departmentId, deletedAt: { $exists: false } }).exec();
  }

  public async findByDesignation(designation: string): Promise<FacultyDocument[]> {
    return this.model.find({ designation, deletedAt: { $exists: false } }).exec();
  }

  public async findByAcademicRank(academicRank: string): Promise<FacultyDocument[]> {
    return this.model.find({ academicRank, deletedAt: { $exists: false } }).exec();
  }

  public async findByCommittee(committeeId: string): Promise<FacultyDocument[]> {
    return this.model.find({ 'committeeAssignments.committeeId': committeeId, deletedAt: { $exists: false } }).exec();
  }

  public async findByResearchProject(projectTitle: string): Promise<FacultyDocument[]> {
    return this.model.find({ 'researchProjects.title': projectTitle, deletedAt: { $exists: false } }).exec();
  }

  public async findByAvailability(isAvailable: boolean): Promise<FacultyDocument[]> {
    return this.model.find({ 'availability.isAvailable': isAvailable, deletedAt: { $exists: false } }).exec();
  }

  public async findHOD(departmentId: string): Promise<FacultyDocument | null> {
    return this.model.findOne({ hodDepartmentId: departmentId, isHOD: true, deletedAt: { $exists: false } }).exec();
  }

  public async listFaculty(filter: Record<string, unknown> = {}, page = 1, limit = 20, sort: Record<string, 1 | -1> = { createdAt: -1 }): Promise<{ items: FacultyDocument[]; total: number }> {
    const query = { ...filter, deletedAt: { $exists: false } };
    return this.paginate(query, page, limit, sort);
  }

  public async searchFaculty(searchQuery: string, page = 1, limit = 20): Promise<{ items: FacultyDocument[]; total: number }> {
    const filter = { $text: { $search: searchQuery }, deletedAt: { $exists: false } };
    const sort = { score: { $meta: 'textScore' } };
    const [items, total] = await Promise.all([
      this.model.find(filter).sort(sort as unknown as Record<string, 1 | -1>).skip((page - 1) * limit).limit(limit).exec(),
      this.model.countDocuments(filter).exec(),
    ]);
    return { items, total };
  }

  public async filterFaculty(filters: Record<string, unknown>, page = 1, limit = 20, sort: Record<string, 1 | -1> = { createdAt: -1 }): Promise<{ items: FacultyDocument[]; total: number }> {
    const query: Record<string, unknown> = { deletedAt: { $exists: false } };

    if (filters.departmentId) query.departmentId = filters.departmentId;
    if (filters.designation) query.designation = filters.designation;
    if (filters.academicRank) query.academicRank = filters.academicRank;
    if (filters.employmentStatus) query.employmentStatus = filters.employmentStatus;
    if (filters.isActive !== undefined) query.isActive = filters.isActive;
    if (filters.isHOD !== undefined) query.isHOD = filters.isHOD;
    if (filters.employeeType) query.employeeType = filters.employeeType;
    if (filters.status) query.status = filters.status;
    if (filters.tags && Array.isArray(filters.tags)) query.tags = { $in: filters.tags };

    if (filters.joiningDateFrom || filters.joiningDateTo) {
      query.joiningDate = {};
      if (filters.joiningDateFrom) (query.joiningDate as Record<string, unknown>).$gte = filters.joiningDateFrom;
      if (filters.joiningDateTo) (query.joiningDate as Record<string, unknown>).$lte = filters.joiningDateTo;
    }

    return this.paginate(query, page, limit, sort);
  }

  public async publicProfile(id: string): Promise<FacultyDocument | null> {
    const projection = {
      firstName: 1,
      lastName: 1,
      displayName: 1,
      title: 1,
      designation: 1,
      academicRank: 1,
      departmentId: 1,
      photo: 1,
      email: 1,
      officialEmail: 1,
      phone: 1,
      officeLocation: 1,
      officeHours: 1,
      specializations: 1,
      skills: 1,
      researchInterests: 1,
      publications: 1,
      qualifications: 1,
      experience: 1,
      teachingLoad: 1,
      availability: 1,
      committeeAssignments: 1,
      status: 1,
      isActive: 1,
    };
    return this.model.findOne({ _id: id, deletedAt: { $exists: false } }, projection).exec();
  }

  public async facultyStatistics(facultyId: string): Promise<FacultyDocument | null> {
    return this.model.findOne({ _id: facultyId, deletedAt: { $exists: false } }).exec();
  }

  public async archiveFaculty(facultyId: string, archivedBy: string): Promise<FacultyDocument | null> {
    const result = await this.model.findByIdAndUpdate(
      facultyId,
      { $set: { status: 'ARCHIVED', isActive: false, updatedBy: archivedBy, updatedAt: new Date() } },
      { new: true, runValidators: true },
    ).exec();
    return result;
  }

  public async restoreArchivedFaculty(facultyId: string, restoredBy: string): Promise<FacultyDocument | null> {
    const result = await this.model.findByIdAndUpdate(
      facultyId,
      { $set: { status: 'ACTIVE', isActive: true, updatedBy: restoredBy, updatedAt: new Date() } },
      { new: true, runValidators: true },
    ).exec();
    return result;
  }

  public async updateTeachingLoad(facultyId: string, load: FacultySchemaType['teachingLoad']): Promise<FacultyDocument | null> {
    const result = await this.model.findByIdAndUpdate(
      facultyId,
      { $set: { teachingLoad: { ...load, lastUpdated: new Date() }, updatedAt: new Date() } },
      { new: true, runValidators: true },
    ).exec();
    return result;
  }

  public async updateLeaveBalance(facultyId: string, balance: FacultySchemaType['leaveBalance']): Promise<FacultyDocument | null> {
    const result = await this.model.findByIdAndUpdate(
      facultyId,
      { $set: { leaveBalance: { ...balance, lastUpdated: new Date() }, updatedAt: new Date() } },
      { new: true, runValidators: true },
    ).exec();
    return result;
  }

  public async updateOfficeHours(facultyId: string, officeHours: FacultySchemaType['officeHours']): Promise<FacultyDocument | null> {
    const result = await this.model.findByIdAndUpdate(
      facultyId,
      { $set: { officeHours, updatedAt: new Date() } },
      { new: true, runValidators: true },
    ).exec();
    return result;
  }

  public async updateAvailability(facultyId: string, availability: FacultySchemaType['availability']): Promise<FacultyDocument | null> {
    const result = await this.model.findByIdAndUpdate(
      facultyId,
      { $set: { availability: { ...availability, lastUpdated: new Date() }, updatedAt: new Date() } },
      { new: true, runValidators: true },
    ).exec();
    return result;
  }

  public async addCommitteeAssignment(facultyId: string, assignment: FacultySchemaType['committeeAssignments'][0]): Promise<FacultyDocument | null> {
    const result = await this.model.findByIdAndUpdate(
      facultyId,
      { $push: { committeeAssignments: assignment }, updatedAt: new Date() },
      { new: true, runValidators: true },
    ).exec();
    return result;
  }

  public async updateCommitteeAssignment(facultyId: string, committeeId: string, updates: Partial<FacultySchemaType['committeeAssignments'][0]>): Promise<FacultyDocument | null> {
    const updateDoc: Record<string, unknown> = { updatedAt: new Date() };
    if (updates.role) updateDoc['committeeAssignments.$.role'] = updates.role;
    if (updates.status) updateDoc['committeeAssignments.$.status'] = updates.status;
    if (updates.endDate) updateDoc['committeeAssignments.$.endDate'] = updates.endDate;
    if (updates.remarks !== undefined) updateDoc['committeeAssignments.$.remarks'] = updates.remarks;
    const result = await this.model.findOneAndUpdate(
      { _id: facultyId, 'committeeAssignments.committeeId': committeeId },
      { $set: updateDoc },
      { new: true, runValidators: true },
    ).exec();
    return result;
  }

  public async removeCommitteeAssignment(facultyId: string, committeeId: string): Promise<FacultyDocument | null> {
    const result = await this.model.findByIdAndUpdate(
      facultyId,
      { $pull: { committeeAssignments: { committeeId } }, updatedAt: new Date() },
      { new: true, runValidators: true },
    ).exec();
    return result;
  }

  public async addResearchProject(facultyId: string, project: FacultySchemaType['researchProjects'][0]): Promise<FacultyDocument | null> {
    const result = await this.model.findByIdAndUpdate(
      facultyId,
      { $push: { researchProjects: project }, updatedAt: new Date() },
      { new: true, runValidators: true },
    ).exec();
    return result;
  }

  public async updateResearchProject(facultyId: string, projectTitle: string, updates: Partial<FacultySchemaType['researchProjects'][0]>): Promise<FacultyDocument | null> {
    const updateDoc: Record<string, unknown> = { updatedAt: new Date() };
    if (updates.description) updateDoc['researchProjects.$.description'] = updates.description;
    if (updates.fundingAgency !== undefined) updateDoc['researchProjects.$.fundingAgency'] = updates.fundingAgency;
    if (updates.amount !== undefined) updateDoc['researchProjects.$.amount'] = updates.amount;
    if (updates.endDate) updateDoc['researchProjects.$.endDate'] = updates.endDate;
    if (updates.status) updateDoc['researchProjects.$.status'] = updates.status;
    if (updates.role) updateDoc['researchProjects.$.role'] = updates.role;
    if (updates.teamMembers) updateDoc['researchProjects.$.teamMembers'] = updates.teamMembers;
    if (updates.publications) updateDoc['researchProjects.$.publications'] = updates.publications;
    if (updates.patents) updateDoc['researchProjects.$.patents'] = updates.patents;
    const result = await this.model.findOneAndUpdate(
      { _id: facultyId, 'researchProjects.title': projectTitle },
      { $set: updateDoc },
      { new: true, runValidators: true },
    ).exec();
    return result;
  }

  public async removeResearchProject(facultyId: string, projectTitle: string): Promise<FacultyDocument | null> {
    const result = await this.model.findByIdAndUpdate(
      facultyId,
      { $pull: { researchProjects: { title: projectTitle } }, updatedAt: new Date() },
      { new: true, runValidators: true },
    ).exec();
    return result;
  }

  public async bulkCreate(faculty: Partial<FacultySchemaType>[]): Promise<FacultyDocument[]> {
    return this.model.insertMany(faculty, { ordered: true }) as Promise<FacultyDocument[]>;
  }

  public async bulkUpdate(ids: string[], updates: Partial<FacultySchemaType>, updatedBy: string): Promise<{ modifiedCount: number }> {
    const result = await this.model.updateMany(
      { _id: { $in: ids } },
      { $set: { ...updates, updatedBy, updatedAt: new Date() } },
    ).exec();
    return { modifiedCount: result.modifiedCount };
  }

  public async softDelete(facultyId: string, deletedBy: string): Promise<boolean> {
    const result = await this.model.updateOne({ _id: facultyId }, { $set: { deletedAt: new Date(), deletedBy } }).exec();
    return result.modifiedCount > 0;
  }

  public async restore(facultyId: string): Promise<FacultyDocument | null> {
    const result = await this.model.updateOne({ _id: facultyId }, { $unset: { deletedAt: '', deletedBy: '' } }).exec();
    if (result.modifiedCount > 0) {
      return this.model.findById(facultyId).exec();
    }
    return null;
  }

  public async existsByFacultyId(facultyId: string): Promise<boolean> {
    return this.exists({ facultyId, deletedAt: { $exists: false } });
  }

  public async existsByEmployeeId(employeeId: string): Promise<boolean> {
    return this.exists({ employeeId, deletedAt: { $exists: false } });
  }

  public async existsByEmail(email: string): Promise<boolean> {
    return this.exists({ email: email.toLowerCase(), deletedAt: { $exists: false } });
  }

  public async existsByOfficialEmail(officialEmail: string): Promise<boolean> {
    return this.exists({ officialEmail: officialEmail.toLowerCase(), deletedAt: { $exists: false } });
  }

  public async existsByAadharNumber(aadharNumber: string): Promise<boolean> {
    return this.exists({ aadharNumber, deletedAt: { $exists: false } });
  }

  public async countCourses(facultyId: string): Promise<number> {
    const faculty = await this.findByFacultyId(facultyId);
    return faculty ? faculty.courses.length : 0;
  }

  public async countSubjects(facultyId: string): Promise<number> {
    const faculty = await this.findByFacultyId(facultyId);
    return faculty ? faculty.subjects.length : 0;
  }

  public async countStudents(facultyId: string): Promise<number> {
    const faculty = await this.findByFacultyId(facultyId);
    return faculty ? faculty.subjects.length : 0;
  }

  public async countResearchProjects(facultyId: string): Promise<number> {
    const faculty = await this.findByFacultyId(facultyId);
    return faculty ? faculty.researchProjects.length : 0;
  }

  public async isFacultyInUse(facultyId: string): Promise<boolean> {
    const [courseCount, subjectCount, researchCount] = await Promise.all([
      this.countCourses(facultyId),
      this.countSubjects(facultyId),
      this.countResearchProjects(facultyId),
    ]);
    return courseCount > 0 || subjectCount > 0 || researchCount > 0;
  }
}

export const facultyRepository = new FacultyRepository();
