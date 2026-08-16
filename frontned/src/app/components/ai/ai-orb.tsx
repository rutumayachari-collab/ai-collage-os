import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

type Props = {
  size?: number;
  state?: "idle" | "thinking" | "speaking";
  className?: string;
};

export function AIOrb({ size = 44, state = "idle", className }: Props) {
  const active = state !== "idle";

  return (
    <div
      className={cn("relative grid place-items-center", className)}
      style={{ width: size, height: size }}
      aria-hidden
    >
      {active && (
        <span className="absolute inset-0 animate-pulse-ring rounded-full bg-primary/25" />
      )}
      <motion.div
        className="bg-gradient-ai relative size-full rounded-full shadow-glow"
        animate={active ? { scale: [1, 1.06, 1], rotate: [0, 8, 0] } : { scale: 1, rotate: 0 }}
        transition={{ duration: 2.4, repeat: active ? Infinity : 0, ease: "easeInOut" }}
      >
        <motion.span
          className="absolute inset-[18%] rounded-full bg-background/40 blur-[2px]"
          animate={active ? { opacity: [0.45, 0.15, 0.45] } : { opacity: 0.3 }}
          transition={{ duration: 2.4, repeat: active ? Infinity : 0, ease: "easeInOut" }}
        />
        <span className="absolute left-[22%] top-[18%] size-[18%] rounded-full bg-background/70 blur-[1px]" />
      </motion.div>
    </div>
  );
}
