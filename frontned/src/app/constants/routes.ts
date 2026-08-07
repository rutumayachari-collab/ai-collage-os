import type { UserRole } from "../types/auth";
import type { Permission, RoleDefinition } from "../types/permission";

export interface RouteDefinition {
  path: string;
  label: string;
  icon?: string;
  requiresAuth?: boolean;
  requiredRole?: UserRole[];
  requiredPermission?: string[];
  children?: RouteDefinition[];
  hidden?: boolean;
}

export const APP_ROUTES: RouteDefinition[] = [
  {
    path: "/dashboard",
    label: "Dashboard",
    requiresAuth: true,
    icon: "LayoutDashboard",
  },
  {
    path: "/inquiries",
    label: "Inquiries",
    requiresAuth: true,
    requiredRole: ["SUPPORT", "COUNSELOR", "ADMISSION_COMMITTEE", "ADMIN", "SUPER_ADMIN"],
    requiredPermission: ["inquiries:read"],
    children: [
      {
        path: "/inquiries/new",
        label: "New Inquiry",
        requiresAuth: true,
        requiredPermission: ["inquiries:create"],
      },
      {
        path: "/inquiries/:id",
        label: "View Inquiry",
        requiresAuth: true,
        requiredPermission: ["inquiries:read"],
      },
    ],
  },
  {
    path: "/applicants",
    label: "Applicants",
    requiresAuth: true,
    requiredRole: ["COUNSELOR", "ADMISSION_COMMITTEE", "ADMIN", "SUPER_ADMIN"],
    requiredPermission: ["applications:read"],
    children: [
      {
        path: "/applicants/new",
        label: "New Applicant",
        requiresAuth: true,
        requiredPermission: ["applications:create"],
      },
      {
        path: "/applicants/:id",
        label: "View Applicant",
        requiresAuth: true,
        requiredPermission: ["applications:read"],
      },
    ],
  },
  {
    path: "/documents",
    label: "Documents",
    requiresAuth: true,
    requiredRole: ["COUNSELOR", "ADMISSION_COMMITTEE", "ADMIN", "SUPER_ADMIN"],
    requiredPermission: ["documents:read"],
    children: [
      {
        path: "/documents/:id/verify",
        label: "Verify Document",
        requiresAuth: true,
        requiredPermission: ["documents:verify"],
      },
    ],
  },
  {
    path: "/eligibility",
    label: "Eligibility",
    requiresAuth: true,
    requiredRole: ["ADMISSION_COMMITTEE", "ADMIN", "SUPER_ADMIN"],
    requiredPermission: ["eligibility:read"],
    children: [
      {
        path: "/eligibility/:applicantId",
        label: "Check Eligibility",
        requiresAuth: true,
        requiredPermission: ["eligibility:update"],
      },
    ],
  },
  {
    path: "/admissions",
    label: "Admissions",
    requiresAuth: true,
    requiredRole: ["ADMISSION_COMMITTEE", "ADMIN", "SUPER_ADMIN"],
    requiredPermission: ["admissions:read"],
    children: [
      {
        path: "/admissions/:id",
        label: "View Admission",
        requiresAuth: true,
        requiredPermission: ["admissions:read"],
      },
      {
        path: "/admissions/pending",
        label: "Pending Approvals",
        requiresAuth: true,
        requiredPermission: ["admissions:approve"],
      },
    ],
  },
  {
    path: "/faculty",
    label: "Faculty",
    requiresAuth: true,
    requiredRole: ["FACULTY", "ADMISSION_COMMITTEE", "ADMIN", "SUPER_ADMIN"],
    requiredPermission: ["faculty:read"],
    children: [
      {
        path: "/faculty/applicants",
        label: "Applicant Review",
        requiresAuth: true,
        requiredPermission: ["applications:read"],
      },
      {
        path: "/faculty/verification",
        label: "Verification Queue",
        requiresAuth: true,
        requiredPermission: ["documents:verify"],
      },
      {
        path: "/faculty/eligibility",
        label: "Eligibility Queue",
        requiresAuth: true,
        requiredPermission: ["eligibility:read"],
      },
      {
        path: "/faculty/admissions",
        label: "Admission Queue",
        requiresAuth: true,
        requiredPermission: ["admissions:read"],
      },
      {
        path: "/faculty/notifications",
        label: "Notifications",
        requiresAuth: true,
      },
      {
        path: "/faculty/ai-copilot/:applicantId",
        label: "AI Copilot",
        requiresAuth: true,
        requiredPermission: ["applications:read"],
      },
    ],
  },
  {
    path: "/admin",
    label: "Admin",
    requiresAuth: true,
    requiredRole: ["ADMIN", "SUPER_ADMIN"],
    requiredPermission: ["admin:read"],
    children: [
      {
        path: "/admin",
        label: "Dashboard",
        requiresAuth: true,
      },
      {
        path: "/admin/analytics",
        label: "Analytics",
        requiresAuth: true,
      },
      {
        path: "/admin/reports",
        label: "Reports",
        requiresAuth: true,
      },
      {
        path: "/admin/settings",
        label: "Settings",
        requiresAuth: true,
      },
    ],
  },
  {
    path: "/ai",
    label: "AI Services",
    requiresAuth: true,
    requiredRole: ["ADMIN", "SUPER_ADMIN", "COUNSELOR", "FACULTY"],
    children: [
      {
        path: "/ai/copilot",
        label: "AI Copilot",
        requiresAuth: true,
        requiredPermission: ["ai:read"],
      },
      {
        path: "/ai/ocr",
        label: "OCR Processing",
        requiresAuth: true,
        requiredPermission: ["ocr:read"],
      },
    ],
  },
  {
    path: "/payments",
    label: "Payments",
    requiresAuth: true,
    requiredRole: ["ADMIN", "SUPER_ADMIN", "STUDENT"],
    requiredPermission: ["payments:read"],
    children: [
      {
        path: "/payments/history",
        label: "Payment History",
        requiresAuth: true,
        requiredPermission: ["payments:read"],
      },
      {
        path: "/payments/summary",
        label: "Payment Summary",
        requiresAuth: true,
        requiredPermission: ["payments:read"],
      },
    ],
  },
  {
    path: "/notifications",
    label: "Notifications",
    requiresAuth: true,
  },
  {
    path: "/students",
    label: "Students",
    requiresAuth: true,
    requiredRole: ["SUPPORT", "FACULTY", "ADMISSION_COMMITTEE", "ADMIN", "SUPER_ADMIN"],
    requiredPermission: ["students:read"],
    children: [
      {
        path: "/students/new",
        label: "New Student",
        requiresAuth: true,
        requiredPermission: ["students:create"],
      },
      {
        path: "/students/:id",
        label: "View Student",
        requiresAuth: true,
        requiredPermission: ["students:read"],
      },
    ],
  },
  {
    path: "/departments",
    label: "Departments",
    requiresAuth: true,
    requiredRole: ["ADMIN", "SUPER_ADMIN"],
    requiredPermission: ["departments:read"],
  },
  {
    path: "/courses",
    label: "Courses",
    requiresAuth: true,
    requiredRole: ["ADMIN", "SUPER_ADMIN", "FACULTY"],
    requiredPermission: ["courses:read"],
  },
  {
    path: "/faculty",
    label: "Faculty",
    requiresAuth: true,
    requiredRole: ["ADMIN", "SUPER_ADMIN"],
    requiredPermission: ["faculty:read"],
  },
  {
    path: "/subjects",
    label: "Subjects",
    requiresAuth: true,
    requiredRole: ["ADMIN", "SUPER_ADMIN", "FACULTY"],
    requiredPermission: ["subjects:read"],
  },
  {
    path: "/exams",
    label: "Exams",
    requiresAuth: true,
    requiredRole: ["FACULTY", "ADMISSION_COMMITTEE", "ADMIN", "SUPER_ADMIN"],
    requiredPermission: ["exams:read"],
  },
  {
    path: "/fees",
    label: "Fees",
    requiresAuth: true,
    requiredRole: ["ADMIN", "SUPER_ADMIN", "STUDENT"],
    requiredPermission: ["fees:read"],
  },
  {
    path: "/attendance",
    label: "Attendance",
    requiresAuth: true,
    requiredRole: ["FACULTY", "ADMIN", "SUPER_ADMIN"],
    requiredPermission: ["attendance:read"],
  },
  {
    path: "/hostel",
    label: "Hostel",
    requiresAuth: true,
    requiredRole: ["ADMIN", "SUPER_ADMIN", "STUDENT"],
    requiredPermission: ["hostel:read"],
  },
  {
    path: "/transport",
    label: "Transport",
    requiresAuth: true,
    requiredRole: ["ADMIN", "SUPER_ADMIN", "STUDENT"],
    requiredPermission: ["transport:read"],
  },
  {
    path: "/library",
    label: "Library",
    requiresAuth: true,
    requiredRole: ["ADMIN", "SUPER_ADMIN", "STUDENT"],
    requiredPermission: ["library:read"],
  },
  {
    path: "/placements",
    label: "Placements",
    requiresAuth: true,
    requiredRole: ["ADMIN", "SUPER_ADMIN", "FACULTY", "STUDENT"],
    requiredPermission: ["placements:read"],
  },
  {
    path: "/notifications",
    label: "Notifications",
    requiresAuth: true,
  },
  {
    path: "/settings",
    label: "Settings",
    requiresAuth: true,
    requiredRole: ["ADMIN", "SUPER_ADMIN"],
  },
];

export const PUBLIC_ROUTES = ["/", "/login", "/forgot-password", "/reset-password"];
