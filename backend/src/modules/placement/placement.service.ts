import { ConflictError, NotFoundError, BadRequestError } from '../../shared/utils/api-error.util';
import {
  companyRepository,
  driveRepository,
  applicationRepository,
  interviewRepository,
  offerRepository,
  placementRepository,
  placementStatisticsRepository,
} from './placement.repository';
import type {
  CompanyDocument,
  DriveDocument,
  ApplicationDocument,
  InterviewDocument,
  OfferDocument,
  PlacementDocument,
  PlacementStatisticsDocument,
} from './placement.model';
import type { CompanyStat } from './placement.types';
import type {
  CreateCompanyInput,
  UpdateCompanyInput,
  CompanyQueryInput,
  CreateDriveInput,
  UpdateDriveInput,
  DriveQueryInput,
  CreateApplicationInput,
  UpdateApplicationInput,
  ApplicationQueryInput,
  CreateInterviewInput,
  UpdateInterviewInput,
  InterviewQueryInput,
  CreateOfferInput,
  UpdateOfferInput,
  OfferQueryInput,
  CreatePlacementInput,
  UpdatePlacementInput,
  PlacementQueryInput,
  StatisticsQueryInput,
} from './placement.validator';

export class PlacementService {
  // ─── Company ───────────────────────────────────────────────────────────────

  public async createCompany(input: CreateCompanyInput, createdBy: string): Promise<CompanyDocument> {
    const normalizedCompanyId = input.companyId.trim().toUpperCase();
    const normalizedName = input.name.trim();

    if (await companyRepository.findByCompanyId(normalizedCompanyId)) {
      throw new ConflictError('A company with this company ID already exists');
    }

    if (await companyRepository.findByName(normalizedName)) {
      throw new ConflictError('A company with this name already exists');
    }

    const cleanedInput = this.cleanEmptyStrings(input);

    return companyRepository.create({
      ...cleanedInput,
      companyId: normalizedCompanyId,
      name: normalizedName,
      status: input.status || 'ACTIVE',
      isActive: input.isActive ?? true,
      createdBy,
      updatedBy: createdBy,
    });
  }

  public async updateCompany(id: string, input: UpdateCompanyInput, updatedBy: string): Promise<CompanyDocument | null> {
    const company = await companyRepository.findById(id);
    if (!company) {
      throw new NotFoundError('Company not found');
    }

    if (company.deletedAt) {
      throw new BadRequestError('Cannot update a deleted company');
    }

    if (input.name && input.name !== company.name) {
      const normalizedName = input.name.trim();
      const existing = await companyRepository.findByName(normalizedName);
      if (existing && existing.id !== id) {
        throw new ConflictError('A company with this name already exists');
      }
    }

    const cleanedInput = this.cleanEmptyStrings(input);

    const updated = await companyRepository.updateById(id, {
      ...cleanedInput,
      updatedBy,
      updatedAt: new Date(),
    });

    return updated;
  }

  public async getCompany(id: string): Promise<CompanyDocument | null> {
    return companyRepository.findById(id);
  }

  public async getCompanyByCompanyId(companyId: string): Promise<CompanyDocument | null> {
    return companyRepository.findByCompanyId(companyId);
  }

  public async deleteCompany(id: string, deletedBy: string): Promise<void> {
    const company = await companyRepository.findById(id);
    if (!company) {
      throw new NotFoundError('Company not found');
    }

    if (company.deletedAt) {
      throw new BadRequestError('Company is already deleted');
    }

    await companyRepository.softDelete(id, deletedBy);
  }

  public async listCompanies(query: CompanyQueryInput): Promise<{ items: CompanyDocument[]; total: number }> {
    const filter: Record<string, unknown> = {};

    if (query.search) {
      filter.$text = { $search: query.search };
    }

    if (query.industry) filter.industry = query.industry;
    if (query.isActive !== undefined) filter.isActive = query.isActive;
    if (query.status) filter.status = query.status;

    const sortOption: Record<string, 1 | -1> = {};
    if (query.sort) {
      sortOption[query.sort] = query.order === 'asc' ? 1 : -1;
    } else {
      sortOption.createdAt = -1;
    }

    return companyRepository.listCompanies(filter, query.page, query.limit, sortOption);
  }

  public async searchCompanies(searchQuery: string, page = 1, limit = 20): Promise<{ items: CompanyDocument[]; total: number }> {
    return companyRepository.searchCompanies(searchQuery, page, limit);
  }

  // ─── Drive ────────────────────────────────────────────────────────────────

  public async createDrive(input: CreateDriveInput, createdBy: string): Promise<DriveDocument> {
    const normalizedDriveId = input.driveId.trim().toUpperCase();
    const company = await companyRepository.findById(input.companyId);
    if (!company) {
      throw new BadRequestError('Company does not exist');
    }

    if (await driveRepository.findByDriveId(normalizedDriveId)) {
      throw new ConflictError('A drive with this drive ID already exists');
    }

    if (input.registrationDeadline >= input.driveDate) {
      throw new BadRequestError('Registration deadline must be before drive date');
    }

    const cleanedInput = this.cleanEmptyStrings(input);

    return driveRepository.create({
      ...cleanedInput,
      driveId: normalizedDriveId,
      status: input.status || 'SCHEDULED',
      createdBy,
      updatedBy: createdBy,
    });
  }

  public async updateDrive(id: string, input: UpdateDriveInput, updatedBy: string): Promise<DriveDocument | null> {
    const drive = await driveRepository.findById(id);
    if (!drive) {
      throw new NotFoundError('Drive not found');
    }

    if (drive.deletedAt) {
      throw new BadRequestError('Cannot update a deleted drive');
    }

    if (input.registrationDeadline && input.driveDate && input.registrationDeadline >= input.driveDate) {
      throw new BadRequestError('Registration deadline must be before drive date');
    }

    const cleanedInput = this.cleanEmptyStrings(input);

    const updated = await driveRepository.updateById(id, {
      ...cleanedInput,
      updatedBy,
      updatedAt: new Date(),
    });

    return updated;
  }

  public async getDrive(id: string): Promise<DriveDocument | null> {
    return driveRepository.findById(id);
  }

  public async getDriveByDriveId(driveId: string): Promise<DriveDocument | null> {
    return driveRepository.findByDriveId(driveId);
  }

  public async deleteDrive(id: string, deletedBy: string): Promise<void> {
    const drive = await driveRepository.findById(id);
    if (!drive) {
      throw new NotFoundError('Drive not found');
    }

    if (drive.deletedAt) {
      throw new BadRequestError('Drive is already deleted');
    }

    await driveRepository.softDelete(id, deletedBy);
  }

  public async listDrives(query: DriveQueryInput): Promise<{ items: DriveDocument[]; total: number }> {
    const filter: Record<string, unknown> = {};

    if (query.search) {
      filter.$text = { $search: query.search };
    }

    if (query.companyId) filter.companyId = query.companyId;
    if (query.driveType) filter.driveType = query.driveType;
    if (query.status) filter.status = query.status;
    if (query.isActive !== undefined) filter.isActive = query.isActive;

    const sortOption: Record<string, 1 | -1> = {};
    if (query.sort) {
      sortOption[query.sort] = query.order === 'asc' ? 1 : -1;
    } else {
      sortOption.createdAt = -1;
    }

    return driveRepository.listDrives(filter, query.page, query.limit, sortOption);
  }

  public async searchDrives(searchQuery: string, page = 1, limit = 20): Promise<{ items: DriveDocument[]; total: number }> {
    return driveRepository.searchDrives(searchQuery, page, limit);
  }

  // ─── Application ──────────────────────────────────────────────────────────

  public async createApplication(input: CreateApplicationInput, createdBy: string): Promise<ApplicationDocument> {
    const normalizedApplicationId = input.applicationId.trim().toUpperCase();
    const drive = await driveRepository.findById(input.driveId);
    if (!drive) {
      throw new BadRequestError('Drive does not exist');
    }

    if (drive.status !== 'REGISTRATION_OPEN') {
      throw new BadRequestError('Drive is not open for registration');
    }

    const existing = await applicationRepository.findStudentApplication(input.studentId, input.driveId);
    if (existing) {
      throw new ConflictError('Student has already applied to this drive');
    }

    if (await applicationRepository.findByApplicationId(normalizedApplicationId)) {
      throw new ConflictError('An application with this application ID already exists');
    }

    const cleanedInput = this.cleanEmptyStrings(input);

    return applicationRepository.create({
      ...cleanedInput,
      applicationId: normalizedApplicationId,
      status: input.status || 'APPLIED',
      createdBy,
      updatedBy: createdBy,
    });
  }

  public async updateApplication(id: string, input: UpdateApplicationInput, updatedBy: string): Promise<ApplicationDocument | null> {
    const application = await applicationRepository.findById(id);
    if (!application) {
      throw new NotFoundError('Application not found');
    }

    if (application.deletedAt) {
      throw new BadRequestError('Cannot update a deleted application');
    }

    const cleanedInput = this.cleanEmptyStrings(input);

    const updated = await applicationRepository.updateById(id, {
      ...cleanedInput,
      updatedBy,
      updatedAt: new Date(),
    });

    return updated;
  }

  public async getApplication(id: string): Promise<ApplicationDocument | null> {
    return applicationRepository.findById(id);
  }

  public async getApplicationByApplicationId(applicationId: string): Promise<ApplicationDocument | null> {
    return applicationRepository.findByApplicationId(applicationId);
  }

  public async deleteApplication(id: string, deletedBy: string): Promise<void> {
    const application = await applicationRepository.findById(id);
    if (!application) {
      throw new NotFoundError('Application not found');
    }

    if (application.deletedAt) {
      throw new BadRequestError('Application is already deleted');
    }

    await applicationRepository.softDelete(id, deletedBy);
  }

  public async listApplications(query: ApplicationQueryInput, requesterRole?: string, requesterId?: string): Promise<{ items: ApplicationDocument[]; total: number }> {
    const filter: Record<string, unknown> = {};

    if (query.search) {
      filter.$text = { $search: query.search };
    }

    if (query.studentId && requesterRole !== 'STUDENT') {
      filter.studentId = query.studentId;
    } else if (requesterRole === 'STUDENT' && requesterId) {
      filter.studentId = requesterId;
    }

    if (query.driveId) filter.driveId = query.driveId;
    if (query.status) filter.status = query.status;

    const sortOption: Record<string, 1 | -1> = {};
    if (query.sort) {
      sortOption[query.sort] = query.order === 'asc' ? 1 : -1;
    } else {
      sortOption.createdAt = -1;
    }

    return applicationRepository.listApplications(filter, query.page, query.limit, sortOption);
  }

  public async searchApplications(searchQuery: string, page = 1, limit = 20, requesterRole?: string, requesterId?: string): Promise<{ items: ApplicationDocument[]; total: number }> {
    const filter: Record<string, unknown> = { $text: { $search: searchQuery }, deletedAt: { $exists: false } };

    if (requesterRole === 'STUDENT' && requesterId) {
      filter.studentId = requesterId;
    }

    const sortOption: Record<string, 1 | -1> = { score: { $meta: 'textScore' } as unknown as 1 | -1 };
    return applicationRepository.listApplications(filter, page, limit, sortOption);
  }

  // ─── Interview ────────────────────────────────────────────────────────────

  public async createInterview(input: CreateInterviewInput, createdBy: string): Promise<InterviewDocument> {
    const normalizedInterviewId = input.interviewId.trim().toUpperCase();
    const application = await applicationRepository.findById(input.applicationId);
    if (!application) {
      throw new BadRequestError('Application does not exist');
    }

    if (await interviewRepository.findByInterviewId(normalizedInterviewId)) {
      throw new ConflictError('An interview with this interview ID already exists');
    }

    const cleanedInput = this.cleanEmptyStrings(input);

    return interviewRepository.create({
      ...cleanedInput,
      interviewId: normalizedInterviewId,
      createdBy,
      updatedBy: createdBy,
    });
  }

  public async updateInterview(id: string, input: UpdateInterviewInput, updatedBy: string): Promise<InterviewDocument | null> {
    const interview = await interviewRepository.findById(id);
    if (!interview) {
      throw new NotFoundError('Interview not found');
    }

    if (interview.deletedAt) {
      throw new BadRequestError('Cannot update a deleted interview');
    }

    const cleanedInput = this.cleanEmptyStrings(input);

    const updated = await interviewRepository.updateById(id, {
      ...cleanedInput,
      updatedBy,
      updatedAt: new Date(),
    });

    return updated;
  }

  public async getInterview(id: string): Promise<InterviewDocument | null> {
    return interviewRepository.findById(id);
  }

  public async getInterviewByInterviewId(interviewId: string): Promise<InterviewDocument | null> {
    return interviewRepository.findByInterviewId(interviewId);
  }

  public async deleteInterview(id: string, deletedBy: string): Promise<void> {
    const interview = await interviewRepository.findById(id);
    if (!interview) {
      throw new NotFoundError('Interview not found');
    }

    if (interview.deletedAt) {
      throw new BadRequestError('Interview is already deleted');
    }

    await interviewRepository.softDelete(id, deletedBy);
  }

  public async listInterviews(query: InterviewQueryInput): Promise<{ items: InterviewDocument[]; total: number }> {
    const filter: Record<string, unknown> = {};

    if (query.search) {
      filter.$text = { $search: query.search };
    }

    if (query.applicationId) filter.applicationId = query.applicationId;
    if (query.result) filter.result = query.result;

    const sortOption: Record<string, 1 | -1> = {};
    if (query.sort) {
      sortOption[query.sort] = query.order === 'asc' ? 1 : -1;
    } else {
      sortOption.createdAt = -1;
    }

    return interviewRepository.listInterviews(filter, query.page, query.limit, sortOption);
  }

  public async searchInterviews(searchQuery: string, page = 1, limit = 20): Promise<{ items: InterviewDocument[]; total: number }> {
    return interviewRepository.searchInterviews(searchQuery, page, limit);
  }

  // ─── Offer ────────────────────────────────────────────────────────────────

  public async createOffer(input: CreateOfferInput, createdBy: string): Promise<OfferDocument> {
    const normalizedOfferId = input.offerId.trim().toUpperCase();
    const application = await applicationRepository.findById(input.applicationId);
    if (!application) {
      throw new BadRequestError('Application does not exist');
    }

    const existing = await offerRepository.findByApplication(input.applicationId);
    if (existing) {
      throw new ConflictError('An offer already exists for this application');
    }

    if (await offerRepository.findByOfferId(normalizedOfferId)) {
      throw new ConflictError('An offer with this offer ID already exists');
    }

    const cleanedInput = this.cleanEmptyStrings(input);

    return offerRepository.create({
      ...cleanedInput,
      offerId: normalizedOfferId,
      status: input.status || 'OFFERED',
      createdBy,
      updatedBy: createdBy,
    });
  }

  public async updateOffer(id: string, input: UpdateOfferInput, updatedBy: string): Promise<OfferDocument | null> {
    const offer = await offerRepository.findById(id);
    if (!offer) {
      throw new NotFoundError('Offer not found');
    }

    if (offer.deletedAt) {
      throw new BadRequestError('Cannot update a deleted offer');
    }

    const cleanedInput = this.cleanEmptyStrings(input);

    const updated = await offerRepository.updateById(id, {
      ...cleanedInput,
      updatedBy,
      updatedAt: new Date(),
    });

    return updated;
  }

  public async getOffer(id: string): Promise<OfferDocument | null> {
    return offerRepository.findById(id);
  }

  public async getOfferByOfferId(offerId: string): Promise<OfferDocument | null> {
    return offerRepository.findByOfferId(offerId);
  }

  public async deleteOffer(id: string, deletedBy: string): Promise<void> {
    const offer = await offerRepository.findById(id);
    if (!offer) {
      throw new NotFoundError('Offer not found');
    }

    if (offer.deletedAt) {
      throw new BadRequestError('Offer is already deleted');
    }

    await offerRepository.softDelete(id, deletedBy);
  }

  public async listOffers(query: OfferQueryInput): Promise<{ items: OfferDocument[]; total: number }> {
    const filter: Record<string, unknown> = {};

    if (query.search) {
      filter.$text = { $search: query.search };
    }

    if (query.applicationId) filter.applicationId = query.applicationId;
    if (query.status) filter.status = query.status;

    const sortOption: Record<string, 1 | -1> = {};
    if (query.sort) {
      sortOption[query.sort] = query.order === 'asc' ? 1 : -1;
    } else {
      sortOption.createdAt = -1;
    }

    return offerRepository.listOffers(filter, query.page, query.limit, sortOption);
  }

  public async searchOffers(searchQuery: string, page = 1, limit = 20): Promise<{ items: OfferDocument[]; total: number }> {
    return offerRepository.searchOffers(searchQuery, page, limit);
  }

  // ─── Placement ────────────────────────────────────────────────────────────

  public async createPlacement(input: CreatePlacementInput, createdBy: string): Promise<PlacementDocument> {
    const normalizedPlacementId = input.placementId.trim().toUpperCase();

    const offer = await offerRepository.findById(input.offerId);
    if (!offer) {
      throw new BadRequestError('Offer does not exist');
    }

    if (offer.status !== 'ACCEPTED') {
      throw new BadRequestError('Placement can only be created for accepted offers');
    }

    const existing = await placementRepository.findByStudent(input.studentId);
    if (existing) {
      throw new ConflictError('A placement record already exists for this student');
    }

    if (await placementRepository.findByPlacementId(normalizedPlacementId)) {
      throw new ConflictError('A placement with this placement ID already exists');
    }

    const cleanedInput = this.cleanEmptyStrings(input);

    return placementRepository.create({
      ...cleanedInput,
      placementId: normalizedPlacementId,
      status: input.status || 'PLACED',
      createdBy,
      updatedBy: createdBy,
    });
  }

  public async updatePlacement(id: string, input: UpdatePlacementInput, updatedBy: string): Promise<PlacementDocument | null> {
    const placement = await placementRepository.findById(id);
    if (!placement) {
      throw new NotFoundError('Placement not found');
    }

    if (placement.deletedAt) {
      throw new BadRequestError('Cannot update a deleted placement');
    }

    const cleanedInput = this.cleanEmptyStrings(input);

    const updated = await placementRepository.updateById(id, {
      ...cleanedInput,
      updatedBy,
      updatedAt: new Date(),
    });

    return updated;
  }

  public async getPlacement(id: string): Promise<PlacementDocument | null> {
    return placementRepository.findById(id);
  }

  public async getPlacementByPlacementId(placementId: string): Promise<PlacementDocument | null> {
    return placementRepository.findByPlacementId(placementId);
  }

  public async deletePlacement(id: string, deletedBy: string): Promise<void> {
    const placement = await placementRepository.findById(id);
    if (!placement) {
      throw new NotFoundError('Placement not found');
    }

    if (placement.deletedAt) {
      throw new BadRequestError('Placement is already deleted');
    }

    await placementRepository.softDelete(id, deletedBy);
  }

  public async listPlacements(query: PlacementQueryInput): Promise<{ items: PlacementDocument[]; total: number }> {
    const filter: Record<string, unknown> = {};

    if (query.search) {
      filter.$text = { $search: query.search };
    }

    if (query.studentId) filter.studentId = query.studentId;
    if (query.companyId) filter.companyId = query.companyId;
    if (query.driveId) filter.driveId = query.driveId;
    if (query.status) filter.status = query.status;

    const sortOption: Record<string, 1 | -1> = {};
    if (query.sort) {
      sortOption[query.sort] = query.order === 'asc' ? 1 : -1;
    } else {
      sortOption.createdAt = -1;
    }

    return placementRepository.listPlacements(filter, query.page, query.limit, sortOption);
  }

  public async searchPlacements(searchQuery: string, page = 1, limit = 20): Promise<{ items: PlacementDocument[]; total: number }> {
    return placementRepository.searchPlacements(searchQuery, page, limit);
  }

  // ─── Statistics ───────────────────────────────────────────────────────────

  public async getPlacementStatistics(_query?: StatisticsQueryInput): Promise<PlacementStatisticsDocument | null> {
    return placementStatisticsRepository.findLatest();
  }

  public async calculatePlacementStatistics(createdBy: string): Promise<PlacementStatisticsDocument> {
    const totalStudents = await applicationRepository.countDistinctStudents();
    const placedStudents = await placementRepository.count({ status: 'PLACED', deletedAt: { $exists: false } });
    const totalDrives = await driveRepository.count({ deletedAt: { $exists: false } });
    const activeDrives = await driveRepository.count({ status: { $in: ['SCHEDULED', 'REGISTRATION_OPEN', 'REGISTRATION_CLOSED'] }, deletedAt: { $exists: false } });
    const totalCompanies = await companyRepository.count({ deletedAt: { $exists: false } });
    const totalApplications = await applicationRepository.count({ deletedAt: { $exists: false } });
    const totalOffers = await offerRepository.count({ deletedAt: { $exists: false } });
    const acceptedOffers = await offerRepository.count({ status: 'ACCEPTED', deletedAt: { $exists: false } });
    const rejectedOffers = await offerRepository.count({ status: 'REJECTED', deletedAt: { $exists: false } });

    const placementPercentage = totalStudents > 0 ? Math.round((placedStudents / totalStudents) * 100) : 0;

    const companyWiseStats = await this.calculateCompanyWiseStats();

    const statistics = {
      totalStudents,
      placedStudents,
      placementPercentage,
      totalDrives,
      activeDrives,
      totalCompanies,
      totalApplications,
      totalOffers,
      acceptedOffers,
      rejectedOffers,
      companyWiseStats,
      calculatedAt: new Date(),
      createdBy,
      updatedBy: createdBy,
    };

    return placementStatisticsRepository.create(statistics as Parameters<typeof placementStatisticsRepository.create>[0]);
  }

  private async calculateCompanyWiseStats(): Promise<CompanyStat[]> {
    const stats: CompanyStat[] = [];

    const companies = await companyRepository.findMany({ deletedAt: { $exists: false } });
    for (const company of companies) {
      const drives = await driveRepository.findByCompany(company.id);
      const driveIds = drives.map(d => d.id);

      const applications = await applicationRepository.findMany({ driveId: { $in: driveIds }, deletedAt: { $exists: false } });
      const applicationIds = applications.map(a => a.id);

      const offers = await offerRepository.findMany({ applicationId: { $in: applicationIds }, status: 'ACCEPTED', deletedAt: { $exists: false } });

      const totalOffers = await offerRepository.count({ applicationId: { $in: applicationIds }, deletedAt: { $exists: false } });
      const acceptedOffers = offers.length;
      const avgPackage = offers.length > 0 ? Math.round(offers.reduce((sum, o) => sum + (o.packageAmount || 0), 0) / offers.length) : 0;

      stats.push({
        companyId: company.companyId,
        companyName: company.name,
        totalOffers,
        acceptedOffers,
        avgPackage,
      });
    }

    return stats;
  }

  // ─── Soft Delete / Restore ────────────────────────────────────────────────

  public async restoreCompany(id: string): Promise<CompanyDocument | null> {
    return companyRepository.restore(id);
  }

  public async restoreDrive(id: string): Promise<DriveDocument | null> {
    return driveRepository.restore(id);
  }

  public async restoreApplication(id: string): Promise<ApplicationDocument | null> {
    return applicationRepository.restore(id);
  }

  public async restoreInterview(id: string): Promise<InterviewDocument | null> {
    return interviewRepository.restore(id);
  }

  public async restoreOffer(id: string): Promise<OfferDocument | null> {
    return offerRepository.restore(id);
  }

  public async restorePlacement(id: string): Promise<PlacementDocument | null> {
    return placementRepository.restore(id);
  }

  // ─── Existence ────────────────────────────────────────────────────────────

  public async existsByCompanyId(companyId: string): Promise<boolean> {
    return companyRepository.exists({ companyId, deletedAt: { $exists: false } });
  }

  public async existsByDriveId(driveId: string): Promise<boolean> {
    return driveRepository.exists({ driveId, deletedAt: { $exists: false } });
  }

  public async existsByApplicationId(applicationId: string): Promise<boolean> {
    return applicationRepository.exists({ applicationId, deletedAt: { $exists: false } });
  }

  public async existsByInterviewId(interviewId: string): Promise<boolean> {
    return interviewRepository.exists({ interviewId, deletedAt: { $exists: false } });
  }

  public async existsByOfferId(offerId: string): Promise<boolean> {
    return offerRepository.exists({ offerId, deletedAt: { $exists: false } });
  }

  public async existsByPlacementId(placementId: string): Promise<boolean> {
    return placementRepository.exists({ placementId, deletedAt: { $exists: false } });
  }

  // ─── Private Helpers ──────────────────────────────────────────────────────

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

export const placementService = new PlacementService();
