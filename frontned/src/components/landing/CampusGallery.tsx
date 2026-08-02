import { motion } from "framer-motion";
import { Container } from "./Container";
import { SectionTitle } from "./SectionTitle";
import aerial from "@/assets/campus-aerial.jpg";
import library from "@/assets/campus-library.jpg";
import quad from "@/assets/campus-quad.jpg";
import sports from "@/assets/campus-sports.jpg";

const TILES = [
  { src: aerial, alt: "Aerial view of the campus", label: "Main Campus", span: "md:col-span-2 md:row-span-2" },
  { src: library, alt: "Central library", label: "Central Library", span: "" },
  { src: quad, alt: "University quad", label: "Student Quad", span: "" },
  { src: sports, alt: "Sports complex", label: "Sports Arena", span: "md:col-span-2" },
];

export function CampusGallery() {
  return (
    <section className="py-24 sm:py-28">
      <Container>
        <SectionTitle
          eyebrow="Campus"
          title="A campus built to inspire — every corner"
          subtitle="From smart classrooms to open quads, our spaces are designed for focus, community and play."
        />
        <div className="mt-14 grid auto-rows-[220px] grid-cols-1 gap-4 sm:grid-cols-2 md:auto-rows-[240px] md:grid-cols-4">
          {TILES.map((t, i) => (
            <motion.figure
              key={t.label}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.5, delay: i * 0.06 }}
              className={`group relative overflow-hidden rounded-3xl border border-border ${t.span}`}
            >
              <img
                src={t.src}
                alt={t.alt}
                loading="lazy"
                className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-navy-deep/80 via-navy-deep/10 to-transparent" />
              <figcaption className="absolute inset-x-0 bottom-0 flex items-center justify-between p-5 text-white">
                <span className="font-heading text-sm font-semibold sm:text-base">{t.label}</span>
                <span className="rounded-full bg-white/10 px-2.5 py-1 text-[10px] font-medium uppercase tracking-widest backdrop-blur">
                  Explore
                </span>
              </figcaption>
            </motion.figure>
          ))}
        </div>
      </Container>
    </section>
  );
}
