import { motion } from "framer-motion";
import { Link } from "react-router";
import {
  ArrowLeft,
  CheckCircle2,
  FileText,
  Scale,
  ShieldAlert,
  ShieldCheck,
} from "lucide-react";

const SECTIONS = [
  { id: "acceptance", title: "1. Acceptance of Terms", icon: CheckCircle2 },
  { id: "user-accounts", title: "2. User Accounts", icon: FileText },
  { id: "booking", title: "3. Booking & Payments", icon: Scale },
  { id: "cancellations", title: "4. Cancellations", icon: ShieldAlert },
  { id: "liability", title: "5. Limitation of Liability", icon: ShieldCheck },
];

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative py-24 bg-primary/5 overflow-hidden border-b">
        <div className="absolute inset-0 bg-grid-black/[0.02] dark:bg-grid-white/[0.02]" />
        <div className="container relative mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-3xl"
          >
            <Link
              to="/register"
              className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-primary transition-colors mb-6"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to registration
            </Link>
            <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-foreground mb-6">
              Terms of Service
            </h1>
            <p className="text-xl text-muted-foreground leading-relaxed">
              Please read these terms carefully before using Rentivo. They cover
              everything you need to know about using our property rental
              platform.
            </p>
            <div className="mt-8 flex items-center gap-4 text-sm text-muted-foreground">
              <span className="font-medium text-foreground">Last updated:</span>
              March 13, 2026
            </div>
          </motion.div>
        </div>
      </section>

      {/* Content Section */}
      <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="flex flex-col lg:flex-row gap-12 lg:gap-24 relative">
          {/* Sidebar / Table of Contents */}
          <div className="lg:w-1/4">
            <div className="sticky top-24">
              <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                Table of Contents
              </h3>
              <nav className="space-y-1 border-l-2 border-primary/10 pl-4">
                {SECTIONS.map((section) => (
                  <a
                    key={section.id}
                    href={`#${section.id}`}
                    className="group flex items-center gap-3 py-2 text-sm text-muted-foreground hover:text-primary transition-colors hover:font-medium"
                  >
                    <section.icon className="h-4 w-4 opacity-50 group-hover:opacity-100 transition-opacity" />
                    {section.title}
                  </a>
                ))}
              </nav>

              <div className="mt-12 p-6 bg-primary/5 rounded-2xl border border-primary/10">
                <h4 className="font-semibold text-foreground mb-2">
                  Have questions?
                </h4>
                <p className="text-sm text-muted-foreground mb-4">
                  If you have any questions about these terms, our support team
                  is here to help.
                </p>
                <a
                  href="mailto:support@rentivo.example.com"
                  className="text-sm font-medium text-primary hover:underline"
                >
                  Contact Support &rarr;
                </a>
              </div>
            </div>
          </div>

          {/* Main Content (Prose) */}
          <div className="lg:w-3/4 max-w-3xl prose prose-slate dark:prose-invert prose-headings:font-semibold prose-a:text-primary prose-a:no-underline hover:prose-a:underline">
            <p className="lead text-lg text-muted-foreground mb-12">
              Welcome to Rentivo! By accessing or using our websites,
              applications, and other offerings (collectively, the "Platform"),
              you agree to comply with and be bound by these Terms of Service.
            </p>

            {SECTIONS.map((section, index) => (
              <motion.div
                key={section.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ delay: index * 0.1 }}
                className="scroll-mt-32 mb-16"
                id={section.id}
              >
                <h2 className="text-2xl font-bold flex items-center gap-3 text-foreground mb-6 pb-2 border-b">
                  <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                    <section.icon className="h-5 w-5 text-primary" />
                  </div>
                  {section.title}
                </h2>

                {/* Specific dummy content based on index for variety */}
                {index === 0 && (
                  <div className="space-y-4 text-muted-foreground">
                    <p>
                      These Terms constitute a legally binding agreement between
                      you and Rentivo governing your access to and use of the
                      Rentivo Platform.
                    </p>
                    <ul className="list-disc pl-6 space-y-2 marker:text-primary">
                      <li>
                        You must be at least 18 years old to use the Platform.
                      </li>
                      <li>
                        You must provide accurate, current, and complete
                        information during the registration process.
                      </li>
                      <li>
                        You are responsible for safeguarding your password and
                        account credentials.
                      </li>
                    </ul>
                  </div>
                )}

                {index === 1 && (
                  <div className="space-y-4 text-muted-foreground">
                    <p>
                      To access certain features of the Platform, you must
                      register for an account. We offer two primary account
                      types:
                    </p>
                    <div className="grid sm:grid-cols-2 gap-4 mt-6">
                      <div className="p-5 rounded-xl bg-muted border">
                        <h4 className="font-semibold text-foreground mb-2">
                          User Accounts
                        </h4>
                        <p className="text-sm">
                          For travelers looking to book properties for
                          short-term stays.
                        </p>
                      </div>
                      <div className="p-5 rounded-xl bg-muted border">
                        <h4 className="font-semibold text-foreground mb-2">
                          Tenant (Host) Accounts
                        </h4>
                        <p className="text-sm">
                          For property owners looking to list their spaces on
                          our platform.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {index === 2 && (
                  <div className="space-y-4 text-muted-foreground">
                    <p>
                      When a booking is confirmed, Rentivo collects the total
                      amount due from the User. We act as a limited payment
                      collection agent for the Tenant.
                    </p>
                    <p>
                      All prices are shown in IDR (Indonesian Rupiah) unless
                      otherwise specified. We reserve the right to change our
                      service fees at any time, but we will provide adequate
                      notice of any fee changes before they become effective.
                    </p>
                  </div>
                )}

                {index === 3 && (
                  <div className="space-y-4 text-muted-foreground">
                    <p>
                      Tenants can choose from our standardized cancellation
                      policies (Flexible, Moderate, or Strict). The specific
                      policy applying to a reservation will be clearly displayed
                      before booking.
                    </p>
                    <div className="bg-amber-50 dark:bg-amber-950/30 border-l-4 border-amber-500 p-4 rounded-r-lg mt-4">
                      <p className="text-sm text-amber-800 dark:text-amber-200 m-0">
                        <strong className="font-semibold">Important:</strong>{" "}
                        Rentivo service fees are generally non-refundable unless
                        a host cancels the reservation before check-in.
                      </p>
                    </div>
                  </div>
                )}

                {index === 4 && (
                  <div className="space-y-4 text-muted-foreground">
                    <p>
                      To the maximum extent permitted by law, Rentivo shall not
                      be liable for any incidental, special, exemplary, or
                      consequential damages, including lost profits, loss of
                      data, or loss of goodwill.
                    </p>
                    <p>
                      Rentivo does not own, control, or manage any of the
                      Properties listed on our platform. We simply facilitate
                      the connection between Users and Tenants.
                    </p>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
