import bcrypt from 'bcryptjs';

const SALT_ROUNDS = 12;

/** Hashes a plaintext password using bcrypt. */
export const hashPassword = async (plainPassword: string): Promise<string> =>
  bcrypt.hash(plainPassword, SALT_ROUNDS);

/** Compares a plaintext password against a stored bcrypt hash. */
export const verifyPassword = async (
  plainPassword: string,
  passwordHash: string,
): Promise<boolean> => bcrypt.compare(plainPassword, passwordHash);
