import type { UserRole } from "../types/auth";

export type UserType = "student" | "faculty" | "admin" | "hod" | "parent" | "staff";

export function getUserType(role: UserRole): UserType {
  switch (role) {
    case "STUDENT":
      return "student";
    case "FACULTY":
      return "faculty";
    case "HOD":
      return "hod";
    case "ADMIN":
    case "SUPER_ADMIN":
      return "admin";
    case "PARENT":
      return "parent";
    case "STAFF":
      return "staff";
    default:
      return "student";
  }
}

export function getDefaultDashboardPath(userType: UserType): string {
  switch (userType) {
    case "student":
      return "/student/dashboard";
    case "faculty":
      return "/counsellor/dashboard";
    case "hod":
      return "/admin/dashboard";
    case "admin":
      return "/admin/dashboard";
    case "parent":
      return "/parent/dashboard";
    case "staff":
      return "/staff/dashboard";
    default:
      return "/student/dashboard";
  }
}

export function canAccessRole(userRole: UserRole, allowedRoles: UserRole[]): boolean {
  return allowedRoles.includes(userRole);
}

export function isAdminRole(role: UserRole): boolean {
  return role === "ADMIN" || role === "SUPER_ADMIN";
}

export function isCounselorRole(role: UserRole): boolean {
  return role === "FACULTY" || role === "HOD" || role === "ADMIN" || role === "SUPER_ADMIN";
}

export function isStudentRole(role: UserRole): boolean {
  return role === "STUDENT";
}

export function isApplicantRole(role: UserRole): boolean {
  return role === "STUDENT";
}
