import { motion } from "framer-motion";
import {
  HiOutlineChartBar, HiOutlineUserGroup, HiOutlineCheckCircle,
  HiOutlineClock, HiOutlineSparkles, HiOutlineDocumentText,
} from "react-icons/hi";
import { Container } from "./Container";
import { SectionTitle } from "./SectionTitle";

const BARS = [
  { label: "Mon", h: 42 }, { label: "Tue", h: 58 }, { label: "Wed", h: 71 },
  { label: "Thu", h: 64 }, { label: "Fri", h: 88 }, { label: "Sat", h: 95 }, { label: "Sun", h: 76 },
];

const QUEUE = [
  { name: "Priya S.", programme: "B.Tech CSE & AI", status: "Verified", tone: "text-emerald-400" },
  { name: "Arjun K.", programme: "MBA · Analytics", status: "Reviewing", tone: "text-amber-400" },
  { name: "Meera R.", programme: "B.Sc Biotech", status: "Confirmed", tone: "text-sky" },
  { name: "Vikram J.", programme: "B.Tech Mech", status: "Verified", tone: "text-emerald-400" },
];

export function AIDashboard() {
  return (
    <section className="relative overflow-hidden bg-navy-deep py-24 text-white sm:py-28">
      <div className="pointer-events-none absolute inset-0 opacity-70">
        <div className="animate-aurora absolute -top-40 left-1/4 h-[520px] w-[520px] rounded-full bg-sky/20 blur-3xl" />
        <div className="animate-aurora absolute -bottom-40 right-10 h-[420px] w-[420px] rounded-full bg-sky-soft/15 blur-3xl" style={{ animationDelay: "-6s" }} />
      </div>

      <Container className="relative">
        <div className="grid items-center gap-16 lg:grid-cols-2">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-sky/30 bg-sky/10 px-3 py-1 text-xs font-medium text-sky-soft">
              <HiOutlineSparkles className="h-4 w-4" /> Admissions Command Center
            </span>
            <h2 className="mt-5 font-heading text-3xl font-semibold text-white sm:text-4xl md:text-5xl">
              One dashboard for your entire <span className="text-gradient-sky">admissions funnel</span>
            </h2>
            <p className="mt-5 max-w-lg text-white/70">
              See inquiries, applications and confirmations in real time. Our AI surfaces bottlenecks, flags risky applications and drafts follow-ups — so your team can focus on the students who need attention.
            </p>

            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              {[
                { icon: <HiOutlineChartBar className="h-5 w-5" />, title: "Live analytics", desc: "Cohort insights, dropout risk and source attribution." },
                { icon: <HiOutlineDocumentText className="h-5 w-5" />, title: "Smart parsing", desc: "AI reads marksheets & IDs, auto-fills forms." },
                { icon: <HiOutlineClock className="h-5 w-5" />, title: "Time saved", desc: "Cut counsellor workload by 62% on average." },
                { icon: <HiOutlineUserGroup className="h-5 w-5" />, title: "Multi-role access", desc: "Counsellors, deans and finance in one place." },
              ].map((f) => (
                <div key={f.title} className="glass-dark rounded-xl p-4">
                  <span className="grid h-9 w-9 place-items-center rounded-lg bg-sky/15 text-sky">{f.icon}</span>
                  <div className="mt-3 text-sm font-semibold">{f.title}</div>
                  <div className="mt-1 text-xs text-white/60">{f.desc}</div>
                </div>
              ))}
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 32 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.7 }}
            className="relative"
          >
            <div className="absolute -inset-8 rounded-[2rem] bg-sky/15 blur-3xl" />
            <div className="glass-dark relative overflow-hidden rounded-3xl p-5 shadow-elegant">
              {/* Fake window chrome */}
              <div className="flex items-center gap-2 border-b border-white/10 pb-3">
                <span className="h-2.5 w-2.5 rounded-full bg-red-400/70" />
                <span className="h-2.5 w-2.5 rounded-full bg-amber-400/70" />
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-400/70" />
                <span className="ml-3 text-xs text-white/50">admissions.ai-collegeos.edu</span>
              </div>

              {/* KPI row */}
              <div className="mt-4 grid grid-cols-3 gap-3">
                {[
                  { label: "Applications", value: "2,486", trend: "+14%" },
                  { label: "Confirmed", value: "1,192", trend: "+22%" },
                  { label: "Conversion", value: "47.9%", trend: "+3.1pp" },
                ].map((k) => (
                  <div key={k.label} className="rounded-xl border border-white/10 bg-white/5 p-3">
                    <div className="text-[10px] uppercase tracking-widest text-white/50">{k.label}</div>
                    <div className="mt-1 font-heading text-xl font-semibold text-white">{k.value}</div>
                    <div className="mt-0.5 text-[11px] text-emerald-400">{k.trend}</div>
                  </div>
                ))}
              </div>

              {/* Chart */}
              <div className="mt-4 rounded-xl border border-white/10 bg-white/5 p-4">
                <div className="flex items-center justify-between">
                  <div className="text-xs text-white/60">Weekly applications</div>
                  <div className="flex items-center gap-1.5 text-[11px] text-sky">
                    <HiOutlineCheckCircle className="h-3.5 w-3.5" /> Live
                  </div>
                </div>
                <div className="mt-4 flex h-32 items-end gap-2">
                  {BARS.map((b, i) => (
                    <motion.div
                      key={b.label}
                      initial={{ height: 0 }}
                      whileInView={{ height: `${b.h}%` }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.06, duration: 0.6, ease: "easeOut" }}
                      className="flex-1 rounded-md bg-gradient-to-t from-sky/40 to-sky"
                    />
                  ))}
                </div>
                <div className="mt-2 flex justify-between text-[10px] text-white/40">
                  {BARS.map((b) => <span key={b.label}>{b.label}</span>)}
                </div>
              </div>

              {/* Queue */}
              <div className="mt-4 rounded-xl border border-white/10 bg-white/5">
                <div className="flex items-center justify-between border-b border-white/10 px-4 py-2 text-xs text-white/60">
                  <span>Recent applications</span>
                  <span className="text-sky">View all →</span>
                </div>
                <ul className="divide-y divide-white/5">
                  {QUEUE.map((q) => (
                    <li key={q.name} className="flex items-center justify-between px-4 py-2.5 text-xs">
                      <div>
                        <div className="font-medium text-white">{q.name}</div>
                        <div className="text-white/50">{q.programme}</div>
                      </div>
                      <span className={`text-[11px] font-medium ${q.tone}`}>● {q.status}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </motion.div>
        </div>
      </Container>
    </section>
  );
}
