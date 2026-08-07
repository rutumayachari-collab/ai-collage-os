"use client";

import { Link } from "@tanstack/react-router";
import { HiOutlineSparkles } from "react-icons/hi";
import { APP_ROUTES } from "@/app/constants/routes";
import { useRole } from "@/app/contexts/RoleContext";
import { cn } from "@/lib/utils";

const iconMap: Record<string, React.ReactNode> = {
  LayoutDashboard: <span className="h-5 w-5" />,
  UserGroup: <span className="h-5 w-5" />,
  DocumentText: <span className="h-5 w-5" />,
  CheckCircle: <span className="h-5 w-5" />,
  AcademicCap: <span className="h-5 w-5" />,
  Users: <span className="h-5 w-5" />,
  BookOpen: <span className="h-5 w-5" />,
  ClipboardList: <span className="h-5 w-5" />,
  CurrencyRupee: <span className="h-5 w-5" />,
  Calendar: <span className="h-5 w-5" />,
  BuildingOffice: <span className="h-5 w-5" />,
  Truck: <span className="h-5 w-5" />,
  Library: <span className="h-5 w-5" />,
  Briefcase: <span className="h-5 w-5" />,
  Bell: <span className="h-5 w-5" />,
  Cog6Tooth: <span className="h-5 w-5" />,
};

export function MobileDrawer({ open, onClose }: { open: boolean; onClose: () => void }) {
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
    window.location.pathname === path || window.location.pathname.startsWith(path + "/");

  return (
    <>
      {open && <div className="fixed inset-0 z-50 bg-black/50 md:hidden" onClick={onClose} />}
      <div
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
              {iconMap[route.icon || ""] || <span className="h-5 w-5" />}
              {route.label}
            </Link>
          ))}
        </nav>
      </div>
    </>
  );
}
