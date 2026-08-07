"use client";

import { type ReactNode } from "react";
import { Outlet } from "@tanstack/react-router";
import { AppShell } from "@/app/components/layout/AppShell";

export function DashboardShell({ children }: { children?: ReactNode }) {
  return <AppShell>{children ?? <Outlet />}</AppShell>;
}
