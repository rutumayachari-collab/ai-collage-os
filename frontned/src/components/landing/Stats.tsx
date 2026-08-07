import { motion, useInView, useMotionValue, useSpring } from "framer-motion";
import { useEffect, useRef } from "react";
import { Container } from "./Container";

type Stat = { label: string; value: number; suffix?: string };

const STATS: Stat[] = [
  { label: "Students Enrolled", value: 24500, suffix: "+" },
  { label: "Courses Offered", value: 120 },
  { label: "Placement Rate", value: 96, suffix: "%" },
  { label: "Faculty Members", value: 480, suffix: "+" },
];

function Counter({ to, suffix }: { to: number; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  const mv = useMotionValue(0);
  const spring = useSpring(mv, { damping: 30, stiffness: 80 });

  useEffect(() => {
    if (inView) mv.set(to);
  }, [inView, to, mv]);

  useEffect(() => {
    return spring.on("change", (v) => {
      if (ref.current) ref.current.textContent = Math.floor(v).toLocaleString();
    });
  }, [spring]);

  return (
    <>
      <span ref={ref}>0</span>
      {suffix}
    </>
  );
}

export function Stats() {
  return (
    <section className="relative -mt-16 pb-4">
      <Container>
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="grid grid-cols-2 gap-px overflow-hidden rounded-3xl border border-white/10 bg-white/5 shadow-elegant backdrop-blur-xl md:grid-cols-4"
        >
          {STATS.map((s, i) => (
            <motion.div
              key={s.label}
              whileHover={{ y: -4 }}
              transition={{ type: "spring", stiffness: 260, damping: 22 }}
              className="group relative overflow-hidden bg-navy/80 p-6 text-center sm:p-8"
              style={{ transitionDelay: `${i * 40}ms` }}
            >
              <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-sky/60 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
              <div className="pointer-events-none absolute -inset-x-4 -top-16 h-32 bg-sky/10 blur-3xl opacity-0 transition-opacity group-hover:opacity-100" />
              <div className="relative font-heading text-3xl font-semibold text-white sm:text-4xl md:text-5xl">
                <Counter to={s.value} suffix={s.suffix} />
              </div>
              <div className="relative mt-2 text-sm text-white/60">{s.label}</div>
            </motion.div>
          ))}
        </motion.div>
      </Container>
    </section>
  );
}
