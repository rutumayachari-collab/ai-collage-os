import { motion } from "framer-motion";
import { HiOutlineStar, HiOutlineHeart, HiOutlineGlobeAlt, HiArrowRight } from "react-icons/hi";
import { Container } from "./Container";
import { SectionTitle } from "./SectionTitle";

const SCHOLARSHIPS = [
  {
    icon: <HiOutlineStar className="h-6 w-6" />,
    title: "Merit Scholarship",
    amount: "Up to 100%",
    description: "For students in the top 1% of qualifying exams — full tuition covered.",
    tone: "from-sky/20 to-transparent",
  },
  {
    icon: <HiOutlineHeart className="h-6 w-6" />,
    title: "Need-based Grant",
    amount: "Up to 60%",
    description: "Financial assistance based on annual family income and academic potential.",
    tone: "from-emerald-400/20 to-transparent",
  },
  {
    icon: <HiOutlineGlobeAlt className="h-6 w-6" />,
    title: "Diversity Programme",
    amount: "Up to 40%",
    description:
      "Support for underrepresented regions, first-generation and international students.",
    tone: "from-fuchsia-400/20 to-transparent",
  },
];

export function Scholarships() {
  return (
    <section id="scholarships" className="bg-muted/40 py-24 sm:py-28">
      <Container>
        <SectionTitle
          eyebrow="Scholarships"
          title="We invest in students who dare to learn"
          subtitle="Our AI matches you to every scholarship you qualify for — no separate application needed."
        />
        <div className="mt-14 grid gap-6 md:grid-cols-3">
          {SCHOLARSHIPS.map((s, i) => (
            <motion.div
              key={s.title}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
              className="relative overflow-hidden rounded-3xl border border-border bg-card p-8 shadow-sm transition-shadow hover:shadow-elegant"
            >
              <div className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${s.tone}`} />
              <div className="relative">
                <div className="grid h-12 w-12 place-items-center rounded-xl bg-navy text-sky shadow-glow">
                  {s.icon}
                </div>
                <div className="mt-6 text-xs font-medium uppercase tracking-widest text-sky">
                  {s.amount}
                </div>
                <h3 className="mt-1 font-heading text-xl font-semibold text-foreground">
                  {s.title}
                </h3>
                <p className="mt-3 text-sm text-muted-foreground">{s.description}</p>
                <button className="mt-6 inline-flex items-center gap-1.5 text-sm font-medium text-navy hover:text-sky">
                  Check eligibility <HiArrowRight className="h-4 w-4" />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </Container>
    </section>
  );
}
