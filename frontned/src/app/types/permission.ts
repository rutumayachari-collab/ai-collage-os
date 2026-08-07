import type { UserRole } from "./auth";

export type Permission = {
  id: string;
  name: string;
  description: string;
  resource: string;
  action: "CREATE" | "READ" | "UPDATE" | "DELETE" | "MANAGE";
};

export type RoleDefinition = {
  id: string;
  name: string;
  description: string;
  permissions: string[];
};

export const ROLES: Record<UserRole, RoleDefinition> = {
  SUPPORT: {
    id: "support",
    name: "Support",
    description: "Read-only access to student records for support purposes",
    permissions: ["students:read", "inquiries:read", "applications:read"],
  },
  STUDENT: {
    id: "student",
    name: "Student",
    description: "Access to own profile and academic records",
    permissions: [
      "profile:read",
      "profile:update",
      "applications:read",
      "documents:read",
      "fees:read",
    ],
  },
  COUNSELOR: {
    id: "counselor",
    name: "Counselor",
    description: "Manage inquiries and initial document verification",
    permissions: [
      "inquiries:read",
      "inquiries:create",
      "inquiries:update",
      "applications:read",
      "applications:create",
      "documents:read",
      "documents:update",
      "documents:verify",
    ],
  },
  FACULTY: {
    id: "faculty",
    name: "Faculty",
    description: "View assigned courses, students, and attendance",
    permissions: [
      "courses:read",
      "students:read",
      "attendance:read",
      "attendance:update",
      "exams:read",
      "grades:read",
      "grades:update",
    ],
  },
  ADMISSION_COMMITTEE: {
    id: "admission_committee",
    name: "Admission Committee",
    description: "Review and approve admissions, manage waiting lists",
    permissions: [
      "applications:read",
      "applications:update",
      "documents:read",
      "documents:verify",
      "eligibility:read",
      "eligibility:update",
      "admissions:read",
      "admissions:create",
      "admissions:update",
      "admissions:approve",
      "admissions:reject",
      "students:create",
      "students:read",
    ],
  },
  ADMIN: {
    id: "admin",
    name: "Admin",
    description: "Full access to all modules except system settings",
    permissions: ["*"],
  },
  SUPER_ADMIN: {
    id: "super_admin",
    name: "Super Admin",
    description: "Unrestricted access to all modules and system settings",
    permissions: ["*"],
  },
};

export const ROLE_HIERARCHY: Record<UserRole, UserRole[]> = {
  SUPPORT: [],
  STUDENT: [],
  COUNSELOR: ["SUPPORT"],
  FACULTY: ["SUPPORT", "STUDENT"],
  ADMISSION_COMMITTEE: ["COUNSELOR", "FACULTY", "SUPPORT", "STUDENT"],
  ADMIN: ["ADMISSION_COMMITTEE", "COUNSELOR", "FACULTY", "SUPPORT", "STUDENT"],
  SUPER_ADMIN: ["ADMIN", "ADMISSION_COMMITTEE", "COUNSELOR", "FACULTY", "SUPPORT", "STUDENT"],
};

export function hasPermission(userRole: UserRole, requiredPermission: string): boolean {
  const role = ROLES[userRole];
  if (!role) return false;
  if (role.permissions.includes("*")) return true;
  return role.permissions.includes(requiredPermission);
}

export function hasAnyPermission(userRole: UserRole, permissions: string[]): boolean {
  return permissions.some((p) => hasPermission(userRole, p));
}

export function hasAllPermissions(userRole: UserRole, permissions: string[]): boolean {
  return permissions.every((p) => hasPermission(userRole, p));
}

export function canAccessRole(userRole: UserRole, targetRole: UserRole): boolean {
  const hierarchy = ROLE_HIERARCHY[userRole] || [];
  return userRole === targetRole || hierarchy.includes(targetRole);
}
