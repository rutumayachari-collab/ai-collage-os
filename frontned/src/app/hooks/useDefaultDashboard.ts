"use client";

import { useMemo } from "react";
import { useAuth } from "@/app/hooks/useAuth";
import { getUserType, getDefaultDashboardPath } from "@/app/utils/role";

export function useDefaultDashboard(): string {
  const { user } = useAuth();
  return useMemo(() => {
    if (!user) return "/login";
    const userType = getUserType(user.role);
    return getDefaultDashboardPath(userType);
  }, [user]);
}
