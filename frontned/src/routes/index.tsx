import { createFileRoute } from "@tanstack/react-router";
import { Navbar } from "@/components/landing/Navbar";
import { Hero } from "@/components/landing/Hero";
import { Stats } from "@/components/landing/Stats";
import { Recruiters } from "@/components/landing/Recruiters";
import { WhyChooseUs } from "@/components/landing/WhyChooseUs";
import { AIDashboard } from "@/components/landing/AIDashboard";
import { Courses } from "@/components/landing/Courses";
import { Timeline } from "@/components/landing/Timeline";
import { CampusGallery } from "@/components/landing/CampusGallery";
import { Scholarships } from "@/components/landing/Scholarships";
import { SuccessStories } from "@/components/landing/SuccessStories";
import { Testimonials } from "@/components/landing/Testimonials";
import { News } from "@/components/landing/News";
import { CampusTour } from "@/components/landing/CampusTour";
import { Accreditation } from "@/components/landing/Accreditation";
import { FAQ } from "@/components/landing/FAQ";
import { Contact } from "@/components/landing/Contact";
import { Footer } from "@/components/landing/Footer";
import { ChatButton } from "@/components/landing/ChatButton";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "AI-CollegeOS — AI-Powered College Admission Automation" },
      {
        name: "description",
        content:
          "AI-CollegeOS automates college admissions end-to-end — from inquiry to confirmation — with a 24/7 AI assistant, instant document verification and smart scholarship matching.",
      },
      { property: "og:title", content: "AI-CollegeOS — AI-Powered College Admission Automation" },
      {
        property: "og:description",
        content:
          "Streamline enrolments with an intelligent SaaS platform: admissions today, and Student, Faculty, Placement, Library, Hostel and Finance modules next.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Landing,
});

function Landing() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      <main>
        <Hero />
        <Stats />
        <Recruiters />
        <WhyChooseUs />
        <AIDashboard />
        <Courses />
        <Timeline />
        <CampusGallery />
        <Scholarships />
        <SuccessStories />
        <Testimonials />
        <News />
        <CampusTour />
        <Accreditation />
        <FAQ />
        <Contact />
      </main>
      <Footer />
      <ChatButton />
    </div>
  );
}
