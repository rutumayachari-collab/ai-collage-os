import { Schema, model, type HydratedDocument, type Model } from 'mongoose';
import { ALL_USER_ROLES, UserRole, type UserRoleValue } from '../../shared/constants';

export interface UserSchemaType {
  fullName: string;
  email: string;
  passwordHash: string;
  role: UserRoleValue;
  isActive: boolean;
  lastLoginAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  emailVerified: boolean;
  emailVerificationToken?: string;
  emailVerificationExpires?: Date;
  passwordResetToken?: string;
  passwordResetExpires?: Date;
  refreshToken?: string;
  refreshTokenExpires?: Date;
}

export type UserDocument = HydratedDocument<UserSchemaType>;

const userSchema = new Schema<UserSchemaType>(
  {
    fullName: { type: String, required: true, trim: true, maxlength: 120 },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    passwordHash: { type: String, required: true, select: false },
    role: {
      type: String,
      required: true,
      enum: ALL_USER_ROLES as unknown as string[],
      default: UserRole.STUDENT,
    },
    isActive: { type: Boolean, required: true, default: true },
    lastLoginAt: { type: Date },
    emailVerified: { type: Boolean, required: true, default: false },
    emailVerificationToken: { type: String, select: false },
    emailVerificationExpires: { type: Date, select: false },
    passwordResetToken: { type: String, select: false },
    passwordResetExpires: { type: Date, select: false },
    refreshToken: { type: String, select: false },
    refreshTokenExpires: { type: Date, select: false },
  },
  {
    timestamps: true,
    versionKey: false,
    toJSON: {
      transform: (_doc, ret: Record<string, unknown>) => {
        ret.id = ret._id;
        delete ret._id;
        delete ret.passwordHash;
        delete ret.refreshToken;
        delete ret.refreshTokenExpires;
        delete ret.passwordResetToken;
        delete ret.passwordResetExpires;
        delete ret.emailVerificationToken;
        delete ret.emailVerificationExpires;
        return ret;
      },
    },
  },
);

userSchema.index({ refreshToken: 1 });
userSchema.index({ passwordResetToken: 1 });
userSchema.index({ emailVerificationToken: 1 });
userSchema.index({ refreshTokenExpires: 1 }, { expireAfterSeconds: 0 });
userSchema.index({ passwordResetExpires: 1 }, { expireAfterSeconds: 0 });
userSchema.index({ emailVerificationExpires: 1 }, { expireAfterSeconds: 0 });

export const UserModel: Model<UserSchemaType> = model<UserSchemaType>('User', userSchema);
