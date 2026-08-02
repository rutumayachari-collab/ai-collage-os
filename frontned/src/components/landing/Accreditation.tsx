import { motion } from "framer-motion";
import {
  HiOutlineShieldCheck, HiOutlineAcademicCap, HiOutlineGlobe,
  HiOutlineBadgeCheck, HiOutlineStar,
} from "react-icons/hi";
import { Container } from "./Container";

const BADGES = [
  { icon: <HiOutlineBadgeCheck className="h-5 w-5" />, label: "NAAC A++", note: "Accredited" },
  { icon: <HiOutlineShieldCheck className="h-5 w-5" />, label: "NBA", note: "Programme accredited" },
  { icon: <HiOutlineStar className="h-5 w-5" />, label: "NIRF Top 25", note: "Engineering 2025" },
  { icon: <HiOutlineAcademicCap className="h-5 w-5" />, label: "AICTE", note: "Approved" },
  { icon: <HiOutlineGlobe className="h-5 w-5" />, label: "QS Ranked", note: "Global Top 500" },
];

export function Accreditation() {
  return (
    <section className="bg-navy-deep py-16 text-white">
      <Container>
        <div className="grid gap-8 lg:grid-cols-[1fr_2fr] lg:items-center">
          <div>
            <div className="text-xs font-medium uppercase tracking-widest text-sky">Accredited & Ranked</div>
            <h3 className="mt-2 font-heading text-2xl font-semibold sm:text-3xl">
              Recognised by the institutions that matter
            </h3>
          </div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-5"
          >
            {BADGES.map((b) => (
              <div
                key={b.label}
                className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 p-3 backdrop-blur transition hover:border-sky/40 hover:bg-white/10"
              >
                <span className="grid h-10 w-10 place-items-center rounded-xl bg-sky/15 text-sky">
                  {b.icon}
                </span>
                <div className="min-w-0">
                  <div className="truncate font-heading text-sm font-semibold">{b.label}</div>
                  <div className="truncate text-[11px] text-white/60">{b.note}</div>
                </div>
              </div>
            ))}
          </motion.div>
        </div>
      </Container>
    </section>
  );
}
