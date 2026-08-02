import crypto from 'node:crypto';
import { BaseRepository } from '../../shared/repositories/base.repository';
import { UserModel, type UserDocument, type UserSchemaType } from './auth.model';

const TOKEN_HASH_ALGO = 'sha256';

function hashToken(token: string): string {
  return crypto.createHash(TOKEN_HASH_ALGO).update(token).digest('hex');
}

export class UserRepository extends BaseRepository<UserSchemaType> {
  constructor() {
    super(UserModel);
  }

  public async findByEmail(email: string, withPassword = false): Promise<UserDocument | null> {
    const query = this.model.findOne({ email: email.toLowerCase() });
    if (withPassword) {
      query.select('+passwordHash');
    }
    return query.exec();
  }

  public async touchLastLogin(userId: string): Promise<void> {
    await this.model.updateOne({ _id: userId }, { $set: { lastLoginAt: new Date() } }).exec();
  }

  public async findByRefreshToken(token: string): Promise<UserDocument | null> {
    return this.model
      .findOne({ refreshToken: hashToken(token), refreshTokenExpires: { $gt: new Date() } })
      .select('+refreshToken')
      .exec();
  }

  public async findByPasswordResetToken(token: string): Promise<UserDocument | null> {
    return this.model
      .findOne({ passwordResetToken: hashToken(token), passwordResetExpires: { $gt: new Date() } })
      .select('+passwordResetToken')
      .exec();
  }

  public async findByEmailVerificationToken(token: string): Promise<UserDocument | null> {
    return this.model
      .findOne({ emailVerificationToken: hashToken(token), emailVerificationExpires: { $gt: new Date() } })
      .select('+emailVerificationToken')
      .exec();
  }

  public async setRefreshToken(userId: string, token: string, expires: Date): Promise<void> {
    await this.model.updateOne({ _id: userId }, { $set: { refreshToken: hashToken(token), refreshTokenExpires: expires } }).exec();
  }

  public async clearRefreshToken(userId: string): Promise<void> {
    await this.model.updateOne({ _id: userId }, { $unset: { refreshToken: '', refreshTokenExpires: '' } }).exec();
  }

  public async setPasswordResetToken(userId: string, token: string, expires: Date): Promise<void> {
    await this.model
      .updateOne({ _id: userId }, { $set: { passwordResetToken: hashToken(token), passwordResetExpires: expires } })
      .exec();
  }

  public async clearPasswordResetToken(userId: string): Promise<void> {
    await this.model
      .updateOne({ _id: userId }, { $unset: { passwordResetToken: '', passwordResetExpires: '' } })
      .exec();
  }

  public async setEmailVerificationToken(userId: string, token: string): Promise<void> {
    const expires = new Date(Date.now() + 24 * 60 * 60 * 1000);
    await this.model
      .updateOne({ _id: userId }, { $set: { emailVerificationToken: hashToken(token), emailVerificationExpires: expires } })
      .exec();
  }

  public async clearEmailVerificationToken(userId: string): Promise<void> {
    await this.model
      .updateOne({ _id: userId }, { $unset: { emailVerificationToken: '', emailVerificationExpires: '' } })
      .exec();
  }

  public async setEmailVerified(userId: string): Promise<void> {
    await this.model.updateOne({ _id: userId }, { $set: { emailVerified: true } }).exec();
  }
}

export const userRepository = new UserRepository();
