import React from "react";
import { Link } from "react-router";
import { Home, Mail, Phone, MapPin } from "lucide-react";

const footerSections = [
  {
    title: "Company",
    links: [
      { label: "About Us", href: "/about" },
      { label: "Careers", href: "/careers" },
      { label: "Blog", href: "/blog" },
    ],
  },
  {
    title: "Support",
    links: [
      { label: "Help Center", href: "/help" },
      { label: "Safety", href: "/safety" },
      { label: "Cancellation", href: "/cancellation" },
    ],
  },
  {
    title: "Hosting",
    links: [
      { label: "List Your Property", href: "/auth/register?role=tenant" },
      { label: "Host Resources", href: "/resources" },
      { label: "Community", href: "/community" },
    ],
  },
];

export const Footer = React.forwardRef<HTMLElement>(function Footer(_, ref) {
  return (
    <footer className="border-t border-border bg-secondary/50">
      <div className="container mx-auto py-12">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-4">
            <Link to="/" className="flex items-center gap-2">
              <Home className="h-5 w-5 text-primary" />
              <span className="text-lg font-bold text-foreground">Rentivo</span>
            </Link>
            <p className="text-sm text-muted-foreground">
              Find your perfect stay across Indonesia. Best prices, verified
              properties.
            </p>
            <div className="space-y-2 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                <span>hello@Rentivo.id</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4" />
                <span>+62 21 1234 5678</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                <span>Jakarta, Indonesia</span>
              </div>
            </div>
          </div>

          {footerSections.map((section) => (
            <div key={section.title}>
              <h3 className="mb-4 text-sm font-semibold text-foreground">
                {section.title}
              </h3>
              <ul className="space-y-3">
                {section.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      to={link.href}
                      className="text-sm text-muted-foreground transition-colors hover:text-primary"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-10 border-t border-border pt-6 text-center text-sm text-muted-foreground">
          © 2026 Rentivo. All rights reserved.
        </div>
      </div>
    </footer>
  );
});
