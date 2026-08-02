import { z } from 'zod';
import { Types } from 'mongoose';

/** MongoDB ObjectId validator usable in any module schema. */
export const objectIdSchema = z
  .string()
  .refine((value) => Types.ObjectId.isValid(value), { message: 'Invalid identifier' });

export const emailSchema = z.string().trim().toLowerCase().email('A valid email is required');

export const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .max(128, 'Password must be at most 128 characters')
  .regex(/[a-z]/, 'Password must contain a lowercase letter')
  .regex(/[A-Z]/, 'Password must contain an uppercase letter')
  .regex(/\d/, 'Password must contain a number');

export const phoneSchema = z
  .string()
  .trim()
  .regex(/^\+?[0-9]{7,15}$/, 'A valid phone number is required');

export const idParamSchema = z.object({ id: objectIdSchema });
