import { HiOutlinePhone, HiOutlineMail, HiOutlineClock, HiOutlineLocationMarker } from "react-icons/hi";
import { Container } from "./Container";
import { SectionTitle } from "./SectionTitle";
import { Button } from "./Button";

export function Contact() {
  return (
    <section id="contact" className="py-24 sm:py-28">
      <Container>
        <SectionTitle
          eyebrow="Get in touch"
          title="Talk to our admissions team"
          subtitle="Have questions our AI didn't cover? Reach out and we'll respond within one business day."
        />
        <div className="mt-14 grid gap-8 lg:grid-cols-5">
          <div className="lg:col-span-2 space-y-4">
            <ContactRow icon={<HiOutlinePhone className="h-5 w-5" />} label="Phone" value="+91 80 4567 8900" />
            <ContactRow icon={<HiOutlineMail className="h-5 w-5" />} label="Email" value="admissions@ai-collegeos.edu" />
            <ContactRow icon={<HiOutlineClock className="h-5 w-5" />} label="Office Hours" value="Mon – Sat · 9:00 to 18:00 IST" />
            <ContactRow icon={<HiOutlineLocationMarker className="h-5 w-5" />} label="Campus" value="Knowledge Park, Bengaluru 560100" />

            <div className="mt-6 overflow-hidden rounded-2xl border border-border bg-card">
              <div className="relative aspect-[4/3] w-full bg-gradient-to-br from-navy to-navy-deep">
                <div className="absolute inset-0 opacity-30" style={{
                  backgroundImage: "radial-gradient(circle at 30% 40%, #38BDF8 0, transparent 40%), radial-gradient(circle at 70% 60%, #7DD3FC 0, transparent 40%)",
                }} />
                <div className="absolute inset-0 grid place-items-center text-white/80">
                  <div className="text-center">
                    <HiOutlineLocationMarker className="mx-auto h-8 w-8 text-sky" />
                    <div className="mt-2 text-sm">Google Maps placeholder</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <form
            onSubmit={(e) => e.preventDefault()}
            className="lg:col-span-3 rounded-3xl border border-border bg-card p-6 shadow-sm sm:p-8"
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Full name" placeholder="Aarav Sharma" />
              <Field label="Email" type="email" placeholder="aarav@example.com" />
              <Field label="Phone" placeholder="+91 98765 43210" />
              <Field label="Interested Programme" placeholder="B.Tech CSE & AI" />
            </div>
            <div className="mt-4">
              <label className="block text-sm font-medium text-foreground">Message</label>
              <textarea
                rows={5}
                placeholder="Tell us how we can help…"
                className="mt-1.5 w-full rounded-xl border border-input bg-background px-4 py-3 text-sm outline-none transition focus:border-sky focus:ring-2 focus:ring-sky/30"
              />
            </div>
            <div className="mt-6 flex items-center justify-between gap-3">
              <p className="text-xs text-muted-foreground">By submitting, you agree to our Privacy Policy.</p>
              <Button variant="secondary">Send message</Button>
            </div>
          </form>
        </div>
      </Container>
    </section>
  );
}

function ContactRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-start gap-4 rounded-2xl border border-border bg-card p-4">
      <span className="grid h-11 w-11 place-items-center rounded-xl bg-navy text-sky">{icon}</span>
      <div>
        <div className="text-xs font-medium uppercase tracking-widest text-muted-foreground">{label}</div>
        <div className="mt-0.5 font-medium text-foreground">{value}</div>
      </div>
    </div>
  );
}

function Field({ label, type = "text", placeholder }: { label: string; type?: string; placeholder?: string }) {
  return (
    <div>
      <label className="block text-sm font-medium text-foreground">{label}</label>
      <input
        type={type}
        placeholder={placeholder}
        className="mt-1.5 w-full rounded-xl border border-input bg-background px-4 py-3 text-sm outline-none transition focus:border-sky focus:ring-2 focus:ring-sky/30"
      />
    </div>
  );
}
