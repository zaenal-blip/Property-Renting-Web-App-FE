import { Outlet, Link, useLocation, redirect } from "react-router";
import { User, Shield, Bell, Building2 } from "lucide-react";
import { cn } from "~/lib/utils";
import { Navbar } from "./navbar";
import { Footer } from "./footer";
import { useAuthStore } from "~/modules/auth/auth.store";

export const clientLoader = () => {
  const user = useAuthStore.getState().user;
  if (!user) return redirect("/login");
  if (user.role !== "TENANT") return redirect("/");
  return { user };
};

const tenantSettingsNav = [
  {
    label: "Profile",
    href: "/tenant/settings",
    icon: User,
    description: "Personal information",
  },
  {
    label: "Business",
    href: "/tenant/settings/business",
    icon: Building2,
    description: "Business details",
  },
  {
    label: "Security",
    href: "/tenant/settings/security",
    icon: Shield,
    description: "Password & login",
  },
  {
    label: "Notifications",
    href: "/tenant/settings/notifications",
    icon: Bell,
    description: "Email & alerts",
  },
];

export default function TenantSettingsLayout() {
  const location = useLocation();

  const isActive = (href: string) => {
    if (href === "/tenant/settings") {
      return location.pathname === "/tenant/settings";
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
            <h1 className="text-2xl font-bold tracking-tight">
              Tenant Settings
            </h1>
            <p className="text-muted-foreground mt-1">
              Manage your account and business settings.
            </p>
          </div>

          <div className="flex flex-col lg:flex-row gap-8">
            {/* Sidebar Navigation */}
            <aside className="lg:w-64 shrink-0">
              <nav className="flex lg:flex-col gap-1 overflow-x-auto lg:overflow-visible pb-2 lg:pb-0 -mx-1 lg:mx-0">
                {tenantSettingsNav.map((item) => {
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
