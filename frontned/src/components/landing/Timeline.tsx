import { motion } from "framer-motion";
import {
  HiOutlineUserAdd,
  HiOutlineChatAlt,
  HiOutlineDocumentText,
  HiOutlineShieldCheck,
  HiOutlineBadgeCheck,
} from "react-icons/hi";
import { Container } from "./Container";
import { SectionTitle } from "./SectionTitle";

const STEPS = [
  {
    icon: <HiOutlineUserAdd className="h-6 w-6" />,
    title: "Register",
    description: "Create your profile in under 2 minutes.",
  },
  {
    icon: <HiOutlineChatAlt className="h-6 w-6" />,
    title: "Submit Inquiry",
    description: "Chat with the AI assistant to shortlist programmes.",
  },
  {
    icon: <HiOutlineDocumentText className="h-6 w-6" />,
    title: "Upload Documents",
    description: "Upload marksheets & IDs — auto-parsed by AI.",
  },
  {
    icon: <HiOutlineShieldCheck className="h-6 w-6" />,
    title: "Verification",
    description: "Instant verification with counsellor review.",
  },
  {
    icon: <HiOutlineBadgeCheck className="h-6 w-6" />,
    title: "Admission Confirmed",
    description: "Pay fees and download your admission letter.",
  },
];

export function Timeline() {
  return (
    <section id="admission" className="py-24 sm:py-28">
      <Container>
        <SectionTitle
          eyebrow="Admission Process"
          title="Five steps to enrol — fully guided by AI"
          subtitle="Every stage is automated, tracked and transparent. No queues, no paperwork chases."
        />
        <div className="relative mt-16">
          <div className="absolute left-6 top-0 h-full w-px bg-gradient-to-b from-sky via-sky/40 to-transparent md:left-1/2 md:-translate-x-px" />
          <div className="space-y-8">
            {STEPS.map((s, i) => {
              const left = i % 2 === 0;
              return (
                <motion.div
                  key={s.title}
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-60px" }}
                  transition={{ duration: 0.5, delay: i * 0.08 }}
                  className={`relative md:grid md:grid-cols-2 md:gap-10 ${left ? "" : "md:[direction:rtl]"}`}
                >
                  <div
                    className={`pl-16 md:pl-0 ${left ? "md:pr-10 md:text-right" : "md:pl-10 md:[direction:ltr]"}`}
                  >
                    <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
                      <div className="text-xs font-medium uppercase tracking-widest text-sky">
                        Step {i + 1}
                      </div>
                      <h3 className="mt-2 font-heading text-xl font-semibold text-foreground">
                        {s.title}
                      </h3>
                      <p className="mt-2 text-sm text-muted-foreground">{s.description}</p>
                    </div>
                  </div>
                  <div className="absolute left-0 top-4 grid h-12 w-12 place-items-center rounded-2xl bg-navy text-sky shadow-glow md:left-1/2 md:-translate-x-1/2">
                    {s.icon}
                  </div>
                  <div />
                </motion.div>
              );
            })}
          </div>
        </div>
      </Container>
    </section>
  );
}
