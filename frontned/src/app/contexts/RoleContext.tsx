import { createContext, useContext } from "react";
import type { UserRole } from "../types/auth";
import {
  hasPermission,
  hasAnyPermission,
  hasAllPermissions,
  canAccessRole,
} from "../types/permission";

export interface RoleContextValue {
  role: UserRole | null;
  permissions: string[];
  hasPermission: (permission: string) => boolean;
  hasAnyPermission: (permissions: string[]) => boolean;
  hasAllPermissions: (permissions: string[]) => boolean;
  canAccessRole: (targetRole: UserRole) => boolean;
  isAdmin: boolean;
  isSuperAdmin: boolean;
  isAdmissionCommittee: boolean;
  isCounselor: boolean;
  isFaculty: boolean;
  isStudent: boolean;
  isSupport: boolean;
}

export const RoleContext = createContext<RoleContextValue | null>(null);

export function useRole(): RoleContextValue {
  const context = useContext(RoleContext);
  if (!context) {
    throw new Error("useRole must be used within a RoleProvider");
  }
  return context;
}

export function createRoleContextValue(
  role: UserRole | null,
  permissions: string[],
): RoleContextValue {
  return {
    role,
    permissions,
    hasPermission: (permission: string) => hasPermission(role as UserRole, permission),
    hasAnyPermission: (permissions: string[]) => hasAnyPermission(role as UserRole, permissions),
    hasAllPermissions: (permissions: string[]) => hasAllPermissions(role as UserRole, permissions),
    canAccessRole: (targetRole: UserRole) => canAccessRole(role as UserRole, targetRole),
    isAdmin: role === "ADMIN" || role === "SUPER_ADMIN",
    isSuperAdmin: role === "SUPER_ADMIN",
    isAdmissionCommittee:
      role === "ADMISSION_COMMITTEE" || role === "ADMIN" || role === "SUPER_ADMIN",
    isCounselor:
      role === "COUNSELOR" ||
      role === "ADMISSION_COMMITTEE" ||
      role === "ADMIN" ||
      role === "SUPER_ADMIN",
    isFaculty: role === "FACULTY" || role === "ADMIN" || role === "SUPER_ADMIN",
    isStudent: role === "STUDENT",
    isSupport:
      role === "SUPPORT" ||
      role === "COUNSELOR" ||
      role === "ADMISSION_COMMITTEE" ||
      role === "ADMIN" ||
      role === "SUPER_ADMIN",
  };
}
