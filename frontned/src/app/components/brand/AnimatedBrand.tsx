"use client";

import { motion } from "framer-motion";

type Props = {
  className?: string;
  size?: "sm" | "md" | "lg";
};

const SIZE_CLASSES: Record<NonNullable<Props["size"]>, string> = {
  sm: "text-sm font-medium",
  md: "text-2xl font-semibold",
  lg: "text-4xl font-bold",
};

export function AnimatedBrand({ className = "", size = "md" }: Props) {
  return (
    <span className={`relative inline-flex items-center ${SIZE_CLASSES[size]} ${className}`}>
      <span className="relative overflow-hidden rounded-lg bg-gradient-to-r from-navy via-navy-deep to-navy px-3 py-1.5 tracking-tight text-white shadow-glow">
        <span className="relative z-10">NEXORA</span>
        <motion.span
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/25 to-transparent"
          initial={{ x: "-100%" }}
          animate={{ x: ["-100%", "100%"] }}
          transition={{
            duration: 3.6,
            repeat: Infinity,
            ease: "easeInOut",
            repeatDelay: 1.8,
          }}
          style={{
            backgroundSize: "200% 100%",
          }}
        />
      </span>
      <span className="ml-2 text-sky">AI CAMPUSOS</span>
    </span>
  );
}
