import { BaseRepository } from '../../shared/repositories/base.repository';
import {
  CompanyModel,
  DriveModel,
  ApplicationModel,
  InterviewModel,
  OfferModel,
  PlacementModel,
  PlacementStatisticsModel,
  type CompanyDocument,
  type DriveDocument,
  type ApplicationDocument,
  type InterviewDocument,
  type OfferDocument,
  type PlacementDocument,
  type PlacementStatisticsDocument,
  type CompanySchemaType,
  type DriveSchemaType,
  type ApplicationSchemaType,
  type InterviewSchemaType,
  type OfferSchemaType,
  type PlacementSchemaType,
  type PlacementStatisticsSchemaType,
} from './placement.model';

export class CompanyRepository extends BaseRepository<CompanySchemaType> {
  constructor() {
    super(CompanyModel);
  }

  public async findByCompanyId(companyId: string): Promise<CompanyDocument | null> {
    return this.model.findOne({ companyId, deletedAt: { $exists: false } }).exec();
  }

  public async findByName(name: string): Promise<CompanyDocument | null> {
    return this.model.findOne({ name: name.trim(), deletedAt: { $exists: false } }).exec();
  }

  public async listCompanies(filter: Record<string, unknown> = {}, page = 1, limit = 20, sort: Record<string, 1 | -1> = { createdAt: -1 }): Promise<{ items: CompanyDocument[]; total: number }> {
    const query = { ...filter, deletedAt: { $exists: false } };
    return this.paginate(query, page, limit, sort);
  }

  public async searchCompanies(searchQuery: string, page = 1, limit = 20): Promise<{ items: CompanyDocument[]; total: number }> {
    const filter = { $text: { $search: searchQuery }, deletedAt: { $exists: false } };
    const sort = { score: { $meta: 'textScore' } };
    const [items, total] = await Promise.all([
      this.model.find(filter).sort(sort as unknown as Record<string, 1 | -1>).skip((page - 1) * limit).limit(limit).exec(),
      this.model.countDocuments(filter).exec(),
    ]);
    return { items, total };
  }

  public async softDelete(companyId: string, deletedBy: string): Promise<boolean> {
    const result = await this.model.updateOne({ _id: companyId }, { $set: { deletedAt: new Date(), deletedBy } }).exec();
    return result.modifiedCount > 0;
  }

  public async restore(companyId: string): Promise<CompanyDocument | null> {
    const result = await this.model.updateOne({ _id: companyId }, { $unset: { deletedAt: '', deletedBy: '' } }).exec();
    if (result.modifiedCount > 0) {
      return this.model.findById(companyId).exec();
    }
    return null;
  }

  public async existsByCompanyId(companyId: string): Promise<boolean> {
    return this.exists({ companyId, deletedAt: { $exists: false } });
  }
}

export class DriveRepository extends BaseRepository<DriveSchemaType> {
  constructor() {
    super(DriveModel);
  }

  public async findByDriveId(driveId: string): Promise<DriveDocument | null> {
    return this.model.findOne({ driveId, deletedAt: { $exists: false } }).exec();
  }

  public async findByCompany(companyId: string): Promise<DriveDocument[]> {
    return this.model.find({ companyId, deletedAt: { $exists: false } }).exec();
  }

  public async listDrives(filter: Record<string, unknown> = {}, page = 1, limit = 20, sort: Record<string, 1 | -1> = { createdAt: -1 }): Promise<{ items: DriveDocument[]; total: number }> {
    const query = { ...filter, deletedAt: { $exists: false } };
    return this.paginate(query, page, limit, sort);
  }

  public async searchDrives(searchQuery: string, page = 1, limit = 20): Promise<{ items: DriveDocument[]; total: number }> {
    const filter = { $text: { $search: searchQuery }, deletedAt: { $exists: false } };
    const sort = { score: { $meta: 'textScore' } };
    const [items, total] = await Promise.all([
      this.model.find(filter).sort(sort as unknown as Record<string, 1 | -1>).skip((page - 1) * limit).limit(limit).exec(),
      this.model.countDocuments(filter).exec(),
    ]);
    return { items, total };
  }

  public async softDelete(driveId: string, deletedBy: string): Promise<boolean> {
    const result = await this.model.updateOne({ _id: driveId }, { $set: { deletedAt: new Date(), deletedBy } }).exec();
    return result.modifiedCount > 0;
  }

  public async restore(driveId: string): Promise<DriveDocument | null> {
    const result = await this.model.updateOne({ _id: driveId }, { $unset: { deletedAt: '', deletedBy: '' } }).exec();
    if (result.modifiedCount > 0) {
      return this.model.findById(driveId).exec();
    }
    return null;
  }

  public async existsByDriveId(driveId: string): Promise<boolean> {
    return this.exists({ driveId, deletedAt: { $exists: false } });
  }
}

export class ApplicationRepository extends BaseRepository<ApplicationSchemaType> {
  constructor() {
    super(ApplicationModel);
  }

  public async findByApplicationId(applicationId: string): Promise<ApplicationDocument | null> {
    return this.model.findOne({ applicationId, deletedAt: { $exists: false } }).exec();
  }

  public async findByStudent(studentId: string): Promise<ApplicationDocument[]> {
    return this.model.find({ studentId, deletedAt: { $exists: false } }).exec();
  }

  public async findByDrive(driveId: string): Promise<ApplicationDocument[]> {
    return this.model.find({ driveId, deletedAt: { $exists: false } }).exec();
  }

  public async findStudentApplication(studentId: string, driveId: string): Promise<ApplicationDocument | null> {
    return this.model.findOne({ studentId, driveId, deletedAt: { $exists: false } }).exec();
  }

  public async listApplications(filter: Record<string, unknown> = {}, page = 1, limit = 20, sort: Record<string, 1 | -1> = { createdAt: -1 }): Promise<{ items: ApplicationDocument[]; total: number }> {
    const query = { ...filter, deletedAt: { $exists: false } };
    return this.paginate(query, page, limit, sort);
  }

  public async searchApplications(searchQuery: string, page = 1, limit = 20): Promise<{ items: ApplicationDocument[]; total: number }> {
    const filter = { $text: { $search: searchQuery }, deletedAt: { $exists: false } };
    const sort = { score: { $meta: 'textScore' } };
    const [items, total] = await Promise.all([
      this.model.find(filter).sort(sort as unknown as Record<string, 1 | -1>).skip((page - 1) * limit).limit(limit).exec(),
      this.model.countDocuments(filter).exec(),
    ]);
    return { items, total };
  }

  public async softDelete(applicationId: string, deletedBy: string): Promise<boolean> {
    const result = await this.model.updateOne({ _id: applicationId }, { $set: { deletedAt: new Date(), deletedBy } }).exec();
    return result.modifiedCount > 0;
  }

  public async restore(applicationId: string): Promise<ApplicationDocument | null> {
    const result = await this.model.updateOne({ _id: applicationId }, { $unset: { deletedAt: '', deletedBy: '' } }).exec();
    if (result.modifiedCount > 0) {
      return this.model.findById(applicationId).exec();
    }
    return null;
  }

  public async existsByApplicationId(applicationId: string): Promise<boolean> {
    return this.exists({ applicationId, deletedAt: { $exists: false } });
  }

  public async countDistinctStudents(): Promise<number> {
    return this.model.distinct('studentId', { deletedAt: { $exists: false } }).then((ids) => ids.length);
  }
}

export class InterviewRepository extends BaseRepository<InterviewSchemaType> {
  constructor() {
    super(InterviewModel);
  }

  public async findByInterviewId(interviewId: string): Promise<InterviewDocument | null> {
    return this.model.findOne({ interviewId, deletedAt: { $exists: false } }).exec();
  }

  public async findByApplication(applicationId: string): Promise<InterviewDocument[]> {
    return this.model.find({ applicationId, deletedAt: { $exists: false } }).exec();
  }

  public async listInterviews(filter: Record<string, unknown> = {}, page = 1, limit = 20, sort: Record<string, 1 | -1> = { createdAt: -1 }): Promise<{ items: InterviewDocument[]; total: number }> {
    const query = { ...filter, deletedAt: { $exists: false } };
    return this.paginate(query, page, limit, sort);
  }

  public async searchInterviews(searchQuery: string, page = 1, limit = 20): Promise<{ items: InterviewDocument[]; total: number }> {
    const filter = { $text: { $search: searchQuery }, deletedAt: { $exists: false } };
    const sort = { score: { $meta: 'textScore' } };
    const [items, total] = await Promise.all([
      this.model.find(filter).sort(sort as unknown as Record<string, 1 | -1>).skip((page - 1) * limit).limit(limit).exec(),
      this.model.countDocuments(filter).exec(),
    ]);
    return { items, total };
  }

  public async softDelete(interviewId: string, deletedBy: string): Promise<boolean> {
    const result = await this.model.updateOne({ _id: interviewId }, { $set: { deletedAt: new Date(), deletedBy } }).exec();
    return result.modifiedCount > 0;
  }

  public async restore(interviewId: string): Promise<InterviewDocument | null> {
    const result = await this.model.updateOne({ _id: interviewId }, { $unset: { deletedAt: '', deletedBy: '' } }).exec();
    if (result.modifiedCount > 0) {
      return this.model.findById(interviewId).exec();
    }
    return null;
  }

  public async existsByInterviewId(interviewId: string): Promise<boolean> {
    return this.exists({ interviewId, deletedAt: { $exists: false } });
  }
}

export class OfferRepository extends BaseRepository<OfferSchemaType> {
  constructor() {
    super(OfferModel);
  }

  public async findByOfferId(offerId: string): Promise<OfferDocument | null> {
    return this.model.findOne({ offerId, deletedAt: { $exists: false } }).exec();
  }

  public async findByApplication(applicationId: string): Promise<OfferDocument | null> {
    return this.model.findOne({ applicationId, deletedAt: { $exists: false } }).exec();
  }

  public async listOffers(filter: Record<string, unknown> = {}, page = 1, limit = 20, sort: Record<string, 1 | -1> = { createdAt: -1 }): Promise<{ items: OfferDocument[]; total: number }> {
    const query = { ...filter, deletedAt: { $exists: false } };
    return this.paginate(query, page, limit, sort);
  }

  public async searchOffers(searchQuery: string, page = 1, limit = 20): Promise<{ items: OfferDocument[]; total: number }> {
    const filter = { $text: { $search: searchQuery }, deletedAt: { $exists: false } };
    const sort = { score: { $meta: 'textScore' } };
    const [items, total] = await Promise.all([
      this.model.find(filter).sort(sort as unknown as Record<string, 1 | -1>).skip((page - 1) * limit).limit(limit).exec(),
      this.model.countDocuments(filter).exec(),
    ]);
    return { items, total };
  }

  public async softDelete(offerId: string, deletedBy: string): Promise<boolean> {
    const result = await this.model.updateOne({ _id: offerId }, { $set: { deletedAt: new Date(), deletedBy } }).exec();
    return result.modifiedCount > 0;
  }

  public async restore(offerId: string): Promise<OfferDocument | null> {
    const result = await this.model.updateOne({ _id: offerId }, { $unset: { deletedAt: '', deletedBy: '' } }).exec();
    if (result.modifiedCount > 0) {
      return this.model.findById(offerId).exec();
    }
    return null;
  }

  public async existsByOfferId(offerId: string): Promise<boolean> {
    return this.exists({ offerId, deletedAt: { $exists: false } });
  }
}

export class PlacementRepository extends BaseRepository<PlacementSchemaType> {
  constructor() {
    super(PlacementModel);
  }

  public async findByPlacementId(placementId: string): Promise<PlacementDocument | null> {
    return this.model.findOne({ placementId, deletedAt: { $exists: false } }).exec();
  }

  public async findByStudent(studentId: string): Promise<PlacementDocument | null> {
    return this.model.findOne({ studentId, deletedAt: { $exists: false } }).exec();
  }

  public async findByCompany(companyId: string): Promise<PlacementDocument[]> {
    return this.model.find({ companyId, deletedAt: { $exists: false } }).exec();
  }

  public async listPlacements(filter: Record<string, unknown> = {}, page = 1, limit = 20, sort: Record<string, 1 | -1> = { createdAt: -1 }): Promise<{ items: PlacementDocument[]; total: number }> {
    const query = { ...filter, deletedAt: { $exists: false } };
    return this.paginate(query, page, limit, sort);
  }

  public async searchPlacements(searchQuery: string, page = 1, limit = 20): Promise<{ items: PlacementDocument[]; total: number }> {
    const filter = { $text: { $search: searchQuery }, deletedAt: { $exists: false } };
    const sort = { score: { $meta: 'textScore' } };
    const [items, total] = await Promise.all([
      this.model.find(filter).sort(sort as unknown as Record<string, 1 | -1>).skip((page - 1) * limit).limit(limit).exec(),
      this.model.countDocuments(filter).exec(),
    ]);
    return { items, total };
  }

  public async softDelete(placementId: string, deletedBy: string): Promise<boolean> {
    const result = await this.model.updateOne({ _id: placementId }, { $set: { deletedAt: new Date(), deletedBy } }).exec();
    return result.modifiedCount > 0;
  }

  public async restore(placementId: string): Promise<PlacementDocument | null> {
    const result = await this.model.updateOne({ _id: placementId }, { $unset: { deletedAt: '', deletedBy: '' } }).exec();
    if (result.modifiedCount > 0) {
      return this.model.findById(placementId).exec();
    }
    return null;
  }

  public async existsByPlacementId(placementId: string): Promise<boolean> {
    return this.exists({ placementId, deletedAt: { $exists: false } });
  }
}

export class PlacementStatisticsRepository extends BaseRepository<PlacementStatisticsSchemaType> {
  constructor() {
    super(PlacementStatisticsModel);
  }

  public async findLatest(): Promise<PlacementStatisticsDocument | null> {
    return this.model.findOne({ deletedAt: { $exists: false } }).sort({ calculatedAt: -1 }).exec();
  }

  public async listStatistics(filter: Record<string, unknown> = {}, page = 1, limit = 20, sort: Record<string, 1 | -1> = { createdAt: -1 }): Promise<{ items: PlacementStatisticsDocument[]; total: number }> {
    const query = { ...filter, deletedAt: { $exists: false } };
    return this.paginate(query, page, limit, sort);
  }
}

export const companyRepository = new CompanyRepository();
export const driveRepository = new DriveRepository();
export const applicationRepository = new ApplicationRepository();
export const interviewRepository = new InterviewRepository();
export const offerRepository = new OfferRepository();
export const placementRepository = new PlacementRepository();
export const placementStatisticsRepository = new PlacementStatisticsRepository();
