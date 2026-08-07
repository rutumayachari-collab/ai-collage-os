"use client";

import { Navigate, useLocation } from "@tanstack/react-router";
import { ProtectedRoute } from "./ProtectedRoute";
import { useRole } from "../contexts/RoleContext";
import type { UserRole } from "../types/auth";

interface RoleRouteProps {
  children: React.ReactNode;
  allowedRoles: UserRole[];
  fallback?: React.ReactNode;
  redirectTo?: string;
}

export function RoleRoute({
  children,
  allowedRoles,
  fallback,
  redirectTo = "/dashboard",
}: RoleRouteProps) {
  const { role } = useRole();

  if (!role || !allowedRoles.includes(role)) {
    return fallback ? <>{fallback}</> : <Navigate to={redirectTo} />;
  }

  return <ProtectedRoute>{children}</ProtectedRoute>;
}
