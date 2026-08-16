"use client";

import { Navigate, useLocation } from "@tanstack/react-router";
import { ProtectedRoute } from "@/app/guards/ProtectedRoute";
import { useAuth } from "@/app/hooks/useAuth";
import { getUserType, type UserType } from "@/app/utils/role";
import { StudentDashboard } from "@/app/pages/role/StudentDashboard";
import { CounsellorDashboard } from "@/app/pages/role/CounsellorDashboard";
import { AdminDashboard } from "@/app/pages/role/AdminDashboard";

interface RoleDashboardProps {
  allowedTypes?: UserType[];
}

export function RoleDashboard({ allowedTypes }: RoleDashboardProps) {
  const { user } = useAuth();
  const location = useLocation();

  if (!user) {
    return <Navigate to="/login" search={{ redirect: location.pathname }} />;
  }

  const userType = getUserType(user.role);

  if (allowedTypes && !allowedTypes.includes(userType)) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Access Denied</h1>
          <p className="mt-2 text-muted-foreground">
            You do not have permission to access this page.
          </p>
        </div>
      </div>
    );
  }

  switch (userType) {
    case "student":
      return <StudentDashboard />;
    case "faculty":
    case "hod":
      return <CounsellorDashboard />;
    case "admin":
      return <AdminDashboard />;
    default:
      return <StudentDashboard />;
  }
}

export function RoleProtectedRoute({
  allowedTypes,
}: {
  allowedTypes?: UserType[];
}) {
  return (
    <ProtectedRoute>
      <RoleDashboard allowedTypes={allowedTypes} />
    </ProtectedRoute>
  );
}
