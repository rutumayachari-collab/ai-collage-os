"use client";

import { useNavigate } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { QuickActionCard } from "@/app/components/common/QuickActionCard";
import {
  HiOutlineUserGroup,
  HiOutlineDocumentText,
  HiOutlineCheckCircle,
  HiOutlineAcademicCap,
} from "react-icons/hi2";

interface QuickAction {
  label: string;
  href: string;
  icon: React.ReactNode;
  description: string;
}

const QUICK_ACTIONS: QuickAction[] = [
  {
    label: "New Inquiry",
    href: "/inquiries/new",
    icon: <HiOutlineUserGroup className="h-5 w-5" />,
    description: "Add a new student inquiry",
  },
  {
    label: "New Applicant",
    href: "/applicants/new",
    icon: <HiOutlineDocumentText className="h-5 w-5" />,
    description: "Create applicant record",
  },
  {
    label: "Verify Documents",
    href: "/documents",
    icon: <HiOutlineCheckCircle className="h-5 w-5" />,
    description: "Review pending documents",
  },
  {
    label: "Check Eligibility",
    href: "/eligibility",
    icon: <HiOutlineAcademicCap className="h-5 w-5" />,
    description: "Run eligibility checks",
  },
];

export function QuickActions() {
  const navigate = useNavigate();

  return (
    <div className="hidden items-center gap-1 lg:flex">
      {QUICK_ACTIONS.map((action) => (
        <Button
          key={action.href}
          variant="ghost"
          size="sm"
          onClick={() => navigate({ to: action.href })}
          className="hidden xl:flex"
        >
          {action.icon}
          {action.label}
        </Button>
      ))}
    </div>
  );
}
