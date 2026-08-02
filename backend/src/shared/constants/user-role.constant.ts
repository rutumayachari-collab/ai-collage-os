/**
 * Role identifiers used by the authentication/authorization foundation.
 */
export const UserRole = {
  SUPER_ADMIN: 'SUPER_ADMIN',
  ADMIN: 'ADMIN',
  HOD: 'HOD',
  FACULTY: 'FACULTY',
  STUDENT: 'STUDENT',
  PARENT: 'PARENT',
  STAFF: 'STAFF',
} as const;

export type UserRoleValue = (typeof UserRole)[keyof typeof UserRole];

export const ALL_USER_ROLES: readonly UserRoleValue[] = Object.values(UserRole);
