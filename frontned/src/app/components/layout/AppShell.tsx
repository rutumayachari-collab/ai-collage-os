"use client";

import { useState, type ReactNode } from "react";
import { Outlet } from "@tanstack/react-router";
import { Sidebar } from "./Sidebar";
import { TopNavigation } from "./TopNavigation";
import { MobileDrawer } from "./MobileDrawer";

interface AppShellProps {
  children?: ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const content = children ?? <Outlet />;

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex flex-1 flex-col overflow-hidden">
        <TopNavigation onMenuClick={() => setSidebarOpen(true)} />
        <main className="flex-1 overflow-y-auto p-4 md:p-6">{content}</main>
      </div>
      <MobileDrawer open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
    </div>
  );
}
