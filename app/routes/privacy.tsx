import { motion } from "framer-motion";
import { Link } from "react-router";
import {
  ArrowLeft,
  Cookie,
  Database,
  Eye,
  Lock,
  Shield,
  UserCircle,
} from "lucide-react";

const SECTIONS = [
  {
    id: "information-collection",
    title: "1. Information We Collect",
    icon: Database,
  },
  { id: "information-use", title: "2. How We Use Information", icon: Eye },
  { id: "sharing", title: "3. Sharing & Disclosure", icon: UserCircle },
  { id: "security", title: "4. Data Security", icon: Lock },
  { id: "cookies", title: "5. Cookies & Tracking", icon: Cookie },
  { id: "rights", title: "6. Your Privacy Rights", icon: Shield },
];

export default function PrivacyPage() {
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
              Privacy Policy
            </h1>
            <p className="text-xl text-muted-foreground leading-relaxed">
              We care about your privacy. This policy explains how Rentivo
              collects, uses, processes, and protects your personal data when
              you use our platform.
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
                <Shield className="h-5 w-5 text-primary" />
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
                  Privacy Concerns?
                </h4>
                <p className="text-sm text-muted-foreground mb-4">
                  If you wish to request a copy of your data or have it deleted,
                  please contact our Data Protection Officer.
                </p>
                <a
                  href="mailto:privacy@rentivo.example.com"
                  className="text-sm font-medium text-primary hover:underline"
                >
                  Email Privacy Team &rarr;
                </a>
              </div>
            </div>
          </div>

          {/* Main Content (Prose) */}
          <div className="lg:w-3/4 max-w-3xl prose prose-slate dark:prose-invert prose-headings:font-semibold prose-a:text-primary prose-a:no-underline hover:prose-a:underline">
            <p className="lead text-lg text-muted-foreground mb-12">
              At Rentivo, we believe privacy is a fundamental human right. This
              privacy policy describes the information we process to support the
              Rentivo Platform.
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
                      We collect information you provide directly to us when you
                      use our Platform. This includes:
                    </p>
                    <ul className="list-disc pl-6 space-y-2 marker:text-primary">
                      <li>
                        <strong className="text-foreground">
                          Account Information:
                        </strong>{" "}
                        Name, email address, password, phone number, and profile
                        picture.
                      </li>
                      <li>
                        <strong className="text-foreground">
                          Payment Information:
                        </strong>{" "}
                        Credit card details, billing address (processed securely
                        by our payment partners, not stored on our servers).
                      </li>
                      <li>
                        <strong className="text-foreground">
                          Identity Verification:
                        </strong>{" "}
                        Images of government-issued ID, passports, or other
                        identifying information required for Tenant
                        verification.
                      </li>
                    </ul>
                  </div>
                )}

                {index === 1 && (
                  <div className="space-y-4 text-muted-foreground">
                    <p>
                      We use the personal information we collect to provide,
                      improve, and develop our Platform. Specifically, we use it
                      to:
                    </p>
                    <div className="grid sm:grid-cols-2 gap-4 mt-6">
                      <div className="p-4 rounded-xl border">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center mb-3">
                          <Eye className="h-4 w-4 text-primary" />
                        </div>
                        <h4 className="font-semibold text-foreground text-sm mb-1">
                          Provide Services
                        </h4>
                        <p className="text-xs">
                          Process bookings, payments, and facilitate
                          communication between Users and Tenants.
                        </p>
                      </div>
                      <div className="p-4 rounded-xl border">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center mb-3">
                          <Shield className="h-4 w-4 text-primary" />
                        </div>
                        <h4 className="font-semibold text-foreground text-sm mb-1">
                          Create Trust
                        </h4>
                        <p className="text-xs">
                          Verify identities, prevent fraud, and maintain a safe
                          environment for our community.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {index === 2 && (
                  <div className="space-y-4 text-muted-foreground">
                    <p>
                      We DO NOT sell your personal information to third parties.
                      We only share your information in the following
                      circumstances:
                    </p>
                    <p>
                      <strong className="text-foreground">
                        With Other Members:
                      </strong>{" "}
                      When you submit a booking request, we share necessary
                      information with the Tenant (name, past reviews, profile
                      picture) so they can accept your booking.
                    </p>
                    <p>
                      <strong className="text-foreground">
                        With Service Providers:
                      </strong>{" "}
                      We share information with third-party vendors who provide
                      services on our behalf, such as payment processing,
                      background checks, map APIs, and customer support.
                    </p>
                  </div>
                )}

                {index === 3 && (
                  <div className="space-y-4 text-muted-foreground">
                    <p>
                      We implement technical and organizational measures
                      designed to protect your personal information against
                      unauthorized access, loss, or alteration.
                    </p>
                    <div className="bg-primary/5 border border-primary/20 p-4 rounded-lg mt-4">
                      <p className="text-sm m-0">
                        While no system is 100% secure, we use industry-standard
                        encryption (TLS/SSL) to protect data in transit, and
                        encrypt sensitive information like passwords using
                        bcrypt hashing.
                      </p>
                    </div>
                  </div>
                )}

                {index === 4 && (
                  <div className="space-y-4 text-muted-foreground">
                    <p>
                      Rentivo uses cookies, tracking pixels, and similar
                      technologies to provide our Platform and generally
                      understand how users interact with our site.
                    </p>
                    <p>
                      You can modify your browser settings to decline cookies;
                      however, some features of the Platform may not function
                      properly if you do so. Session cookies are automatically
                      deleted when you close your browser, while persistent
                      cookies remain until they expire or are manually deleted.
                    </p>
                  </div>
                )}

                {index === 5 && (
                  <div className="space-y-4 text-muted-foreground">
                    <p>
                      Depending on your location (such as if you reside in the
                      EEA, UK, or California), you may have certain legal rights
                      regarding your personal information:
                    </p>
                    <ul className="list-disc pl-6 space-y-2 marker:text-primary">
                      <li>
                        The right to access the personal information we hold
                        about you.
                      </li>
                      <li>
                        The right to request the deletion of your personal
                        information ("right to be forgotten").
                      </li>
                      <li>
                        The right to correct inaccurate or incomplete
                        information.
                      </li>
                      <li>
                        The right to object to or restrict certain processing
                        activities.
                      </li>
                    </ul>
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
