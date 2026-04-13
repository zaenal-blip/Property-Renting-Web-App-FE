import { Outlet, Link, useLocation } from "react-router";
import { User, Shield, Bell, CreditCard } from "lucide-react";
import { cn } from "~/lib/utils";
import { Navbar } from "./navbar";
import { Footer } from "./footer";

const settingsNav = [
  {
    label: "Account",
    href: "/settings",
    icon: User,
    description: "Profile & personal info",
  },
  {
    label: "Security",
    href: "/settings/security",
    icon: Shield,
    description: "Password & login",
  },
  {
    label: "Notifications",
    href: "/settings/notifications",
    icon: Bell,
    description: "Email & alerts",
  },
  {
    label: "Payment History",
    href: "/settings/payments",
    icon: CreditCard,
    description: "Reservations & payments",
  },
];

export default function SettingsLayout() {
  const location = useLocation();

  const isActive = (href: string) => {
    if (href === "/settings") {
      return location.pathname === "/settings";
    }
    return location.pathname.startsWith(href);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 pt-20 lg:pt-24">
        <div className="container mx-auto px-4 py-8">
          {/* Page Header */}
          <div className="mb-8">
            <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
            <p className="text-muted-foreground mt-1">
              Manage your account settings and preferences.
            </p>
          </div>

          <div className="flex flex-col lg:flex-row gap-8">
            {/* Sidebar Navigation */}
            <aside className="lg:w-64 shrink-0">
              {/* Mobile: horizontal scrollable tabs */}
              <nav className="flex lg:flex-col gap-1 overflow-x-auto lg:overflow-visible pb-2 lg:pb-0 -mx-1 lg:mx-0">
                {settingsNav.map((item) => {
                  const Icon = item.icon;
                  const active = isActive(item.href);
                  return (
                    <Link
                      key={item.href}
                      to={item.href}
                      className={cn(
                        "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all whitespace-nowrap",
                        "hover:bg-muted",
                        active
                          ? "bg-primary/10 text-primary border border-primary/20"
                          : "text-muted-foreground hover:text-foreground",
                      )}
                    >
                      <Icon className="h-4 w-4 shrink-0" />
                      <div className="hidden lg:block">
                        <p className={cn(active && "text-primary")}>
                          {item.label}
                        </p>
                        <p className="text-xs text-muted-foreground font-normal">
                          {item.description}
                        </p>
                      </div>
                      <span className="lg:hidden">{item.label}</span>
                    </Link>
                  );
                })}
              </nav>
            </aside>

            {/* Content Area */}
            <div className="flex-1 min-w-0">
              <Outlet />
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
