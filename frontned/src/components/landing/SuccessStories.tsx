import { motion } from "framer-motion";
import { HiOutlineBriefcase, HiArrowRight } from "react-icons/hi";
import { Container } from "./Container";
import { SectionTitle } from "./SectionTitle";
import alum1 from "@/assets/alum-1.jpg";
import alum2 from "@/assets/alum-2.jpg";
import alum3 from "@/assets/alum-3.jpg";

const STORIES = [
  {
    photo: alum1,
    name: "Ananya Kapoor",
    role: "Product Manager · Google",
    year: "MBA · 2023",
    metric: "42 LPA",
    quote:
      "The analytics track combined with real client projects made me interview-ready. My PM offer came before I graduated.",
  },
  {
    photo: alum2,
    name: "Rahul Verma",
    role: "SDE-2 · Amazon",
    year: "B.Tech CSE · 2022",
    metric: "38 LPA",
    quote:
      "AI-CollegeOS matched me to research and internships that shaped my career. The placement cell felt like a coach, not a queue.",
  },
  {
    photo: alum3,
    name: "Neha Krishnan",
    role: "Research Scientist · Adobe",
    year: "B.Tech CSE · 2024",
    metric: "44 LPA",
    quote:
      "Faculty mentorship on my ML thesis got me a top-tier research role straight out of undergrad. Life-changing.",
  },
];

export function SuccessStories() {
  return (
    <section className="bg-muted/40 py-24 sm:py-28">
      <Container>
        <SectionTitle
          eyebrow="Success Stories"
          title="Careers launched, not just degrees earned"
          subtitle="Meet a few alumni turning their programmes into landmark careers."
        />
        <div className="mt-14 grid gap-6 md:grid-cols-3">
          {STORIES.map((s, i) => (
            <motion.article
              key={s.name}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
              whileHover={{ y: -6 }}
              className="group relative overflow-hidden rounded-3xl border border-border bg-card p-6 shadow-sm transition-shadow hover:shadow-elegant"
            >
              <div className="flex items-start gap-4">
                <div className="relative">
                  <img
                    src={s.photo}
                    alt={s.name}
                    loading="lazy"
                    className="h-16 w-16 rounded-2xl object-cover"
                  />
                  <span className="absolute -bottom-1.5 -right-1.5 grid h-7 w-7 place-items-center rounded-full border-2 border-card bg-sky text-navy-deep">
                    <HiOutlineBriefcase className="h-3.5 w-3.5" />
                  </span>
                </div>
                <div className="min-w-0">
                  <div className="font-heading text-base font-semibold text-foreground">
                    {s.name}
                  </div>
                  <div className="truncate text-sm text-muted-foreground">{s.role}</div>
                  <div className="mt-1 text-xs text-muted-foreground/80">{s.year}</div>
                </div>
              </div>
              <blockquote className="mt-5 text-sm leading-relaxed text-muted-foreground">
                "{s.quote}"
              </blockquote>
              <div className="mt-6 flex items-center justify-between border-t border-border pt-4">
                <div>
                  <div className="text-[10px] uppercase tracking-widest text-muted-foreground">
                    Package
                  </div>
                  <div className="font-heading text-lg font-semibold text-navy">{s.metric}</div>
                </div>
                <button className="inline-flex items-center gap-1 text-sm font-medium text-navy hover:text-sky">
                  Read story{" "}
                  <HiArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </button>
              </div>
            </motion.article>
          ))}
        </div>
      </Container>
    </section>
  );
}
