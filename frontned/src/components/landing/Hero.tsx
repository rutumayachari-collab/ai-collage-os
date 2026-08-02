import { motion } from "framer-motion";
import { HiArrowRight, HiOutlineChat, HiOutlineShieldCheck, HiOutlineLightningBolt } from "react-icons/hi";
import heroImg from "@/assets/hero-ai-students.jpg";
import { Button } from "./Button";
import { Container } from "./Container";

export function Hero() {
  return (
    <section id="home" className="gradient-hero relative overflow-hidden pt-28 pb-20 sm:pt-36 sm:pb-28">
      {/* Floating shapes */}
      <div className="pointer-events-none absolute inset-0">
        <div className="animate-float absolute left-[6%] top-24 h-24 w-24 rounded-3xl bg-sky/20 blur-2xl" />
        <div className="animate-float-alt absolute right-[10%] top-40 h-32 w-32 rounded-full bg-sky-soft/20 blur-3xl" />
        <div className="animate-float absolute bottom-16 left-[20%] h-40 w-40 rounded-full bg-sky/10 blur-3xl" />
        <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-b from-transparent to-navy-deep" />
      </div>

      <Container className="relative">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: "easeOut" }}
          >
            <span className="inline-flex items-center gap-2 rounded-full border border-sky/30 bg-sky/10 px-3 py-1 text-xs font-medium text-sky-soft">
              <span className="h-1.5 w-1.5 rounded-full bg-sky animate-pulse" />
              Introducing AI-CollegeOS · Admission Module
            </span>

            <h1 className="mt-6 font-heading text-4xl font-semibold leading-[1.05] text-white sm:text-5xl md:text-6xl lg:text-[68px]">
              AI-Powered <span className="text-gradient-sky">College Admission</span> Automation
            </h1>

            <p className="mt-6 max-w-xl text-base leading-relaxed text-white/70 sm:text-lg">
              Streamline enrolments end-to-end — from inquiry to confirmation — with an intelligent assistant that guides students, verifies documents and helps your team convert faster.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Button size="lg" rightIcon={<HiArrowRight className="h-5 w-5" />}>Apply Now</Button>
              <Button size="lg" variant="outline" leftIcon={<HiOutlineChat className="h-5 w-5" />}>
                Talk to AI Assistant
              </Button>
            </div>

            <div className="mt-10 flex flex-wrap items-center gap-x-6 gap-y-3 text-sm text-white/60">
              <div className="flex items-center gap-2"><HiOutlineShieldCheck className="h-5 w-5 text-sky" /> Verified profiles</div>
              <div className="flex items-center gap-2"><HiOutlineLightningBolt className="h-5 w-5 text-sky" /> 3-minute onboarding</div>
              <div className="flex items-center gap-2"><HiOutlineChat className="h-5 w-5 text-sky" /> 24/7 AI support</div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, ease: "easeOut", delay: 0.15 }}
            className="relative"
          >
            <div className="relative mx-auto max-w-xl">
              <div className="absolute -inset-6 rounded-[2rem] bg-sky/20 blur-3xl" />
              <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-2 shadow-elegant backdrop-blur">
                <img
                  src={heroImg}
                  alt="Students collaborating with the AI-CollegeOS assistant"
                  width={1280}
                  height={1024}
                  className="h-auto w-full rounded-2xl"
                />
              </div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6, duration: 0.5 }}
                className="glass-dark absolute -left-4 bottom-8 hidden rounded-2xl p-4 text-white shadow-elegant sm:block"
              >
                <div className="text-xs text-white/60">Applications this week</div>
                <div className="mt-1 font-heading text-2xl font-semibold">+1,284</div>
                <div className="mt-1 text-xs text-sky">▲ 24% vs last week</div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8, duration: 0.5 }}
                className="glass-dark absolute -right-4 top-6 hidden items-center gap-3 rounded-2xl p-3 text-white shadow-elegant sm:flex"
              >
                <span className="grid h-9 w-9 place-items-center rounded-xl bg-sky text-navy-deep">
                  <HiOutlineChat className="h-5 w-5" />
                </span>
                <div>
                  <div className="text-xs text-white/60">AI Assistant</div>
                  <div className="text-sm font-medium">Ready to help</div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </Container>
    </section>
  );
}
