import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { HiOutlineChat, HiX, HiOutlinePaperAirplane, HiOutlineSparkles } from "react-icons/hi";

export function ChatButton() {
  const [open, setOpen] = useState(false);

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.96 }}
            transition={{ duration: 0.2 }}
            className="mb-3 w-80 overflow-hidden rounded-3xl border border-border bg-card shadow-elegant"
          >
            <div className="flex items-center gap-3 bg-navy p-4 text-white">
              <span className="grid h-9 w-9 place-items-center rounded-xl bg-sky text-navy-deep">
                <HiOutlineSparkles className="h-5 w-5" />
              </span>
              <div>
                <div className="font-heading text-sm font-semibold">AI Admission Assistant</div>
                <div className="text-xs text-white/60">Typically replies in seconds</div>
              </div>
            </div>
            <div className="space-y-3 p-4 text-sm">
              <div className="max-w-[85%] rounded-2xl bg-muted p-3 text-foreground">
                Hi! I'm your admission assistant. Ask me about programmes, fees or the application
                process.
              </div>
              <div className="flex flex-wrap gap-2">
                {["Explore courses", "Check eligibility", "Scholarships"].map((s) => (
                  <button
                    key={s}
                    className="rounded-full border border-border px-3 py-1 text-xs text-muted-foreground hover:border-sky hover:text-sky"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex items-center gap-2 border-t border-border p-3">
              <input
                placeholder="Ask a question…"
                className="flex-1 rounded-full border border-input bg-background px-4 py-2 text-sm outline-none focus:border-sky focus:ring-2 focus:ring-sky/30"
              />
              <button className="grid h-9 w-9 place-items-center rounded-full bg-sky text-navy-deep hover:bg-sky-soft">
                <HiOutlinePaperAirplane className="h-4 w-4 rotate-90" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setOpen((v) => !v)}
        className="group relative grid h-14 w-14 place-items-center rounded-full bg-sky text-navy-deep shadow-[0_10px_30px_-8px_rgba(56,189,248,0.6)]"
        aria-label="Open AI chat"
      >
        <span className="absolute inset-0 -z-10 animate-ping rounded-full bg-sky/40" />
        {open ? <HiX className="h-6 w-6" /> : <HiOutlineChat className="h-6 w-6" />}
      </motion.button>
    </div>
  );
}
