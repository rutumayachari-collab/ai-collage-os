import { motion } from "framer-motion";
import type { ReactNode } from "react";

type Props = {
  icon: ReactNode;
  title: string;
  description: string;
  index?: number;
};

export function FeatureCard({ icon, title, description, index = 0 }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.5, delay: index * 0.05 }}
      whileHover={{ y: -6 }}
      className="group relative overflow-hidden rounded-2xl border border-border bg-card p-6 shadow-sm transition-shadow hover:shadow-elegant"
    >
      <div className="absolute -right-16 -top-16 h-40 w-40 rounded-full bg-sky/10 blur-3xl opacity-0 transition-opacity group-hover:opacity-100" />
      <div className="relative">
        <div className="grid h-12 w-12 place-items-center rounded-xl bg-navy text-sky shadow-glow">
          {icon}
        </div>
        <h3 className="mt-5 font-heading text-lg font-semibold text-foreground">{title}</h3>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{description}</p>
      </div>
    </motion.div>
  );
}
