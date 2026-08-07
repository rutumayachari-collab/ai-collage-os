import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { HiOutlineChevronLeft, HiOutlineChevronRight, HiStar } from "react-icons/hi";
import { Container } from "./Container";
import { SectionTitle } from "./SectionTitle";

const ITEMS = [
  {
    name: "Aarav Sharma",
    role: "B.Tech CSE, 2nd Year",
    quote:
      "The AI assistant walked me through every step. My admission was confirmed in 48 hours — no queues, no paperwork chaos.",
    initials: "AS",
  },
  {
    name: "Priya Menon",
    role: "MBA Analytics, Alumna 2024",
    quote:
      "AI-CollegeOS made scholarship matching effortless. I discovered a diversity grant I didn't even know I qualified for.",
    initials: "PM",
  },
  {
    name: "Rohan Iyer",
    role: "B.Sc Biotech, 3rd Year",
    quote:
      "From inquiry to hostel allotment, everything was on one dashboard. The most polished admission experience I've seen.",
    initials: "RI",
  },
];

export function Testimonials() {
  const [i, setI] = useState(0);
  const item = ITEMS[i];
  const next = () => setI((v) => (v + 1) % ITEMS.length);
  const prev = () => setI((v) => (v - 1 + ITEMS.length) % ITEMS.length);

  return (
    <section className="py-24 sm:py-28">
      <Container>
        <SectionTitle eyebrow="Testimonials" title="Loved by students and parents alike" />
        <div className="mx-auto mt-14 max-w-3xl">
          <div className="relative overflow-hidden rounded-3xl border border-border bg-card p-8 shadow-sm sm:p-12">
            <AnimatePresence mode="wait">
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.35 }}
              >
                <div className="flex gap-1 text-sky">
                  {Array.from({ length: 5 }).map((_, k) => (
                    <HiStar key={k} className="h-5 w-5" />
                  ))}
                </div>
                <blockquote className="mt-5 font-heading text-xl leading-relaxed text-foreground sm:text-2xl">
                  "{item.quote}"
                </blockquote>
                <div className="mt-6 flex items-center gap-3">
                  <span className="grid h-12 w-12 place-items-center rounded-full bg-navy font-heading font-semibold text-sky">
                    {item.initials}
                  </span>
                  <div>
                    <div className="font-medium text-foreground">{item.name}</div>
                    <div className="text-sm text-muted-foreground">{item.role}</div>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
          <div className="mt-6 flex items-center justify-center gap-3">
            <button
              onClick={prev}
              aria-label="Previous"
              className="grid h-10 w-10 place-items-center rounded-full border border-border bg-card hover:bg-muted"
            >
              <HiOutlineChevronLeft className="h-5 w-5" />
            </button>
            <div className="flex gap-1.5">
              {ITEMS.map((_, k) => (
                <button
                  key={k}
                  onClick={() => setI(k)}
                  className={`h-1.5 rounded-full transition-all ${k === i ? "w-8 bg-navy" : "w-1.5 bg-border"}`}
                  aria-label={`Go to ${k + 1}`}
                />
              ))}
            </div>
            <button
              onClick={next}
              aria-label="Next"
              className="grid h-10 w-10 place-items-center rounded-full border border-border bg-card hover:bg-muted"
            >
              <HiOutlineChevronRight className="h-5 w-5" />
            </button>
          </div>
        </div>
      </Container>
    </section>
  );
}
