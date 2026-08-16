"use client";

import { Link, useRouterState } from "@tanstack/react-router";
import { motion } from "framer-motion";
import {
  LayoutDashboard,
  Sparkles,
  PhoneCall,
  Search,
  Bell,
  GraduationCap,
  Settings,
  Users,
  FileText,
  ClipboardCheck,
  DollarSign,
  BookOpen,
  Calendar,
  Building2,
  Truck,
  Library,
  Briefcase,
} from "lucide-react";
import type { ReactNode } from "react";
import { ThemeToggle } from "@/app/components/theme-toggle";
import { cn } from "@/lib/utils";
import { AnimatedBrand } from "@/app/components/brand/AnimatedBrand";

const nav = [
  { to: "/dashboard", label: "Command Center", icon: LayoutDashboard },
  { to: "/ai/copilot", label: "AI Copilot", icon: Sparkles },
  { to: "/outreach", label: "Calling Agent", icon: PhoneCall },
  { to: "/orchestrator", label: "Action Orchestrator", icon: Settings },
];

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <div className="min-h-screen bg-background">
      <div className="pointer-events-none fixed inset-0 grid-field opacity-[0.35]" />
      <div className="pointer-events-none fixed -left-40 -top-40 size-[36rem] rounded-full bg-primary/10 blur-3xl" />
      <div className="pointer-events-none fixed -bottom-52 right-0 size-[34rem] rounded-full bg-accent/10 blur-3xl" />

      <div className="relative flex">
        <aside className="sticky top-0 hidden h-screen w-[248px] shrink-0 flex-col border-r border-sidebar-border bg-sidebar/70 px-4 py-6 backdrop-blur-xl lg:flex">
          <Link to="/dashboard" className="mb-8 flex items-center gap-3 px-2">
            <AnimatedBrand size="sm" />
          </Link>

          <nav className="flex flex-col gap-1">
            {nav.map((item) => {
              const active = pathname === item.to;
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={cn(
                    "relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                    active
                      ? "text-sidebar-accent-foreground"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  {active && (
                    <motion.span
                      layoutId="nav-active"
                      className="absolute inset-0 rounded-xl bg-sidebar-accent shadow-soft"
                      transition={{ type: "spring", stiffness: 420, damping: 34 }}
                    />
                  )}
                  <item.icon className="relative size-4" />
                  <span className="relative">{item.label}</span>
                </Link>
              );
            })}
          </nav>

          <div className="panel mt-auto p-4">
            <div className="flex items-center gap-2 text-xs font-medium">
              <span className="size-1.5 animate-pulse rounded-full bg-success" />
              AI services healthy
            </div>
            <p className="mt-2 text-[11px] leading-relaxed text-muted-foreground">
              12 agents online · 4 campaigns running · avg latency 380 ms
            </p>
          </div>
        </aside>

        <div className="min-w-0 flex-1">
          <header className="sticky top-0 z-30 glass flex items-center gap-3 border-x-0 border-t-0 px-4 py-3 sm:px-6">
            <div className="flex items-center gap-2 lg:hidden">
              <span className="bg-gradient-ai grid size-8 place-items-center rounded-lg">
                <GraduationCap className="size-4 text-primary-foreground" />
              </span>
            </div>
            <div className="relative hidden max-w-sm flex-1 items-center sm:flex">
              <Search className="pointer-events-none absolute left-3 size-4 text-muted-foreground" />
              <input
                aria-label="Search students, applicants, documents"
                placeholder="Ask or search — students, docs, payments"
                className="h-9 w-full rounded-full border border-border bg-card/60 pl-9 pr-3 text-sm outline-none transition-shadow placeholder:text-muted-foreground focus:shadow-glow"
              />
            </div>
            <div className="ml-auto flex items-center gap-2">
              <button
                className="glass relative inline-flex size-9 items-center justify-center rounded-full text-muted-foreground transition-colors hover:text-foreground"
                aria-label="Notifications"
              >
                <Bell className="size-4" />
                <span className="absolute right-2 top-2 size-1.5 rounded-full bg-destructive" />
              </button>
              <ThemeToggle />
              <div className="flex items-center gap-2 rounded-full border border-border bg-card/60 py-1 pl-1 pr-3">
                <span className="grid size-7 place-items-center rounded-full bg-secondary text-[11px] font-semibold text-secondary-foreground">
                  RM
                </span>
                <span className="hidden text-xs font-medium sm:block">Registrar</span>
              </div>
            </div>
          </header>

          <nav className="glass sticky top-[57px] z-20 flex gap-1 border-x-0 border-t-0 px-4 py-2 lg:hidden">
            {nav.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className={cn(
                  "flex-1 rounded-lg px-2 py-1.5 text-center text-xs font-medium transition-colors",
                  pathname === item.to
                    ? "bg-secondary text-secondary-foreground"
                    : "text-muted-foreground",
                )}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <main className="px-4 pb-16 pt-6 sm:px-6 lg:px-8">{children}</main>
        </div>
      </div>
    </div>
  );
}
