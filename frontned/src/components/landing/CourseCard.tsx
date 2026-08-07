import { motion } from "framer-motion";
import {
  HiArrowRight,
  HiOutlineClock,
  HiOutlineUserGroup,
  HiOutlineCurrencyRupee,
  HiOutlineStar,
  HiOutlineBriefcase,
  HiOutlineChip,
  HiOutlineHeart,
} from "react-icons/hi";

export type CourseTag = "Popular" | "New" | "AI Track" | "Scholarship";

type Props = {
  image: string;
  name: string;
  category: string;
  duration: string;
  seats: number;
  fees: string;
  rating?: number;
  placement?: string;
  highlights?: string[];
  tag?: CourseTag;
  index?: number;
};

const TAG_STYLES: Record<CourseTag, string> = {
  Popular: "bg-sky text-navy-deep",
  New: "bg-emerald-400 text-navy-deep",
  "AI Track": "bg-fuchsia-400 text-navy-deep",
  Scholarship: "bg-amber-400 text-navy-deep",
};

export function CourseCard({
  image,
  name,
  category,
  duration,
  seats,
  fees,
  rating = 4.8,
  placement = "96%",
  highlights = [],
  tag,
  index = 0,
}: Props) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.5, delay: index * 0.05 }}
      whileHover={{ y: -8 }}
      className="group relative flex flex-col overflow-hidden rounded-3xl border border-border bg-card shadow-sm transition-shadow duration-300 hover:shadow-elegant"
    >
      <div className="relative aspect-[16/10] overflow-hidden">
        <img
          src={image}
          alt={name}
          loading="lazy"
          width={768}
          height={512}
          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-navy-deep/80 via-navy-deep/10 to-transparent" />

        {/* Category chip */}
        <span className="absolute left-4 top-4 rounded-full bg-white/90 px-3 py-1 text-[11px] font-medium uppercase tracking-widest text-navy backdrop-blur">
          {category}
        </span>

        {/* Tag */}
        {tag && (
          <span
            className={`absolute right-4 top-4 rounded-full px-2.5 py-1 text-[11px] font-semibold shadow-sm ${TAG_STYLES[tag]}`}
          >
            {tag}
          </span>
        )}

        {/* Wishlist */}
        <button
          aria-label="Save course"
          className="absolute right-4 bottom-4 grid h-9 w-9 place-items-center rounded-full bg-white/90 text-navy opacity-0 backdrop-blur transition-all duration-300 hover:bg-white group-hover:opacity-100"
        >
          <HiOutlineHeart className="h-4 w-4" />
        </button>

        {/* Rating pill */}
        <div className="absolute left-4 bottom-4 flex items-center gap-1.5 rounded-full bg-navy-deep/80 px-2.5 py-1 text-xs text-white backdrop-blur">
          <HiOutlineStar className="h-3.5 w-3.5 text-amber-400" />
          <span className="font-medium">{rating.toFixed(1)}</span>
          <span className="text-white/60">/ 5</span>
        </div>
      </div>

      <div className="flex flex-1 flex-col p-6">
        <h3 className="font-heading text-lg font-semibold leading-snug text-foreground">{name}</h3>

        {highlights.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {highlights.map((h) => (
              <span
                key={h}
                className="inline-flex items-center gap-1 rounded-full border border-border bg-muted px-2 py-0.5 text-[11px] font-medium text-muted-foreground"
              >
                <HiOutlineChip className="h-3 w-3 text-sky" />
                {h}
              </span>
            ))}
          </div>
        )}

        <div className="mt-4 grid grid-cols-3 gap-2 text-xs">
          <Meta
            icon={<HiOutlineClock className="h-4 w-4 text-sky" />}
            value={duration}
            label="Duration"
          />
          <Meta
            icon={<HiOutlineUserGroup className="h-4 w-4 text-sky" />}
            value={String(seats)}
            label="Seats"
          />
          <Meta
            icon={<HiOutlineCurrencyRupee className="h-4 w-4 text-sky" />}
            value={fees}
            label="Fees / yr"
          />
        </div>

        {/* Placement bar */}
        <div className="mt-5">
          <div className="flex items-center justify-between text-[11px] text-muted-foreground">
            <span className="inline-flex items-center gap-1">
              <HiOutlineBriefcase className="h-3.5 w-3.5 text-sky" /> Placement rate
            </span>
            <span className="font-semibold text-navy">{placement}</span>
          </div>
          <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-muted">
            <motion.div
              initial={{ width: 0 }}
              whileInView={{ width: placement }}
              viewport={{ once: true }}
              transition={{ duration: 1.1, ease: "easeOut", delay: 0.2 }}
              className="h-full rounded-full bg-gradient-to-r from-sky to-sky-soft"
            />
          </div>
        </div>

        <div className="mt-6 flex items-center justify-between border-t border-border pt-4">
          <button className="inline-flex items-center gap-1.5 text-sm font-medium text-navy transition hover:text-sky">
            Learn more{" "}
            <HiArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </button>
          <button className="rounded-full bg-navy px-4 py-1.5 text-xs font-medium text-white transition hover:bg-navy-deep">
            Apply
          </button>
        </div>
      </div>
    </motion.article>
  );
}

function Meta({ icon, value, label }: { icon: React.ReactNode; value: string; label: string }) {
  return (
    <div className="rounded-lg bg-muted p-2 text-center">
      <span className="mx-auto flex h-4 items-center justify-center">{icon}</span>
      <div className="mt-1 font-medium text-foreground">{value}</div>
      <div className="text-muted-foreground">{label}</div>
    </div>
  );
}
