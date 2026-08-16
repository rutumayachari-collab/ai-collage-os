"use client";

import { Link, useLocation } from "@tanstack/react-router";
import { cn } from "@/lib/utils";
import { useAuth } from "@/app/hooks/useAuth";
import { getUserType, type UserType } from "@/app/utils/role";
import {
  HiOutlineHome,
  HiOutlineDocumentText,
  HiOutlineAcademicCap,
  HiOutlineCurrencyRupee,
  HiOutlineCheckCircle,
  HiOutlineUserGroup,
  HiOutlinePhone,
  HiOutlineBell,
  HiOutlineCog6Tooth,
  HiOutlineSparkles,
  HiOutlineCalendar,
  HiOutlineBookOpen,
  HiOutlineClipboard,
  HiOutlineBuildingOffice,
} from "react-icons/hi2";
import { AnimatedBrand } from "@/app/components/brand/AnimatedBrand";

const iconMap: Record<string, React.ReactNode> = {
  LayoutDashboard: <HiOutlineHome className="h-5 w-5" />,
  DocumentText: <HiOutlineDocumentText className="h-5 w-5" />,
  AcademicCap: <HiOutlineAcademicCap className="h-5 w-5" />,
  CurrencyRupee: <HiOutlineCurrencyRupee className="h-5 w-5" />,
  CheckCircle: <HiOutlineCheckCircle className="h-5 w-5" />,
  UserGroup: <HiOutlineUserGroup className="h-5 w-5" />,
  Phone: <HiOutlinePhone className="h-5 w-5" />,
  Bell: <HiOutlineBell className="h-5 w-5" />,
  Cog6Tooth: <HiOutlineCog6Tooth className="h-5 w-5" />,
  Sparkles: <HiOutlineSparkles className="h-5 w-5" />,
  Calendar: <HiOutlineCalendar className="h-5 w-5" />,
  BookOpen: <HiOutlineBookOpen className="h-5 w-5" />,
  ClipboardList: <HiOutlineClipboard className="h-5 w-5" />,
  BuildingOffice: <HiOutlineBuildingOffice className="h-5 w-5" />,
};

const STUDENT_NAV = [
  { path: "/student/dashboard", label: "Dashboard", icon: "LayoutDashboard" },
  { path: "/student/profile", label: "My Profile", icon: "UserGroup" },
  { path: "/student/campus", label: "My Campus", icon: "BuildingOffice" },
  { path: "/student/academics", label: "Academics", icon: "BookOpen" },
  { path: "/student/timetable", label: "Timetable", icon: "Calendar" },
  { path: "/student/attendance", label: "Attendance", icon: "CheckCircle" },
  { path: "/student/courses", label: "Courses", icon: "BookOpen" },
  { path: "/student/exams", label: "Exams", icon: "ClipboardList" },
  { path: "/student/assignments", label: "Assignments", icon: "DocumentText" },
  { path: "/student/fees", label: "Fees", icon: "CurrencyRupee" },
  { path: "/student/scholarships", label: "Scholarships", icon: "AcademicCap" },
  { path: "/student/events", label: "Events", icon: "Calendar" },
  { path: "/student/documents", label: "Documents", icon: "DocumentText" },
  { path: "/student/future", label: "My Future", icon: "Sparkles" },
  { path: "/ai/copilot", label: "AI Assistant", icon: "Sparkles" },
  { path: "/notifications", label: "Notifications", icon: "Bell" },
  { path: "/student/settings", label: "Settings", icon: "Cog6Tooth" },
];

const FACULTY_NAV = [
  { path: "/counsellor/dashboard", label: "Dashboard", icon: "LayoutDashboard" },
  { path: "/counsellor/leads", label: "Leads", icon: "UserGroup" },
  { path: "/inquiries", label: "Inquiries", icon: "DocumentText" },
  { path: "/applicants", label: "Applicants", icon: "UserGroup" },
  { path: "/counsellor/followups", label: "Follow-ups", icon: "Calendar" },
  { path: "/outreach", label: "Calling Agent", icon: "Phone" },
  { path: "/counsellor/workspace", label: "Workspace", icon: "Sparkles" },
  { path: "/counsellor/call-history", label: "Call History", icon: "Phone" },
  { path: "/counsellor/calls", label: "All Calls", icon: "Calendar" },
  { path: "/documents", label: "Documents", icon: "DocumentText" },
  { path: "/faculty/eligibility", label: "Eligibility", icon: "CheckCircle" },
  { path: "/faculty/admissions", label: "Admissions", icon: "AcademicCap" },
  { path: "/ai/copilot", label: "AI Copilot", icon: "Sparkles" },
  { path: "/notifications", label: "Notifications", icon: "Bell" },
  { path: "/counsellor/profile", label: "Profile", icon: "Cog6Tooth" },
  { path: "/counsellor/settings", label: "Settings", icon: "Cog6Tooth" },
];

const ADMIN_NAV = [
  { path: "/admin/dashboard", label: "Dashboard", icon: "LayoutDashboard" },
  { path: "/admin/applicants", label: "Applicants", icon: "UserGroup" },
  { path: "/admin/students", label: "Students", icon: "UserGroup" },
  { path: "/admin/counsellors", label: "Counsellors", icon: "UserGroup" },
  { path: "/faculty", label: "Faculty", icon: "UserGroup" },
  { path: "/admin/courses", label: "Courses", icon: "BookOpen" },
  { path: "/admin/departments", label: "Departments", icon: "BuildingOffice" },
  { path: "/subjects", label: "Subjects", icon: "BookOpen" },
  { path: "/inquiries", label: "Inquiries", icon: "DocumentText" },
  { path: "/admin/admissions", label: "Admissions", icon: "AcademicCap" },
  { path: "/admin/documents", label: "Documents", icon: "DocumentText" },
  { path: "/admin/eligibility", label: "Eligibility", icon: "CheckCircle" },
  { path: "/admin/payments", label: "Payments", icon: "CurrencyRupee" },
  { path: "/admin/notifications", label: "Notifications", icon: "Bell" },
  { path: "/outreach", label: "Calling", icon: "Phone" },
  { path: "/ai/copilot", label: "AI", icon: "Sparkles" },
  { path: "/orchestrator", label: "Orchestrator", icon: "Cog6Tooth" },
  { path: "/admin/analytics", label: "Analytics", icon: "CheckCircle" },
  { path: "/admin/reports", label: "Reports", icon: "DocumentText" },
  { path: "/settings", label: "Settings", icon: "Cog6Tooth" },
];

const HOD_NAV = [
  { path: "/admin/dashboard", label: "Dashboard", icon: "LayoutDashboard" },
  { path: "/admin/applicants", label: "Applicants", icon: "UserGroup" },
  { path: "/admin/students", label: "Students", icon: "UserGroup" },
  { path: "/faculty", label: "Faculty", icon: "UserGroup" },
  { path: "/admin/courses", label: "Courses", icon: "BookOpen" },
  { path: "/admin/departments", label: "Departments", icon: "BuildingOffice" },
  { path: "/subjects", label: "Subjects", icon: "BookOpen" },
  { path: "/inquiries", label: "Inquiries", icon: "DocumentText" },
  { path: "/admin/admissions", label: "Admissions", icon: "AcademicCap" },
  { path: "/admin/documents", label: "Documents", icon: "DocumentText" },
  { path: "/admin/eligibility", label: "Eligibility", icon: "CheckCircle" },
  { path: "/admin/payments", label: "Payments", icon: "CurrencyRupee" },
  { path: "/admin/notifications", label: "Notifications", icon: "Bell" },
  { path: "/outreach", label: "Calling", icon: "Phone" },
  { path: "/ai/copilot", label: "AI", icon: "Sparkles" },
  { path: "/orchestrator", label: "Orchestrator", icon: "Cog6Tooth" },
  { path: "/settings", label: "Settings", icon: "Cog6Tooth" },
];

const PARENT_NAV = [
  { path: "/parent/dashboard", label: "Dashboard", icon: "LayoutDashboard" },
  { path: "/notifications", label: "Notifications", icon: "Bell" },
  { path: "/settings", label: "Settings", icon: "Cog6Tooth" },
];

const STAFF_NAV = [
  { path: "/staff/dashboard", label: "Dashboard", icon: "LayoutDashboard" },
  { path: "/inquiries", label: "Inquiries", icon: "DocumentText" },
  { path: "/notifications", label: "Notifications", icon: "Bell" },
  { path: "/settings", label: "Settings", icon: "Cog6Tooth" },
];

interface RoleSidebarProps {
  open: boolean;
  onClose: () => void;
}

export function RoleSidebar({ open, onClose }: RoleSidebarProps) {
  const location = useLocation();
  const { user } = useAuth();
  const userType = getUserType(user?.role || "STUDENT");

  let navItems;
  switch (userType) {
    case "student":
      navItems = STUDENT_NAV;
      break;
    case "faculty":
      navItems = FACULTY_NAV;
      break;
    case "hod":
      navItems = HOD_NAV;
      break;
    case "admin":
      navItems = ADMIN_NAV;
      break;
    case "parent":
      navItems = PARENT_NAV;
      break;
    case "staff":
      navItems = STAFF_NAV;
      break;
    default:
      navItems = STUDENT_NAV;
  }

  const isActive = (path: string) => {
    if (
      path === "/dashboard" ||
      path === "/student/dashboard" ||
      path === "/counsellor/dashboard" ||
      path === "/admin/dashboard"
    ) {
      return location.pathname === path;
    }
    return location.pathname === path || location.pathname.startsWith(path + "/");
  };

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden md:flex md:w-64 md:flex-col md:border-r md:bg-card">
        <div className="flex h-16 items-center gap-2 px-4">
          <AnimatedBrand size="sm" />
        </div>
        <nav className="flex-1 space-y-1 overflow-y-auto p-3">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                isActive(item.path)
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
              )}
              onClick={onClose}
            >
              {iconMap[item.icon] || <HiOutlineHome className="h-5 w-5" />}
              {item.label}
            </Link>
          ))}
        </nav>
      </aside>

      {/* Mobile overlay */}
      {open && <div className="fixed inset-0 z-40 bg-black/50 md:hidden" onClick={onClose} />}

      {/* Mobile sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-64 transform bg-card border-r transition-transform duration-300 md:hidden",
          open ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex h-16 items-center justify-between border-b px-4">
          <div className="flex items-center gap-2">
            <AnimatedBrand size="sm" />
          </div>
          <button onClick={onClose} className="rounded-lg p-2 hover:bg-accent">
            <span className="sr-only">Close menu</span>
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
        <nav className="flex-1 space-y-1 overflow-y-auto p-3">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                isActive(item.path)
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
              )}
              onClick={onClose}
            >
              {iconMap[item.icon] || <HiOutlineHome className="h-5 w-5" />}
              {item.label}
            </Link>
          ))}
        </nav>
      </aside>
    </>
  );
}
