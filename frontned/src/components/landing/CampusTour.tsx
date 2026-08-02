import { motion } from "framer-motion";
import { HiPlay, HiOutlineCube, HiOutlineMap } from "react-icons/hi";
import { Container } from "./Container";
import { SectionTitle } from "./SectionTitle";
import { Button } from "./Button";
import aerial from "@/assets/campus-aerial.jpg";

export function CampusTour() {
  return (
    <section className="py-24 sm:py-28">
      <Container>
        <SectionTitle
          eyebrow="Virtual Tour"
          title="Walk the campus — from wherever you are"
          subtitle="Explore classrooms, labs, hostels and open spaces in an immersive 360° tour."
        />

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.7 }}
          className="relative mt-12 overflow-hidden rounded-3xl border border-border shadow-elegant"
        >
          <img
            src={aerial}
            alt="Campus virtual tour preview"
            loading="lazy"
            className="h-[380px] w-full object-cover sm:h-[520px]"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-navy-deep via-navy-deep/40 to-navy-deep/10" />

          {/* Play button */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="absolute left-1/2 top-1/2 grid h-20 w-20 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-sky text-navy-deep shadow-[0_20px_60px_-10px_rgba(56,189,248,0.6)]"
            aria-label="Start virtual tour"
          >
            <span className="absolute inset-0 -z-10 animate-ping rounded-full bg-sky/40" />
            <HiPlay className="ml-1 h-8 w-8" />
          </motion.button>

          {/* Bottom bar */}
          <div className="absolute inset-x-0 bottom-0 flex flex-col gap-4 p-6 sm:flex-row sm:items-end sm:justify-between sm:p-8">
            <div>
              <div className="flex flex-wrap items-center gap-2 text-xs text-white/70">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-2.5 py-1 backdrop-blur">
                  <HiOutlineCube className="h-3.5 w-3.5" /> 360° · 12 stops
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-2.5 py-1 backdrop-blur">
                  <HiOutlineMap className="h-3.5 w-3.5" /> Interactive map
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-400/20 px-2.5 py-1 text-emerald-300 backdrop-blur">
                  Live · 42 exploring now
                </span>
              </div>
              <h3 className="mt-3 font-heading text-2xl font-semibold text-white sm:text-3xl">
                Take the immersive 360° campus tour
              </h3>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button variant="primary">Start Tour</Button>
              <Button variant="outline">Book a visit</Button>
            </div>
          </div>
        </motion.div>
      </Container>
    </section>
  );
}
