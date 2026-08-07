import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { HiOutlinePlusSm } from "react-icons/hi";
import { Container } from "./Container";
import { SectionTitle } from "./SectionTitle";

const ITEMS = [
  {
    q: "What is AI-CollegeOS and who is it for?",
    a: "AI-CollegeOS is a modular platform for higher education institutions. Module 1 automates admissions; upcoming modules cover Student, Faculty, Placement, Library, Hostel, Finance and ERP.",
  },
  {
    q: "How does the AI Admission Assistant work?",
    a: "It answers programme, fee and eligibility questions 24/7, recommends courses based on your profile, and can pre-fill your application from your uploaded documents.",
  },
  {
    q: "How long does the admission process take?",
    a: "Most students complete the flow — register, inquire, upload, verify, confirm — within 48 to 72 hours, depending on document turnaround.",
  },
  {
    q: "Can I apply for a scholarship separately?",
    a: "You don't need to. When you complete your profile, our system automatically matches you to every scholarship you qualify for.",
  },
  {
    q: "Is my data safe on the platform?",
    a: "Yes. Documents are encrypted at rest and in transit, and access is restricted to verified admission counsellors.",
  },
];

export function FAQ() {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <section className="bg-muted/40 py-24 sm:py-28">
      <Container>
        <SectionTitle eyebrow="FAQ" title="Answers to what students ask us most" />
        <div className="mx-auto mt-12 max-w-3xl divide-y divide-border overflow-hidden rounded-2xl border border-border bg-card">
          {ITEMS.map((item, i) => {
            const isOpen = open === i;
            return (
              <div key={item.q}>
                <button
                  onClick={() => setOpen(isOpen ? null : i)}
                  className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left"
                >
                  <span className="font-heading text-base font-medium text-foreground sm:text-lg">
                    {item.q}
                  </span>
                  <motion.span
                    animate={{ rotate: isOpen ? 45 : 0 }}
                    className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-navy text-sky"
                  >
                    <HiOutlinePlusSm className="h-5 w-5" />
                  </motion.span>
                </button>
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25 }}
                      className="overflow-hidden"
                    >
                      <p className="px-6 pb-5 text-sm leading-relaxed text-muted-foreground">
                        {item.a}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </Container>
    </section>
  );
}
