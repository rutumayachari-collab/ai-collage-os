import type {
  FilterQuery,
  HydratedDocument,
  Model,
  ProjectionType,
  QueryOptions,
  UpdateQuery,
} from 'mongoose';
import { toSkip } from '../utils/pagination.util';

export interface PaginatedResult<TDoc> {
  items: TDoc[];
  total: number;
}

/**
 * Generic data-access layer. Feature modules extend this class instead of
 * calling Mongoose models directly, keeping persistence details out of services.
 */
export abstract class BaseRepository<TSchema> {
  protected constructor(protected readonly model: Model<TSchema>) {}

  async create(payload: Partial<TSchema>): Promise<HydratedDocument<TSchema>> {
    const created = await this.model.create(payload);
    return created as HydratedDocument<TSchema>;
  }

  async findById(
    id: string,
    projection?: ProjectionType<TSchema>,
  ): Promise<HydratedDocument<TSchema> | null> {
    return this.model.findById(id, projection).exec();
  }

  async findOne(
    filter: FilterQuery<TSchema>,
    projection?: ProjectionType<TSchema>,
  ): Promise<HydratedDocument<TSchema> | null> {
    return this.model.findOne(filter, projection).exec();
  }

  async findMany(
    filter: FilterQuery<TSchema> = {},
    options: QueryOptions<TSchema> = {},
  ): Promise<HydratedDocument<TSchema>[]> {
    return this.model.find(filter, null, options).exec();
  }

  async paginate(
    filter: FilterQuery<TSchema>,
    page: number,
    limit: number,
    sort: Record<string, 1 | -1> = { createdAt: -1 },
  ): Promise<PaginatedResult<HydratedDocument<TSchema>>> {
    const [items, total] = await Promise.all([
      this.model.find(filter).sort(sort).skip(toSkip(page, limit)).limit(limit).exec(),
      this.model.countDocuments(filter).exec(),
    ]);

    return { items, total };
  }

  async updateById(
    id: string,
    update: UpdateQuery<TSchema>,
  ): Promise<HydratedDocument<TSchema> | null> {
    return this.model.findByIdAndUpdate(id, update, { new: true, runValidators: true }).exec();
  }

  async deleteById(id: string): Promise<boolean> {
    const result = await this.model.findByIdAndDelete(id).exec();
    return result !== null;
  }

  async exists(filter: FilterQuery<TSchema>): Promise<boolean> {
    const found = await this.model.exists(filter);
    return found !== null;
  }

  async count(filter: FilterQuery<TSchema> = {}): Promise<number> {
    return this.model.countDocuments(filter).exec();
  }
}
