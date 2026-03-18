import {
  BedDouble,
  Search,
  CalendarCheck,
  ShieldCheck,
  Star,
  Users,
  Clock,
} from "lucide-react";

const steps = [
  {
    icon: Search,
    title: "Search & Explore",
    description:
      "Browse thousands of accommodations across Indonesia. Filter by destination, property type, dates, and budget.",
  },
  {
    icon: CalendarCheck,
    title: "Book Instantly",
    description:
      "Reserve your perfect stay in seconds with our secure booking system. No hidden fees, no surprises.",
  },
  {
    icon: BedDouble,
    title: "Enjoy Your Stay",
    description:
      "Check in and make yourself at home. Every property is verified for quality and comfort.",
  },
];

const trustSignals = [
  {
    icon: ShieldCheck,
    title: "Verified Properties",
    description: "Every listing is reviewed and verified by our team.",
  },
  {
    icon: Star,
    title: "Genuine Reviews",
    description: "Real reviews from real guests help you choose confidently.",
  },
  {
    icon: Users,
    title: "24/7 Support",
    description: "Our support team is always ready to help, anytime you need.",
  },
  {
    icon: Clock,
    title: "Flexible Cancellation",
    description:
      "Plans change — most of our properties offer free cancellation.",
  },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen px-4">
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary/5 via-background to-accent/5 pt-32 pb-20 lg:pt-40 lg:pb-28">
        <div className="container mx-auto text-center">
          <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary mb-6">
            <BedDouble className="h-4 w-4" />
            About Rentivo
          </div>
          <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
            Your Gateway to
            <span className="text-gradient"> Perfect Stays</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground leading-relaxed">
            Rentivo connects travelers with the finest accommodations across
            Indonesia — from beachfront villas in Bali to cozy apartments in
            Bandung. We make finding and booking your dream stay effortless.
          </p>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 lg:py-28">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-foreground sm:text-4xl">
              How It Works
            </h2>
            <p className="mt-3 text-muted-foreground">
              Three simple steps to your perfect accommodation.
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            {steps.map((step, index) => {
              const Icon = step.icon;
              return (
                <div
                  key={step.title}
                  className="group relative rounded-2xl border border-border bg-card p-8 text-center transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
                >
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-bold shadow-lg">
                    {index + 1}
                  </div>
                  <div className="mx-auto mt-4 mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary transition-all duration-300 group-hover:bg-primary group-hover:text-primary-foreground group-hover:scale-110">
                    <Icon className="h-7 w-7" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">
                    {step.title}
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {step.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Trust & Safety */}
      <section className="bg-muted/30 py-20 lg:py-28">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-foreground sm:text-4xl">
              Why Choose Rentivo
            </h2>
            <p className="mt-3 text-muted-foreground">
              We prioritize your safety, comfort, and peace of mind.
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {trustSignals.map((signal) => {
              const Icon = signal.icon;
              return (
                <div
                  key={signal.title}
                  className="rounded-2xl border border-border bg-card p-6 transition-all duration-300 hover:shadow-lg"
                >
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-accent/10 text-accent">
                    <Icon className="h-6 w-6" />
                  </div>
                  <h3 className="text-base font-semibold text-foreground mb-1.5">
                    {signal.title}
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {signal.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}
