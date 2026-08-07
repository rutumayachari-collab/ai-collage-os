import { Container } from "./Container";

const LOGOS = [
  "Google",
  "Microsoft",
  "Amazon",
  "Infosys",
  "TCS",
  "Deloitte",
  "Accenture",
  "Wipro",
  "Adobe",
  "Flipkart",
  "Zomato",
  "Razorpay",
];

export function Recruiters() {
  const track = [...LOGOS, ...LOGOS];
  return (
    <section className="border-y border-border bg-background py-12">
      <Container>
        <div className="mb-6 text-center text-xs font-medium uppercase tracking-widest text-muted-foreground">
          Our graduates are hired by
        </div>
        <div className="relative overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_15%,black_85%,transparent)]">
          <div className="animate-marquee flex w-max items-center gap-12 whitespace-nowrap">
            {track.map((name, i) => (
              <div
                key={`${name}-${i}`}
                className="flex h-10 items-center rounded-lg px-4 font-heading text-lg font-semibold text-muted-foreground/70 transition hover:text-navy"
              >
                {name}
              </div>
            ))}
          </div>
        </div>
      </Container>
    </section>
  );
}
