import type { AuthenticatedRequest } from '../../shared/types';
import type { Request, Response } from 'express';
import { HttpStatus } from '../../shared/constants';
import { asyncHandler, sendSuccess } from '../../shared/utils';
import { placementService } from './placement.service';
import { NotFoundError, UnauthorizedError } from '../../shared/utils/api-error.util';
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

export class PlacementController {
  constructor(private readonly service: typeof placementService = placementService) {}

  // ─── Company ──────────────────────────────────────────────────────────────

  public createCompany = asyncHandler(async (req: Request, res: Response) => {
    const input = req.body as CreateCompanyInput;
    const user = (req as AuthenticatedRequest).user;
    if (!user) {
      throw new UnauthorizedError('Authentication required');
    }
    const company = await this.service.createCompany(input, user.id);
    sendSuccess(res, {
      message: 'Company created successfully',
      data: company,
      statusCode: HttpStatus.CREATED,
    });
  });

  public updateCompany = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const input = req.body as UpdateCompanyInput;
    const user = (req as AuthenticatedRequest).user;
    if (!user) {
      throw new UnauthorizedError('Authentication required');
    }
    const company = await this.service.updateCompany(id, input, user.id);
    if (!company) {
      throw new NotFoundError('Company not found');
    }
    sendSuccess(res, { message: 'Company updated successfully', data: company });
  });

  public findCompanyById = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const company = await this.service.getCompany(id);
    if (!company) {
      throw new NotFoundError('Company not found');
    }
    sendSuccess(res, { message: 'Company fetched successfully', data: company });
  });

  public findCompanyByCompanyId = asyncHandler(async (req: Request, res: Response) => {
    const { companyId } = req.params;
    const company = await this.service.getCompanyByCompanyId(companyId);
    if (!company) {
      throw new NotFoundError('Company not found');
    }
    sendSuccess(res, { message: 'Company fetched successfully', data: company });
  });

  public deleteCompany = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const user = (req as AuthenticatedRequest).user;
    if (!user) {
      throw new UnauthorizedError('Authentication required');
    }
    await this.service.deleteCompany(id, user.id);
    sendSuccess(res, { message: 'Company deleted successfully' });
  });

  public listCompanies = asyncHandler(async (req: Request, res: Response) => {
    const query = req.query as unknown as CompanyQueryInput;
    const { items, total } = await this.service.listCompanies(query);
    sendSuccess(res, {
      message: 'Companies fetched successfully',
      data: items,
      meta: {
        page: query.page,
        limit: query.limit,
        total,
        totalPages: Math.ceil(total / query.limit),
        hasNextPage: query.page < Math.ceil(total / query.limit),
        hasPreviousPage: query.page > 1,
      },
    });
  });

  public searchCompanies = asyncHandler(async (req: Request, res: Response) => {
    const query = req.query as unknown as CompanyQueryInput;
    const { items, total } = await this.service.searchCompanies(query.search || '', query.page, query.limit);
    sendSuccess(res, {
      message: 'Search results fetched successfully',
      data: items,
      meta: {
        page: query.page,
        limit: query.limit,
        total,
        totalPages: Math.ceil(total / query.limit),
        hasNextPage: query.page < Math.ceil(total / query.limit),
        hasPreviousPage: query.page > 1,
      },
    });
  });

  public restoreCompany = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const user = (req as AuthenticatedRequest).user;
    if (!user) {
      throw new UnauthorizedError('Authentication required');
    }
    const company = await this.service.restoreCompany(id);
    if (!company) {
      throw new NotFoundError('Company not found');
    }
    sendSuccess(res, { message: 'Company restored successfully', data: company });
  });

  // ─── Drive ────────────────────────────────────────────────────────────────

  public createDrive = asyncHandler(async (req: Request, res: Response) => {
    const input = req.body as CreateDriveInput;
    const user = (req as AuthenticatedRequest).user;
    if (!user) {
      throw new UnauthorizedError('Authentication required');
    }
    const drive = await this.service.createDrive(input, user.id);
    sendSuccess(res, {
      message: 'Drive created successfully',
      data: drive,
      statusCode: HttpStatus.CREATED,
    });
  });

  public updateDrive = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const input = req.body as UpdateDriveInput;
    const user = (req as AuthenticatedRequest).user;
    if (!user) {
      throw new UnauthorizedError('Authentication required');
    }
    const drive = await this.service.updateDrive(id, input, user.id);
    if (!drive) {
      throw new NotFoundError('Drive not found');
    }
    sendSuccess(res, { message: 'Drive updated successfully', data: drive });
  });

  public findDriveById = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const drive = await this.service.getDrive(id);
    if (!drive) {
      throw new NotFoundError('Drive not found');
    }
    sendSuccess(res, { message: 'Drive fetched successfully', data: drive });
  });

  public findDriveByDriveId = asyncHandler(async (req: Request, res: Response) => {
    const { driveId } = req.params;
    const drive = await this.service.getDriveByDriveId(driveId);
    if (!drive) {
      throw new NotFoundError('Drive not found');
    }
    sendSuccess(res, { message: 'Drive fetched successfully', data: drive });
  });

  public deleteDrive = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const user = (req as AuthenticatedRequest).user;
    if (!user) {
      throw new UnauthorizedError('Authentication required');
    }
    await this.service.deleteDrive(id, user.id);
    sendSuccess(res, { message: 'Drive deleted successfully' });
  });

  public listDrives = asyncHandler(async (req: Request, res: Response) => {
    const query = req.query as unknown as DriveQueryInput;
    const { items, total } = await this.service.listDrives(query);
    sendSuccess(res, {
      message: 'Drives fetched successfully',
      data: items,
      meta: {
        page: query.page,
        limit: query.limit,
        total,
        totalPages: Math.ceil(total / query.limit),
        hasNextPage: query.page < Math.ceil(total / query.limit),
        hasPreviousPage: query.page > 1,
      },
    });
  });

  public searchDrives = asyncHandler(async (req: Request, res: Response) => {
    const query = req.query as unknown as DriveQueryInput;
    const { items, total } = await this.service.searchDrives(query.search || '', query.page, query.limit);
    sendSuccess(res, {
      message: 'Search results fetched successfully',
      data: items,
      meta: {
        page: query.page,
        limit: query.limit,
        total,
        totalPages: Math.ceil(total / query.limit),
        hasNextPage: query.page < Math.ceil(total / query.limit),
        hasPreviousPage: query.page > 1,
      },
    });
  });

  public restoreDrive = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const user = (req as AuthenticatedRequest).user;
    if (!user) {
      throw new UnauthorizedError('Authentication required');
    }
    const drive = await this.service.restoreDrive(id);
    if (!drive) {
      throw new NotFoundError('Drive not found');
    }
    sendSuccess(res, { message: 'Drive restored successfully', data: drive });
  });

  // ─── Application ──────────────────────────────────────────────────────────

  public createApplication = asyncHandler(async (req: Request, res: Response) => {
    const input = req.body as CreateApplicationInput;
    const user = (req as AuthenticatedRequest).user;
    if (!user) {
      throw new UnauthorizedError('Authentication required');
    }
    const application = await this.service.createApplication(input, user.id);
    sendSuccess(res, {
      message: 'Application created successfully',
      data: application,
      statusCode: HttpStatus.CREATED,
    });
  });

  public updateApplication = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const input = req.body as UpdateApplicationInput;
    const user = (req as AuthenticatedRequest).user;
    if (!user) {
      throw new UnauthorizedError('Authentication required');
    }
    const application = await this.service.updateApplication(id, input, user.id);
    if (!application) {
      throw new NotFoundError('Application not found');
    }
    sendSuccess(res, { message: 'Application updated successfully', data: application });
  });

  public findApplicationById = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const application = await this.service.getApplication(id);
    if (!application) {
      throw new NotFoundError('Application not found');
    }
    sendSuccess(res, { message: 'Application fetched successfully', data: application });
  });

  public findApplicationByApplicationId = asyncHandler(async (req: Request, res: Response) => {
    const { applicationId } = req.params;
    const application = await this.service.getApplicationByApplicationId(applicationId);
    if (!application) {
      throw new NotFoundError('Application not found');
    }
    sendSuccess(res, { message: 'Application fetched successfully', data: application });
  });

  public deleteApplication = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const user = (req as AuthenticatedRequest).user;
    if (!user) {
      throw new UnauthorizedError('Authentication required');
    }
    await this.service.deleteApplication(id, user.id);
    sendSuccess(res, { message: 'Application deleted successfully' });
  });

  public listApplications = asyncHandler(async (req: Request, res: Response) => {
    const query = req.query as unknown as ApplicationQueryInput;
    const user = (req as AuthenticatedRequest).user;
    const { items, total } = await this.service.listApplications(query, user?.role, user?.id);
    sendSuccess(res, {
      message: 'Applications fetched successfully',
      data: items,
      meta: {
        page: query.page,
        limit: query.limit,
        total,
        totalPages: Math.ceil(total / query.limit),
        hasNextPage: query.page < Math.ceil(total / query.limit),
        hasPreviousPage: query.page > 1,
      },
    });
  });

  public searchApplications = asyncHandler(async (req: Request, res: Response) => {
    const query = req.query as unknown as ApplicationQueryInput;
    const user = (req as AuthenticatedRequest).user;
    const { items, total } = await this.service.searchApplications(query.search || '', query.page, query.limit, user?.role, user?.id);
    sendSuccess(res, {
      message: 'Search results fetched successfully',
      data: items,
      meta: {
        page: query.page,
        limit: query.limit,
        total,
        totalPages: Math.ceil(total / query.limit),
        hasNextPage: query.page < Math.ceil(total / query.limit),
        hasPreviousPage: query.page > 1,
      },
    });
  });

  public restoreApplication = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const user = (req as AuthenticatedRequest).user;
    if (!user) {
      throw new UnauthorizedError('Authentication required');
    }
    const application = await this.service.restoreApplication(id);
    if (!application) {
      throw new NotFoundError('Application not found');
    }
    sendSuccess(res, { message: 'Application restored successfully', data: application });
  });

  // ─── Interview ────────────────────────────────────────────────────────────

  public createInterview = asyncHandler(async (req: Request, res: Response) => {
    const input = req.body as CreateInterviewInput;
    const user = (req as AuthenticatedRequest).user;
    if (!user) {
      throw new UnauthorizedError('Authentication required');
    }
    const interview = await this.service.createInterview(input, user.id);
    sendSuccess(res, {
      message: 'Interview created successfully',
      data: interview,
      statusCode: HttpStatus.CREATED,
    });
  });

  public updateInterview = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const input = req.body as UpdateInterviewInput;
    const user = (req as AuthenticatedRequest).user;
    if (!user) {
      throw new UnauthorizedError('Authentication required');
    }
    const interview = await this.service.updateInterview(id, input, user.id);
    if (!interview) {
      throw new NotFoundError('Interview not found');
    }
    sendSuccess(res, { message: 'Interview updated successfully', data: interview });
  });

  public findInterviewById = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const interview = await this.service.getInterview(id);
    if (!interview) {
      throw new NotFoundError('Interview not found');
    }
    sendSuccess(res, { message: 'Interview fetched successfully', data: interview });
  });

  public findInterviewByInterviewId = asyncHandler(async (req: Request, res: Response) => {
    const { interviewId } = req.params;
    const interview = await this.service.getInterviewByInterviewId(interviewId);
    if (!interview) {
      throw new NotFoundError('Interview not found');
    }
    sendSuccess(res, { message: 'Interview fetched successfully', data: interview });
  });

  public deleteInterview = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const user = (req as AuthenticatedRequest).user;
    if (!user) {
      throw new UnauthorizedError('Authentication required');
    }
    await this.service.deleteInterview(id, user.id);
    sendSuccess(res, { message: 'Interview deleted successfully' });
  });

  public listInterviews = asyncHandler(async (req: Request, res: Response) => {
    const query = req.query as unknown as InterviewQueryInput;
    const { items, total } = await this.service.listInterviews(query);
    sendSuccess(res, {
      message: 'Interviews fetched successfully',
      data: items,
      meta: {
        page: query.page,
        limit: query.limit,
        total,
        totalPages: Math.ceil(total / query.limit),
        hasNextPage: query.page < Math.ceil(total / query.limit),
        hasPreviousPage: query.page > 1,
      },
    });
  });

  public searchInterviews = asyncHandler(async (req: Request, res: Response) => {
    const query = req.query as unknown as InterviewQueryInput;
    const { items, total } = await this.service.searchInterviews(query.search || '', query.page, query.limit);
    sendSuccess(res, {
      message: 'Search results fetched successfully',
      data: items,
      meta: {
        page: query.page,
        limit: query.limit,
        total,
        totalPages: Math.ceil(total / query.limit),
        hasNextPage: query.page < Math.ceil(total / query.limit),
        hasPreviousPage: query.page > 1,
      },
    });
  });

  public restoreInterview = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const user = (req as AuthenticatedRequest).user;
    if (!user) {
      throw new UnauthorizedError('Authentication required');
    }
    const interview = await this.service.restoreInterview(id);
    if (!interview) {
      throw new NotFoundError('Interview not found');
    }
    sendSuccess(res, { message: 'Interview restored successfully', data: interview });
  });

  // ─── Offer ────────────────────────────────────────────────────────────────

  public createOffer = asyncHandler(async (req: Request, res: Response) => {
    const input = req.body as CreateOfferInput;
    const user = (req as AuthenticatedRequest).user;
    if (!user) {
      throw new UnauthorizedError('Authentication required');
    }
    const offer = await this.service.createOffer(input, user.id);
    sendSuccess(res, {
      message: 'Offer created successfully',
      data: offer,
      statusCode: HttpStatus.CREATED,
    });
  });

  public updateOffer = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const input = req.body as UpdateOfferInput;
    const user = (req as AuthenticatedRequest).user;
    if (!user) {
      throw new UnauthorizedError('Authentication required');
    }
    const offer = await this.service.updateOffer(id, input, user.id);
    if (!offer) {
      throw new NotFoundError('Offer not found');
    }
    sendSuccess(res, { message: 'Offer updated successfully', data: offer });
  });

  public findOfferById = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const offer = await this.service.getOffer(id);
    if (!offer) {
      throw new NotFoundError('Offer not found');
    }
    sendSuccess(res, { message: 'Offer fetched successfully', data: offer });
  });

  public findOfferByOfferId = asyncHandler(async (req: Request, res: Response) => {
    const { offerId } = req.params;
    const offer = await this.service.getOfferByOfferId(offerId);
    if (!offer) {
      throw new NotFoundError('Offer not found');
    }
    sendSuccess(res, { message: 'Offer fetched successfully', data: offer });
  });

  public deleteOffer = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const user = (req as AuthenticatedRequest).user;
    if (!user) {
      throw new UnauthorizedError('Authentication required');
    }
    await this.service.deleteOffer(id, user.id);
    sendSuccess(res, { message: 'Offer deleted successfully' });
  });

  public listOffers = asyncHandler(async (req: Request, res: Response) => {
    const query = req.query as unknown as OfferQueryInput;
    const { items, total } = await this.service.listOffers(query);
    sendSuccess(res, {
      message: 'Offers fetched successfully',
      data: items,
      meta: {
        page: query.page,
        limit: query.limit,
        total,
        totalPages: Math.ceil(total / query.limit),
        hasNextPage: query.page < Math.ceil(total / query.limit),
        hasPreviousPage: query.page > 1,
      },
    });
  });

  public searchOffers = asyncHandler(async (req: Request, res: Response) => {
    const query = req.query as unknown as OfferQueryInput;
    const { items, total } = await this.service.searchOffers(query.search || '', query.page, query.limit);
    sendSuccess(res, {
      message: 'Search results fetched successfully',
      data: items,
      meta: {
        page: query.page,
        limit: query.limit,
        total,
        totalPages: Math.ceil(total / query.limit),
        hasNextPage: query.page < Math.ceil(total / query.limit),
        hasPreviousPage: query.page > 1,
      },
    });
  });

  public restoreOffer = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const user = (req as AuthenticatedRequest).user;
    if (!user) {
      throw new UnauthorizedError('Authentication required');
    }
    const offer = await this.service.restoreOffer(id);
    if (!offer) {
      throw new NotFoundError('Offer not found');
    }
    sendSuccess(res, { message: 'Offer restored successfully', data: offer });
  });

  // ─── Placement ────────────────────────────────────────────────────────────

  public createPlacement = asyncHandler(async (req: Request, res: Response) => {
    const input = req.body as CreatePlacementInput;
    const user = (req as AuthenticatedRequest).user;
    if (!user) {
      throw new UnauthorizedError('Authentication required');
    }
    const placement = await this.service.createPlacement(input, user.id);
    sendSuccess(res, {
      message: 'Placement created successfully',
      data: placement,
      statusCode: HttpStatus.CREATED,
    });
  });

  public updatePlacement = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const input = req.body as UpdatePlacementInput;
    const user = (req as AuthenticatedRequest).user;
    if (!user) {
      throw new UnauthorizedError('Authentication required');
    }
    const placement = await this.service.updatePlacement(id, input, user.id);
    if (!placement) {
      throw new NotFoundError('Placement not found');
    }
    sendSuccess(res, { message: 'Placement updated successfully', data: placement });
  });

  public findPlacementById = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const placement = await this.service.getPlacement(id);
    if (!placement) {
      throw new NotFoundError('Placement not found');
    }
    sendSuccess(res, { message: 'Placement fetched successfully', data: placement });
  });

  public findPlacementByPlacementId = asyncHandler(async (req: Request, res: Response) => {
    const { placementId } = req.params;
    const placement = await this.service.getPlacementByPlacementId(placementId);
    if (!placement) {
      throw new NotFoundError('Placement not found');
    }
    sendSuccess(res, { message: 'Placement fetched successfully', data: placement });
  });

  public deletePlacement = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const user = (req as AuthenticatedRequest).user;
    if (!user) {
      throw new UnauthorizedError('Authentication required');
    }
    await this.service.deletePlacement(id, user.id);
    sendSuccess(res, { message: 'Placement deleted successfully' });
  });

  public listPlacements = asyncHandler(async (req: Request, res: Response) => {
    const query = req.query as unknown as PlacementQueryInput;
    const { items, total } = await this.service.listPlacements(query);
    sendSuccess(res, {
      message: 'Placements fetched successfully',
      data: items,
      meta: {
        page: query.page,
        limit: query.limit,
        total,
        totalPages: Math.ceil(total / query.limit),
        hasNextPage: query.page < Math.ceil(total / query.limit),
        hasPreviousPage: query.page > 1,
      },
    });
  });

  public searchPlacements = asyncHandler(async (req: Request, res: Response) => {
    const query = req.query as unknown as PlacementQueryInput;
    const { items, total } = await this.service.searchPlacements(query.search || '', query.page, query.limit);
    sendSuccess(res, {
      message: 'Search results fetched successfully',
      data: items,
      meta: {
        page: query.page,
        limit: query.limit,
        total,
        totalPages: Math.ceil(total / query.limit),
        hasNextPage: query.page < Math.ceil(total / query.limit),
        hasPreviousPage: query.page > 1,
      },
    });
  });

  public restorePlacement = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const user = (req as AuthenticatedRequest).user;
    if (!user) {
      throw new UnauthorizedError('Authentication required');
    }
    const placement = await this.service.restorePlacement(id);
    if (!placement) {
      throw new NotFoundError('Placement not found');
    }
    sendSuccess(res, { message: 'Placement restored successfully', data: placement });
  });

  // ─── Statistics ───────────────────────────────────────────────────────────

  public getPlacementStatistics = asyncHandler(async (req: Request, res: Response) => {
    const query = req.query as unknown as StatisticsQueryInput;
    const statistics = await this.service.getPlacementStatistics(query);
    if (!statistics) {
      throw new NotFoundError('No statistics available');
    }
    sendSuccess(res, { message: 'Placement statistics fetched successfully', data: statistics });
  });

  public calculatePlacementStatistics = asyncHandler(async (req: Request, res: Response) => {
    const user = (req as AuthenticatedRequest).user;
    if (!user) {
      throw new UnauthorizedError('Authentication required');
    }
    const statistics = await this.service.calculatePlacementStatistics(user.id);
    sendSuccess(res, { message: 'Placement statistics calculated successfully', data: statistics });
  });
}

export const placementController = new PlacementController();
