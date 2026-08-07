import {
  HiOutlineSparkles,
  HiOutlineMail,
  HiOutlineLocationMarker,
  HiOutlinePhone,
} from "react-icons/hi";
import { FaTwitter, FaLinkedinIn, FaInstagram, FaYoutube } from "react-icons/fa";
import { Container } from "./Container";
import { Button } from "./Button";

const COLUMNS = [
  { title: "Platform", links: ["Admission", "Student", "Faculty", "Placement"] },
  { title: "Modules", links: ["Library", "Hostel", "Finance", "ERP"] },
  { title: "Company", links: ["About", "Careers", "Press", "Contact"] },
  { title: "Resources", links: ["Blog", "Help Center", "Community", "Status"] },
];

export function Footer() {
  return (
    <footer className="relative overflow-hidden bg-navy-deep pt-20 pb-8 text-white/70">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-sky/50 to-transparent" />
      <div className="pointer-events-none absolute -left-24 top-10 h-64 w-64 rounded-full bg-sky/10 blur-3xl" />
      <div className="pointer-events-none absolute -right-24 bottom-10 h-64 w-64 rounded-full bg-sky-soft/10 blur-3xl" />

      <Container className="relative">
        {/* CTA / Newsletter */}
        <div className="mb-16 flex flex-col gap-6 rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur-xl sm:flex-row sm:items-center sm:justify-between sm:p-10">
          <div>
            <h3 className="font-heading text-2xl font-semibold text-white sm:text-3xl">
              Get admission tips, straight to your inbox
            </h3>
            <p className="mt-2 max-w-md text-sm text-white/60">
              Deadlines, scholarship alerts and success stories — one thoughtful email a week.
            </p>
          </div>
          <form onSubmit={(e) => e.preventDefault()} className="flex w-full max-w-md gap-2">
            <div className="relative flex-1">
              <HiOutlineMail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
              <input
                type="email"
                placeholder="you@university.edu"
                className="w-full rounded-full border border-white/15 bg-white/5 pl-9 pr-4 py-3 text-sm text-white placeholder:text-white/40 outline-none focus:border-sky focus:ring-2 focus:ring-sky/30"
              />
            </div>
            <Button variant="primary">Subscribe</Button>
          </form>
        </div>

        <div className="grid gap-10 lg:grid-cols-6">
          <div className="lg:col-span-2">
            <a href="#home" className="flex items-center gap-2">
              <span className="grid h-9 w-9 place-items-center rounded-xl bg-sky text-navy-deep">
                <HiOutlineSparkles className="h-5 w-5" />
              </span>
              <span className="font-heading text-lg font-semibold text-white">AI-CollegeOS</span>
            </a>
            <p className="mt-4 max-w-sm text-sm">
              The intelligent operating system for modern higher education — starting with
              admissions.
            </p>

            <ul className="mt-6 space-y-2 text-sm">
              <li className="flex items-center gap-2">
                <HiOutlineLocationMarker className="h-4 w-4 text-sky" /> Knowledge Park, Bengaluru
                560100
              </li>
              <li className="flex items-center gap-2">
                <HiOutlinePhone className="h-4 w-4 text-sky" /> +91 80 4567 8900
              </li>
              <li className="flex items-center gap-2">
                <HiOutlineMail className="h-4 w-4 text-sky" /> hello@ai-collegeos.edu
              </li>
            </ul>

            <div className="mt-6 flex items-center gap-3">
              {[FaTwitter, FaLinkedinIn, FaInstagram, FaYoutube].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  className="grid h-9 w-9 place-items-center rounded-full border border-white/10 bg-white/5 text-white/80 transition hover:border-sky/50 hover:text-sky"
                >
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          {COLUMNS.map((c) => (
            <div key={c.title}>
              <div className="font-heading text-sm font-semibold text-white">{c.title}</div>
              <ul className="mt-4 space-y-2 text-sm">
                {c.links.map((l) => (
                  <li key={l}>
                    <a href="#" className="transition hover:text-sky">
                      {l}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-14 flex flex-col items-start justify-between gap-4 border-t border-white/10 pt-6 text-xs sm:flex-row sm:items-center">
          <div>© {new Date().getFullYear()} AI-CollegeOS. All rights reserved.</div>
          <div className="flex flex-wrap gap-6">
            <a href="#" className="hover:text-sky">
              Privacy Policy
            </a>
            <a href="#" className="hover:text-sky">
              Terms of Service
            </a>
            <a href="#" className="hover:text-sky">
              Cookie Preferences
            </a>
            <a href="#" className="hover:text-sky">
              Accessibility
            </a>
          </div>
        </div>
      </Container>
    </footer>
  );
}
