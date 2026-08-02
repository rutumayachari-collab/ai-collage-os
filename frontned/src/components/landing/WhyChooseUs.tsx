import {
  HiOutlineChatAlt2, HiOutlineLightningBolt, HiOutlineAcademicCap,
  HiOutlineBriefcase, HiOutlineGift, HiOutlineOfficeBuilding,
} from "react-icons/hi";
import { Container } from "./Container";
import { SectionTitle } from "./SectionTitle";
import { FeatureCard } from "./FeatureCard";

const FEATURES = [
  { icon: <HiOutlineChatAlt2 className="h-6 w-6" />, title: "AI Admission Assistant", description: "A 24/7 conversational agent that answers queries, recommends programmes and pre-fills applications." },
  { icon: <HiOutlineLightningBolt className="h-6 w-6" />, title: "Fast Admission Process", description: "From inquiry to confirmation in under 72 hours with automated document verification." },
  { icon: <HiOutlineAcademicCap className="h-6 w-6" />, title: "Experienced Faculty", description: "Learn from PhDs and industry leaders shaping tomorrow's research and practice." },
  { icon: <HiOutlineBriefcase className="h-6 w-6" />, title: "Excellent Placements", description: "500+ recruiter partners with a 96% placement rate across engineering and management." },
  { icon: <HiOutlineGift className="h-6 w-6" />, title: "Scholarships", description: "Merit, need-based and diversity scholarships automatically matched to your profile." },
  { icon: <HiOutlineOfficeBuilding className="h-6 w-6" />, title: "Modern Campus", description: "Smart classrooms, research labs, sports arenas and residential hostels — all connected." },
];

export function WhyChooseUs() {
  return (
    <section id="about" className="py-24 sm:py-28">
      <Container>
        <SectionTitle
          eyebrow="Why AI-CollegeOS"
          title="Everything your admission office needs — in one platform"
          subtitle="Built for scale from day one. Admission today, then Student, Faculty, Placement, Library, Hostel and Finance modules — all sharing one intelligent core."
        />
        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f, i) => <FeatureCard key={f.title} {...f} index={i} />)}
        </div>
      </Container>
    </section>
  );
}
