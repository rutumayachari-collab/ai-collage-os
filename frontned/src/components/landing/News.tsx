import { motion } from "framer-motion";
import { HiOutlineCalendar, HiArrowRight } from "react-icons/hi";
import { Container } from "./Container";
import { SectionTitle } from "./SectionTitle";

const NEWS = [
  {
    tag: "Event",
    date: "Mar 14",
    title: "AI Innovation Summit 2026 — registrations open",
    desc: "Three days of talks, demos and hackathons with 40+ industry speakers.",
    tone: "bg-sky/15 text-sky",
  },
  {
    tag: "News",
    date: "Mar 08",
    title: "Placement season closes with a 96% placement rate",
    desc: "Median CTC rises 18% year-over-year across engineering and management.",
    tone: "bg-emerald-400/15 text-emerald-500",
  },
  {
    tag: "Admissions",
    date: "Feb 27",
    title: "Early admissions round for 2026-27 batch begins",
    desc: "Priority scholarships and hostel allocation for applicants before Apr 15.",
    tone: "bg-amber-400/15 text-amber-500",
  },
];

export function News() {
  return (
    <section className="py-24 sm:py-28">
      <Container>
        <div className="flex flex-wrap items-end justify-between gap-6">
          <SectionTitle
            align="left"
            eyebrow="News & Events"
            title="What's happening on campus"
            subtitle="Announcements, research milestones and events shaping our community."
          />
          <button className="hidden items-center gap-1.5 text-sm font-medium text-navy hover:text-sky sm:inline-flex">
            View newsroom <HiArrowRight className="h-4 w-4" />
          </button>
        </div>

        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {NEWS.map((n, i) => (
            <motion.article
              key={n.title}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
              whileHover={{ y: -4 }}
              className="group flex flex-col overflow-hidden rounded-3xl border border-border bg-card p-6 shadow-sm transition-shadow hover:shadow-elegant"
            >
              <div className="flex items-center gap-2">
                <span className={`rounded-full px-2.5 py-1 text-[11px] font-medium ${n.tone}`}>
                  {n.tag}
                </span>
                <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                  <HiOutlineCalendar className="h-3.5 w-3.5" /> {n.date}
                </span>
              </div>
              <h3 className="mt-4 font-heading text-lg font-semibold leading-snug text-foreground">
                {n.title}
              </h3>
              <p className="mt-2 text-sm text-muted-foreground">{n.desc}</p>
              <button className="mt-6 inline-flex items-center gap-1 text-sm font-medium text-navy hover:text-sky">
                Read more{" "}
                <HiArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </button>
            </motion.article>
          ))}
        </div>
      </Container>
    </section>
  );
}
