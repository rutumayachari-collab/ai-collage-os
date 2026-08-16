"use client";

import { useEffect } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useAuth } from "@/app/hooks/useAuth";
import { useDefaultDashboard } from "@/app/hooks/useDefaultDashboard";

export function DashboardRouter() {
  const { isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();
  const defaultDashboard = useDefaultDashboard();

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      navigate({ to: defaultDashboard });
    }
  }, [isAuthenticated, isLoading, navigate, defaultDashboard]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return null;
}
