import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Button } from "./Button";
import {
  HiMenu, HiX, HiOutlineSparkles, HiOutlineUser, HiOutlineAcademicCap,
  HiOutlineShieldCheck, HiOutlineIdentification, HiChevronDown,
} from "react-icons/hi";

const NAV_LINKS = [
  { label: "Home", href: "#home" },
  { label: "About", href: "#about" },
  { label: "Courses", href: "#courses" },
  { label: "Admission", href: "#admission" },
  { label: "Scholarships", href: "#scholarships" },
  { label: "Contact", href: "#contact" },
];

type PortalItem = { icon: React.ReactNode; label: string; hint: string };

const STUDENT_ITEMS: PortalItem[] = [
  { icon: <HiOutlineUser className="h-4 w-4" />, label: "Student Portal", hint: "Applications, fees, timetable" },
  { icon: <HiOutlineAcademicCap className="h-4 w-4" />, label: "Applicant Login", hint: "Track your admission status" },
];

const ADMIN_ITEMS: PortalItem[] = [
  { icon: <HiOutlineShieldCheck className="h-4 w-4" />, label: "Admin Console", hint: "Manage admissions & staff" },
  { icon: <HiOutlineIdentification className="h-4 w-4" />, label: "Counsellor Login", hint: "Review inquiries & documents" },
];

function LoginDropdown({ label, items, primary = false }: { label: string; items: PortalItem[]; primary?: boolean }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  return (
    <div ref={ref} className="relative">
      <Button
        variant={primary ? "primary" : "outline"}
        size="sm"
        onClick={() => setOpen((v) => !v)}
        rightIcon={<HiChevronDown className={cn("h-4 w-4 transition", open && "rotate-180")} />}
      >
        {label}
      </Button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.98 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 top-[calc(100%+8px)] w-72 overflow-hidden rounded-2xl border border-white/10 bg-navy-deep/95 p-2 shadow-elegant backdrop-blur-xl"
          >
            {items.map((it) => (
              <button
                key={it.label}
                onClick={() => setOpen(false)}
                className="flex w-full items-start gap-3 rounded-xl p-3 text-left transition hover:bg-white/5"
              >
                <span className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-sky/15 text-sky">
                  {it.icon}
                </span>
                <span>
                  <span className="block text-sm font-medium text-white">{it.label}</span>
                  <span className="block text-xs text-white/60">{it.hint}</span>
                </span>
              </button>
            ))}
            <div className="mt-1 border-t border-white/5 p-3 text-xs text-white/50">
              New here?{" "}
              <a href="#admission" className="text-sky hover:underline">Create an account</a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-all duration-300",
        scrolled ? "py-2" : "py-4",
      )}
    >
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6">
        <div
          className={cn(
            "flex items-center justify-between rounded-2xl border transition-all duration-300",
            scrolled
              ? "border-white/10 bg-navy-deep/70 px-4 py-2 shadow-elegant backdrop-blur-xl"
              : "border-white/5 bg-white/[0.02] px-3 py-2 backdrop-blur-md",
          )}
        >
          <a href="#home" className="flex items-center gap-2 pl-1">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-sky text-navy-deep shadow-glow">
              <HiOutlineSparkles className="h-5 w-5" />
            </span>
            <span className="font-heading text-lg font-semibold text-white">
              AI-CollegeOS
            </span>
          </a>

          <nav className="hidden items-center gap-1 md:flex">
            {NAV_LINKS.map((l) => (
              <a
                key={l.href}
                href={l.href}
                className="rounded-full px-4 py-2 text-sm text-white/80 transition hover:bg-white/5 hover:text-white"
              >
                {l.label}
              </a>
            ))}
          </nav>

          <div className="hidden items-center gap-2 md:flex">
            <LoginDropdown label="Student Login" items={STUDENT_ITEMS} />
            <LoginDropdown label="Admin Login" items={ADMIN_ITEMS} primary />
          </div>

          <button
            onClick={() => setOpen((v) => !v)}
            className="grid h-10 w-10 place-items-center rounded-xl bg-white/5 text-white md:hidden"
            aria-label="Toggle menu"
          >
            {open ? <HiX className="h-5 w-5" /> : <HiMenu className="h-5 w-5" />}
          </button>
        </div>

        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="mt-2 rounded-2xl border border-white/10 bg-navy-deep/90 p-4 shadow-elegant backdrop-blur-xl md:hidden"
            >
              <nav className="flex flex-col">
                {NAV_LINKS.map((l) => (
                  <a
                    key={l.href}
                    href={l.href}
                    onClick={() => setOpen(false)}
                    className="rounded-lg px-3 py-2 text-sm text-white/80 hover:bg-white/5 hover:text-white"
                  >
                    {l.label}
                  </a>
                ))}
              </nav>
              <div className="mt-3 grid grid-cols-2 gap-2">
                <Button variant="outline" size="sm">Student Login</Button>
                <Button variant="primary" size="sm">Admin Login</Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </header>
  );
}
