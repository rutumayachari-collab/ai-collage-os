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
  STUDENT: {
    id: "student",
    name: "Student",
    description: "Access to own profile, application, and admission workflow",
    permissions: [
      "profile:read",
      "profile:update",
      "applications:read",
      "applications:create",
      "documents:read",
      "documents:create",
      "eligibility:read",
      "fees:read",
      "payments:read",
    ],
  },
  FACULTY: {
    id: "faculty",
    name: "Faculty / Counsellor",
    description: "Manage inquiries, applicants, documents, eligibility, and admissions",
    permissions: [
      "inquiries:read",
      "inquiries:create",
      "inquiries:update",
      "applications:read",
      "applications:create",
      "applications:update",
      "documents:read",
      "documents:update",
      "documents:verify",
      "eligibility:read",
      "eligibility:update",
      "admissions:read",
      "admissions:create",
      "admissions:update",
      "admissions:approve",
      "admissions:reject",
      "students:read",
    ],
  },
  HOD: {
    id: "hod",
    name: "HOD",
    description: "Department head access for academic and admission operations",
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
  PARENT: {
    id: "parent",
    name: "Parent",
    description: "Access to own children's records",
    permissions: ["students:read", "fees:read"],
  },
  STAFF: {
    id: "staff",
    name: "Staff",
    description: "General staff access",
    permissions: ["inquiries:read", "applications:read"],
  },
};

export const ROLE_HIERARCHY: Record<UserRole, UserRole[]> = {
  STUDENT: [],
  PARENT: [],
  STAFF: [],
  FACULTY: ["STUDENT", "PARENT", "STAFF"],
  HOD: ["FACULTY", "STUDENT", "PARENT", "STAFF"],
  ADMIN: ["HOD", "FACULTY", "STUDENT", "PARENT", "STAFF"],
  SUPER_ADMIN: ["ADMIN", "HOD", "FACULTY", "STUDENT", "PARENT", "STAFF"],
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
