"use client";

import { Link, useLocation } from "@tanstack/react-router";
import { cn } from "@/lib/utils";
import { APP_ROUTES } from "@/app/constants/routes";
import { useRole } from "@/app/contexts/RoleContext";
import { HiOutlineSparkles, HiOutlineHome } from "react-icons/hi";
import {
  HiOutlineUserGroup,
  HiOutlineDocumentText,
  HiOutlineCheckCircle,
  HiOutlineAcademicCap,
  HiOutlineUsers,
  HiOutlineBookOpen,
  HiOutlineClipboard,
  HiOutlineCurrencyRupee,
  HiOutlineCalendar,
  HiOutlineBuildingOffice,
  HiOutlineTruck,
  HiOutlinePlay,
  HiOutlineBriefcase,
  HiOutlineBell,
  HiOutlineCog6Tooth,
} from "react-icons/hi2";

const iconMap: Record<string, React.ReactNode> = {
  LayoutDashboard: <HiOutlineHome className="h-5 w-5" />,
  UserGroup: <HiOutlineUserGroup className="h-5 w-5" />,
  DocumentText: <HiOutlineDocumentText className="h-5 w-5" />,
  CheckCircle: <HiOutlineCheckCircle className="h-5 w-5" />,
  AcademicCap: <HiOutlineAcademicCap className="h-5 w-5" />,
  Users: <HiOutlineUsers className="h-5 w-5" />,
  BookOpen: <HiOutlineBookOpen className="h-5 w-5" />,
  ClipboardList: <HiOutlineClipboard className="h-5 w-5" />,
  CurrencyRupee: <HiOutlineCurrencyRupee className="h-5 w-5" />,
  Calendar: <HiOutlineCalendar className="h-5 w-5" />,
  BuildingOffice: <HiOutlineBuildingOffice className="h-5 w-5" />,
  Truck: <HiOutlineTruck className="h-5 w-5" />,
  Library: <HiOutlinePlay className="h-5 w-5" />,
  Briefcase: <HiOutlineBriefcase className="h-5 w-5" />,
  Bell: <HiOutlineBell className="h-5 w-5" />,
  Cog6Tooth: <HiOutlineCog6Tooth className="h-5 w-5" />,
};

export function Sidebar({ open, onClose }: { open: boolean; onClose: () => void }) {
  const location = useLocation();
  const { hasPermission } = useRole();

  const visibleRoutes = APP_ROUTES.filter((route) => {
    if (route.hidden) return false;
    if (!route.requiresAuth) return false;
    if (route.requiredRole && !route.requiredRole.some((role) => hasPermission(role.toLowerCase())))
      return false;
    if (route.requiredPermission && !route.requiredPermission.some((p) => hasPermission(p)))
      return false;
    return true;
  });

  const isActive = (path: string) =>
    location.pathname === path || location.pathname.startsWith(path + "/");

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden md:flex md:w-64 md:flex-col md:border-r md:bg-card">
        <div className="flex h-16 items-center gap-2 border-b px-4">
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-primary text-primary-foreground">
            <HiOutlineSparkles className="h-5 w-5" />
          </span>
          <span className="font-heading text-lg font-semibold">AI-CollegeOS</span>
        </div>
        <nav className="flex-1 space-y-1 overflow-y-auto p-3">
          <Link
            to="/dashboard"
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
              isActive("/dashboard")
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
            )}
          >
            <HiOutlineHome className="h-5 w-5" />
            Dashboard
          </Link>
          {visibleRoutes.map((route) => (
            <Link
              key={route.path}
              to={route.path}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                isActive(route.path)
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
              )}
              onClick={onClose}
            >
              {iconMap[route.icon || ""] || <HiOutlineDocumentText className="h-5 w-5" />}
              {route.label}
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
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-primary text-primary-foreground">
              <HiOutlineSparkles className="h-5 w-5" />
            </span>
            <span className="font-heading text-lg font-semibold">AI-CollegeOS</span>
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
          <Link
            to="/dashboard"
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
              isActive("/dashboard")
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
            )}
            onClick={onClose}
          >
            <HiOutlineHome className="h-5 w-5" />
            Dashboard
          </Link>
          {visibleRoutes.map((route) => (
            <Link
              key={route.path}
              to={route.path}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                isActive(route.path)
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
              )}
              onClick={onClose}
            >
              {iconMap[route.icon || ""] || <HiOutlineDocumentText className="h-5 w-5" />}
              {route.label}
            </Link>
          ))}
        </nav>
      </aside>
    </>
  );
}
