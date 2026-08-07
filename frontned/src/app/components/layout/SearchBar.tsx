"use client";

import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Command } from "@/components/ui/command";
import { HiOutlineMagnifyingGlass } from "react-icons/hi2";

interface QuickAction {
  label: string;
  href: string;
  icon?: React.ReactNode;
  shortcut?: string;
}

const QUICK_ACTIONS: QuickAction[] = [
  { label: "New Inquiry", href: "/inquiries/new", shortcut: "N" },
  { label: "New Applicant", href: "/applicants/new", shortcut: "A" },
  { label: "Verify Documents", href: "/documents", shortcut: "D" },
  { label: "Check Eligibility", href: "/eligibility", shortcut: "E" },
  { label: "Pending Admissions", href: "/admissions/pending", shortcut: "P" },
];

export function SearchBar() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const navigate = useNavigate();

  const handleSelect = (href: string) => {
    navigate({ to: href });
    setOpen(false);
    setQuery("");
  };

  return (
    <div className="relative hidden md:block">
      <Button
        variant="outline"
        className="relative h-9 w-64 justify-start text-sm text-muted-foreground"
        onClick={() => setOpen(true)}
      >
        <HiOutlineMagnifyingGlass className="mr-2 h-4 w-4" />
        Search...
        <kbd className="pointer-events-none absolute right-2 flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100">
          ⌘K
        </kbd>
      </Button>
      {open && (
        <>
          <div className="fixed inset-0 z-50 bg-black/50" onClick={() => setOpen(false)} />
          <div className="absolute left-0 top-full z-50 mt-2 w-96 rounded-lg border bg-card shadow-lg">
            <Command>
              <div className="flex items-center border-b px-3">
                <HiOutlineMagnifyingGlass className="mr-2 h-4 w-4 shrink-0 opacity-50" />
                <Input
                  placeholder="Type a command or search..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="h-10 border-0 bg-transparent p-0 shadow-none focus-visible:ring-0"
                  autoFocus
                />
              </div>
              <div className="max-h-80 overflow-y-auto p-2">
                {query ? (
                  <div className="px-2 py-1.5 text-sm text-muted-foreground">
                    No results for "{query}"
                  </div>
                ) : (
                  <div className="space-y-1">
                    <p className="px-2 py-1.5 text-xs font-medium text-muted-foreground">
                      Quick Actions
                    </p>
                    {QUICK_ACTIONS.map((action) => (
                      <button
                        key={action.href}
                        onClick={() => handleSelect(action.href)}
                        className="flex w-full items-center justify-between rounded-md px-2 py-1.5 text-sm hover:bg-accent"
                      >
                        <span>{action.label}</span>
                        {action.shortcut && (
                          <kbd className="rounded border bg-muted px-1.5 font-mono text-xs">
                            {action.shortcut}
                          </kbd>
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </Command>
          </div>
        </>
      )}
    </div>
  );
}
