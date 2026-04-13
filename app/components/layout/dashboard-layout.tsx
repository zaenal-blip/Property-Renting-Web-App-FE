import { useState } from "react";
import { Outlet, Link, useLocation, useNavigate } from "react-router";
import {
  LayoutDashboard,
  Building2,
  FolderOpen,
  ClipboardList,
  Star,
  Settings,
  ChevronLeft,
  Menu,
  BedDouble,
  LogOut,
} from "lucide-react";
import { cn } from "~/lib/utils";
import { Button } from "~/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from "~/components/ui/sheet";
import { useAuthStore } from "~/modules/auth/auth.store";

const sidebarNav = [
  {
    label: "Overview",
    href: "/tenant/dashboard",
    icon: LayoutDashboard,
  },
  {
    label: "Properties",
    href: "/tenant/dashboard/properties",
    icon: Building2,
  },
  {
    label: "Categories",
    href: "/tenant/dashboard/categories",
    icon: FolderOpen,
  },
  {
    label: "Orders",
    href: "/tenant/dashboard/orders",
    icon: ClipboardList,
  },
  {
    label: "Reviews",
    href: "/tenant/dashboard/reviews",
    icon: Star,
  },
  {
    label: "Settings",
    href: "/tenant/dashboard/settings",
    icon: Settings,
  },
];

function getUserInitials(name?: string | null): string {
  if (!name) return "T";
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

// ─── Sidebar Content (shared between desktop and mobile) ────
function SidebarContent({
  collapsed,
  onNavigate,
}: {
  collapsed: boolean;
  onNavigate?: () => void;
}) {
  const location = useLocation();
  const { user, logout } = useAuthStore();

  const isActive = (href: string) => {
    if (href === "/tenant/dashboard") {
      return location.pathname === "/tenant/dashboard";
    }
    return location.pathname.startsWith(href);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div
        className={cn(
          "flex items-center gap-2.5 px-4 h-16 border-b border-border shrink-0",
          collapsed && "justify-center px-2",
        )}
      >
        <Link
          to="/"
          onClick={onNavigate}
          className="flex items-center gap-2.5 group"
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary shrink-0 transition-all group-hover:scale-105">
            <BedDouble className="h-5 w-5" />
          </div>
          {!collapsed && (
            <span className="text-lg font-bold tracking-tight text-foreground">
              Rentivo
            </span>
          )}
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {sidebarNav.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href);
          return (
            <Link
              key={item.href}
              to={item.href}
              onClick={onNavigate}
              className={cn(
                "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all",
                collapsed && "justify-center px-2",
                active
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground",
              )}
              title={collapsed ? item.label : undefined}
            >
              <Icon className="h-5 w-5 shrink-0" />
              {!collapsed && <span>{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* User Profile Footer */}
      <div className="border-t border-border p-3 shrink-0">
        <div
          className={cn(
            "flex items-center gap-3 rounded-xl px-3 py-2.5",
            collapsed && "justify-center px-2",
          )}
        >
          <Avatar className="h-9 w-9 shrink-0">
            {user?.profilePicture && (
              <AvatarImage src={user.profilePicture} alt={user.name} />
            )}
            <AvatarFallback className="bg-primary/10 text-primary text-xs font-bold">
              {getUserInitials(user?.name)}
            </AvatarFallback>
          </Avatar>
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold truncate">{user?.name}</p>
              <p className="text-xs text-muted-foreground truncate">
                {user?.email}
              </p>
            </div>
          )}
        </div>
        {!collapsed && (
          <Button
            variant="ghost"
            size="sm"
            className="w-full mt-1 text-muted-foreground hover:text-destructive gap-2 justify-start"
            onClick={() => logout()}
          >
            <LogOut className="h-4 w-4" />
            Logout
          </Button>
        )}
      </div>
    </div>
  );
}

// ─── Main Layout ────────────────────────────────────────
export default function DashboardLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="h-screen flex bg-muted/30 overflow-hidden">
      {/* Desktop Sidebar */}
      <aside
        className={cn(
          "hidden lg:flex flex-col border-r border-border bg-background transition-all duration-300 shrink-0 relative",
          collapsed ? "w-[72px]" : "w-64",
        )}
      >
        <SidebarContent collapsed={collapsed} />
        {/* Collapse Toggle */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="absolute top-[18px] -right-3 z-10 flex h-6 w-6 items-center justify-center rounded-full border border-border bg-background shadow-sm hover:bg-muted transition-colors"
        >
          <ChevronLeft
            className={cn(
              "h-3.5 w-3.5 text-muted-foreground transition-transform",
              collapsed && "rotate-180",
            )}
          />
        </button>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile Topbar */}
        <header className="lg:hidden flex items-center gap-3 h-14 px-4 border-b border-border bg-background shrink-0">
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="-ml-2">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-64 p-0" showCloseButton={false}>
              <SheetTitle className="sr-only">Dashboard Navigation</SheetTitle>
              <SidebarContent
                collapsed={false}
                onNavigate={() => setMobileOpen(false)}
              />
            </SheetContent>
          </Sheet>
          <Link to="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <BedDouble className="h-4 w-4" />
            </div>
            <span className="font-bold text-foreground">Rentivo</span>
          </Link>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
