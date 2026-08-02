import { useState } from "react";
import { Container } from "./Container";
import { SectionTitle } from "./SectionTitle";
import { CourseCard, type CourseTag } from "./CourseCard";
import cs from "@/assets/course-cs.jpg";
import mba from "@/assets/course-mba.jpg";
import mech from "@/assets/course-mech.jpg";
import bio from "@/assets/course-bio.jpg";

type Course = {
  image: string;
  name: string;
  category: string;
  duration: string;
  seats: number;
  fees: string;
  rating: number;
  placement: string;
  highlights: string[];
  tag?: CourseTag;
  stream: "All" | "Engineering" | "Management" | "Sciences";
};

const COURSES: Course[] = [
  {
    image: cs, name: "B.Tech · Computer Science & AI", category: "Undergraduate",
    duration: "4 yrs", seats: 180, fees: "₹1.8L", rating: 4.9, placement: "98%",
    highlights: ["Machine Learning", "Cloud", "Cyber"], tag: "AI Track", stream: "Engineering",
  },
  {
    image: mba, name: "MBA · Business Analytics", category: "Postgraduate",
    duration: "2 yrs", seats: 120, fees: "₹3.2L", rating: 4.8, placement: "95%",
    highlights: ["Analytics", "Finance", "Strategy"], tag: "Popular", stream: "Management",
  },
  {
    image: mech, name: "B.Tech · Mechanical & Robotics", category: "Undergraduate",
    duration: "4 yrs", seats: 120, fees: "₹1.6L", rating: 4.7, placement: "92%",
    highlights: ["Robotics", "CAD", "IoT"], tag: "New", stream: "Engineering",
  },
  {
    image: bio, name: "B.Sc · Biotechnology", category: "Undergraduate",
    duration: "3 yrs", seats: 90, fees: "₹1.2L", rating: 4.6, placement: "88%",
    highlights: ["Genomics", "Bioinformatics"], tag: "Scholarship", stream: "Sciences",
  },
];

const FILTERS: Course["stream"][] = ["All", "Engineering", "Management", "Sciences"];

export function Courses() {
  const [active, setActive] = useState<Course["stream"]>("All");
  const list = active === "All" ? COURSES : COURSES.filter((c) => c.stream === active);

  return (
    <section id="courses" className="bg-muted/40 py-24 sm:py-28">
      <Container>
        <SectionTitle
          eyebrow="Programmes"
          title="Explore flagship programmes"
          subtitle="Industry-aligned curriculum, hands-on labs, and AI-guided personalisation across every course we offer."
        />

        <div className="mt-10 flex flex-wrap items-center justify-center gap-2">
          {FILTERS.map((f) => {
            const isActive = active === f;
            return (
              <button
                key={f}
                onClick={() => setActive(f)}
                className={`rounded-full border px-4 py-2 text-sm font-medium transition ${
                  isActive
                    ? "border-navy bg-navy text-white shadow-sm"
                    : "border-border bg-card text-muted-foreground hover:border-sky hover:text-navy"
                }`}
              >
                {f}
              </button>
            );
          })}
        </div>

        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {list.map((c, i) => <CourseCard key={c.name} {...c} index={i} />)}
        </div>
      </Container>
    </section>
  );
}
