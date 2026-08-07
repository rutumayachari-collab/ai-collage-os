"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Pencil, Trash2, Eye, Copy } from "lucide-react";

interface Action {
  label: string;
  onClick: () => void;
  icon?: React.ReactNode;
  variant?: "default" | "destructive";
  disabled?: boolean;
}

interface ActionMenuProps {
  actions: Action[];
  align?: "start" | "center" | "end";
}

export function ActionMenu({ actions, align = "end" }: ActionMenuProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <MoreHorizontal className="h-4 w-4" />
          <span className="sr-only">Open menu</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align={align}>
        {actions.map((action, index) => (
          <DropdownMenuItem
            key={index}
            onClick={action.onClick}
            disabled={action.disabled}
            className={action.variant === "destructive" ? "text-destructive" : ""}
          >
            {action.icon || <Eye className="mr-2 h-4 w-4" />}
            {action.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export const defaultActions = {
  view: (onClick: () => void) => ({ label: "View", onClick, icon: <Eye className="h-4 w-4" /> }),
  edit: (onClick: () => void) => ({ label: "Edit", onClick, icon: <Pencil className="h-4 w-4" /> }),
  delete: (onClick: () => void) => ({
    label: "Delete",
    onClick,
    icon: <Trash2 className="h-4 w-4" />,
    variant: "destructive" as const,
  }),
  duplicate: (onClick: () => void) => ({
    label: "Duplicate",
    onClick,
    icon: <Copy className="h-4 w-4" />,
  }),
};
