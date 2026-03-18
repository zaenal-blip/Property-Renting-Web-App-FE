import { useState, useMemo } from "react";
import { Link, useLocation, useNavigate } from "react-router";
import {
  Menu,
  X,
  User,
  Home,
  ChevronDown,
  Hotel,
  Building,
  Tent,
  Trees,
  MapPin,
  Info,
  Bookmark,
  CalendarCheck,
  LogOut,
  BedDouble,
  Search,
} from "lucide-react";
import { Button } from "~/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { cn } from "~/lib/utils";
import { useScrollPosition } from "~/hooks/use-scroll-position";
import { useAuthStore } from "~/modules/auth/auth.store";
import { mockProperties } from "~/data/mock-properties";

// ─── DATA ───────────────────────────────────────────────
const propertyTypes = [
  { label: "Hotel", value: "hotel", icon: Hotel },
  { label: "Villa", value: "villa", icon: Home },
  { label: "Resort", value: "resort", icon: Trees },
  { label: "Apartment", value: "apartment", icon: Building },
  { label: "Guesthouse", value: "guesthouse", icon: Tent },
];

const uniqueCities = Array.from(
  new Set(mockProperties.map((p) => p.city)),
).sort();

const destinations = uniqueCities.map((city) => ({
  label: city,
  value: city.toLowerCase(),
}));

// ─── HELPERS ────────────────────────────────────────────
function getUserInitials(name?: string | null): string {
  if (!name) return "U";
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

// ─── NAVBAR ─────────────────────────────────────────────
export function Navbar() {
  const isScrolled = useScrollPosition(50);
  const { isAuthenticated, user, logout } = useAuthStore();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mobileCategoriesOpen, setMobileCategoriesOpen] = useState(false);
  const [mobileDestinationsOpen, setMobileDestinationsOpen] = useState(false);
  const [destOpen, setDestOpen] = useState(false);
  const [catOpen, setCatOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [destSearch, setDestSearch] = useState("");
  const navigate = useNavigate();
  const location = useLocation();

  const isHome = location.pathname === "/";
  const isSolid = isScrolled || !isHome;

  // Filter destinations based on search with a cap for scalability
  const searchResult = useMemo(() => {
    const search = destSearch.trim().toLowerCase();
    const filtered = search
      ? destinations.filter((d) => d.label.toLowerCase().includes(search))
      : destinations;

    // Best practice: cap the results so the DOM doesn't get overloaded when city list grows to hundreds
    return {
      items: filtered.slice(0, 8),
      total: filtered.length,
      hasMore: filtered.length > 8,
    };
  }, [destSearch]);

  // Shared text color class
  const navTextClass = cn(
    "text-sm font-medium transition-colors",
    isSolid
      ? "text-foreground hover:text-primary"
      : "text-primary-foreground/90 hover:text-white",
  );

  const isActive = (path: string) => location.pathname === path;

  return (
    <>
      <header
        className={cn(
          "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
          isSolid
            ? "bg-background/95 backdrop-blur-md shadow-md border-b border-border"
            : "bg-transparent",
        )}
      >
        <div className="container mx-auto px-4 flex h-16 items-center justify-between lg:h-20">
          {/* ── Logo ── */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div
              className={cn(
                "flex h-9 w-9 items-center justify-center rounded-xl transition-all duration-300 group-hover:scale-105",
                isSolid
                  ? "bg-primary/10 text-primary"
                  : "bg-white/15 text-white",
              )}
            >
              <BedDouble className="h-5 w-5" />
            </div>
            <span
              className={cn(
                "text-xl font-bold tracking-tight transition-colors",
                isSolid ? "text-foreground" : "text-primary-foreground",
              )}
            >
              Rentivo
            </span>
          </Link>

          {/* ── Desktop Nav ── */}
          <nav className="hidden items-center gap-1 lg:flex">
            {/* Home */}
            <Link
              to="/"
              className={cn(
                navTextClass,
                "px-3 py-2 rounded-lg transition-colors",
                isActive("/") && isSolid && "text-primary font-semibold",
              )}
            >
              Home
            </Link>

            {/* Stays */}
            <Link
              to="/properties"
              className={cn(
                navTextClass,
                "px-3 py-2 rounded-lg transition-colors",
                isActive("/properties") &&
                  isSolid &&
                  "text-primary font-semibold",
              )}
            >
              Stays
            </Link>

            {/* Destinations Popover with Search */}
            <Popover
              open={destOpen}
              onOpenChange={(open) => {
                setDestOpen(open);
                if (!open) setDestSearch("");
              }}
            >
              <PopoverTrigger asChild>
                <button
                  className={cn(
                    navTextClass,
                    "flex items-center gap-1.5 px-3 py-2 rounded-lg outline-none",
                  )}
                >
                  Destinations
                  <ChevronDown
                    className={cn(
                      "h-3.5 w-3.5 opacity-60 transition-transform duration-200",
                      destOpen && "rotate-180",
                    )}
                  />
                </button>
              </PopoverTrigger>
              <PopoverContent
                align="center"
                sideOffset={12}
                className="w-64 p-0"
              >
                {/* Search input */}
                <div className="p-3 border-b border-border">
                  <div className="relative">
                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                    <input
                      type="text"
                      placeholder="Search city..."
                      value={destSearch}
                      onChange={(e) => setDestSearch(e.target.value)}
                      className="w-full rounded-lg border border-input bg-background py-2 pl-8 pr-3 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                    />
                  </div>
                </div>
                <div className="p-1.5 max-h-[300px] overflow-y-auto">
                  {searchResult.items.length > 0 ? (
                    <>
                      {searchResult.items.map((dest) => (
                        <button
                          key={dest.value}
                          onClick={() => {
                            navigate(`/properties?city=${dest.value}`);
                            setDestOpen(false);
                            setDestSearch("");
                          }}
                          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-foreground transition-colors hover:bg-muted cursor-pointer"
                        >
                          <span className="font-medium px-1">{dest.label}</span>
                        </button>
                      ))}
                      {searchResult.hasMore && (
                        <div className="px-3 pt-3 pb-2 mt-1 text-center text-xs font-medium text-muted-foreground border-t border-border">
                          {searchResult.total - 8} more cities available. Type
                          to search.
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="px-3 py-4 text-center text-sm text-muted-foreground">
                      No cities found
                    </div>
                  )}
                </div>
              </PopoverContent>
            </Popover>

            {/* Categories Popover */}
            <Popover open={catOpen} onOpenChange={setCatOpen}>
              <PopoverTrigger asChild>
                <button
                  className={cn(
                    navTextClass,
                    "flex items-center gap-1.5 px-3 py-2 rounded-lg outline-none",
                  )}
                >
                  Categories
                  <ChevronDown
                    className={cn(
                      "h-3.5 w-3.5 opacity-60 transition-transform duration-200",
                      catOpen && "rotate-180",
                    )}
                  />
                </button>
              </PopoverTrigger>
              <PopoverContent
                align="center"
                sideOffset={12}
                className="w-60 p-1.5"
              >
                <div className="grid gap-0.5">
                  {propertyTypes.map((type) => {
                    const Icon = type.icon;
                    return (
                      <button
                        key={type.value}
                        onClick={() => {
                          navigate(`/properties?category=${type.value}`);
                          setCatOpen(false);
                        }}
                        className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-foreground transition-colors hover:bg-muted cursor-pointer"
                      >
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary shrink-0">
                          <Icon className="h-4 w-4" />
                        </div>
                        <span className="font-medium">{type.label}</span>
                      </button>
                    );
                  })}
                </div>
              </PopoverContent>
            </Popover>

            {/* About */}
            <Link
              to="/about"
              className={cn(
                navTextClass,
                "px-3 py-2 rounded-lg transition-colors",
                isActive("/about") && isSolid && "text-primary font-semibold",
              )}
            >
              About
            </Link>
          </nav>

          {/* ── Desktop Auth / Profile ── */}
          <div className="hidden items-center gap-3 lg:flex">
            {isAuthenticated && user ? (
              <DropdownMenu
                modal={false}
                open={profileOpen}
                onOpenChange={setProfileOpen}
              >
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center gap-2.5 rounded-full p-1 pr-3 outline-none transition-colors hover:bg-muted/50">
                    <Avatar size="default">
                      {user.profilePicture && (
                        <AvatarImage
                          src={user.profilePicture}
                          alt={user.name}
                        />
                      )}
                      <AvatarFallback className="bg-primary text-primary-foreground text-xs font-bold">
                        {getUserInitials(user.name)}
                      </AvatarFallback>
                    </Avatar>
                    <span
                      className={cn(
                        "text-sm font-medium max-w-[100px] truncate",
                        isSolid ? "text-foreground" : "text-primary-foreground",
                      )}
                    >
                      {user.name?.split(" ")[0] || "Profile"}
                    </span>
                    <ChevronDown
                      className={cn(
                        "h-3.5 w-3.5 opacity-60 transition-transform duration-200",
                        isSolid
                          ? "text-muted-foreground"
                          : "text-primary-foreground/70",
                        profileOpen && "rotate-180",
                      )}
                    />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  sideOffset={12}
                  className="w-56"
                >
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col gap-0.5">
                      <p className="text-sm font-semibold">{user.name}</p>
                      <p className="text-xs text-muted-foreground truncate">
                        {user.email}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuGroup>
                    <DropdownMenuItem
                      className="cursor-pointer gap-3 py-2"
                      onClick={() => navigate("/user/bookings")}
                    >
                      <CalendarCheck className="h-4 w-4 text-muted-foreground" />
                      My Bookings
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="cursor-pointer gap-3 py-2"
                      onClick={() => navigate("/user/saved")}
                    >
                      <Bookmark className="h-4 w-4 text-muted-foreground" />
                      Saved Properties
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="cursor-pointer gap-3 py-2"
                      onClick={() => navigate("/user/profile")}
                    >
                      <User className="h-4 w-4 text-muted-foreground" />
                      Profile
                    </DropdownMenuItem>
                  </DropdownMenuGroup>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    variant="destructive"
                    className="cursor-pointer gap-3 py-2"
                    onClick={() => logout()}
                  >
                    <LogOut className="h-4 w-4" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <>
                <Button
                  variant={isSolid ? "outline" : "hero-outline"}
                  size="sm"
                  onClick={() => navigate("/login")}
                >
                  Login
                </Button>
                <Button
                  variant="cta"
                  size="sm"
                  onClick={() => navigate("/register")}
                >
                  Register
                </Button>
              </>
            )}
          </div>

          {/* ── Mobile Hamburger ── */}
          <Button
            variant="ghost"
            size="icon"
            className={cn(
              "lg:hidden",
              !isSolid &&
                "text-primary-foreground hover:bg-primary-foreground/10",
            )}
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </Button>
        </div>

        {/* ── Mobile Drawer (slides from top) ── */}
        <div
          className={cn(
            "lg:hidden overflow-hidden transition-all duration-300 ease-in-out border-t border-border/50",
            mobileOpen
              ? "max-h-[calc(100vh-4rem)] opacity-100"
              : "max-h-0 opacity-0 border-t-transparent",
          )}
        >
          <nav
            className={cn(
              "flex flex-col gap-1 px-4 pb-6 pt-2 bg-background/95 backdrop-blur-md",
              isSolid ? "" : "bg-background",
            )}
          >
            <Link
              to="/"
              onClick={() => setMobileOpen(false)}
              className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-foreground transition-colors hover:bg-muted"
            >
              <Home className="h-4 w-4 text-muted-foreground" />
              Home
            </Link>

            <Link
              to="/properties"
              onClick={() => setMobileOpen(false)}
              className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-foreground transition-colors hover:bg-muted"
            >
              <BedDouble className="h-4 w-4 text-muted-foreground" />
              Stays
            </Link>

            {/* ── Mobile Destinations ── */}
            <div>
              <button
                onClick={() =>
                  setMobileDestinationsOpen(!mobileDestinationsOpen)
                }
                className="flex w-full items-center justify-between rounded-xl px-4 py-3 text-sm font-medium text-foreground transition-colors hover:bg-muted"
              >
                <span className="flex items-center gap-3">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  Destinations
                </span>
                <ChevronDown
                  className={cn(
                    "h-4 w-4 text-muted-foreground transition-transform duration-200",
                    mobileDestinationsOpen && "rotate-180",
                  )}
                />
              </button>
              <div
                className={cn(
                  "overflow-hidden transition-all duration-200 ease-in-out",
                  mobileDestinationsOpen
                    ? "max-h-96 opacity-100"
                    : "max-h-0 opacity-0",
                )}
              >
                <div className="ml-6 mt-1 flex flex-col gap-0.5 border-l-2 border-border pl-4 pb-1">
                  {/* Reuse the capped searchResult for mobile to keep DOM light */}
                  {searchResult.items.map((dest) => (
                    <Link
                      key={dest.value}
                      to={`/properties?city=${dest.value}`}
                      onClick={() => setMobileOpen(false)}
                      className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-foreground transition-colors hover:bg-muted"
                    >
                      {dest.label}
                    </Link>
                  ))}
                  {searchResult.hasMore && (
                    <div className="px-3 py-2 text-xs text-muted-foreground italic">
                      + {searchResult.total - 8} more cities. View on desktop to
                      search.
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* ── Mobile Categories ── */}
            <div>
              <button
                onClick={() => setMobileCategoriesOpen(!mobileCategoriesOpen)}
                className="flex w-full items-center justify-between rounded-xl px-4 py-3 text-sm font-medium text-foreground transition-colors hover:bg-muted"
              >
                <span className="flex items-center gap-3">
                  <Hotel className="h-4 w-4 text-muted-foreground" />
                  Categories
                </span>
                <ChevronDown
                  className={cn(
                    "h-4 w-4 text-muted-foreground transition-transform duration-200",
                    mobileCategoriesOpen && "rotate-180",
                  )}
                />
              </button>
              <div
                className={cn(
                  "overflow-hidden transition-all duration-200 ease-in-out",
                  mobileCategoriesOpen
                    ? "max-h-96 opacity-100"
                    : "max-h-0 opacity-0",
                )}
              >
                <div className="ml-6 mt-1 flex flex-col gap-0.5 border-l-2 border-border pl-4 pb-1">
                  {propertyTypes.map((type) => {
                    const Icon = type.icon;
                    return (
                      <Link
                        key={type.value}
                        to={`/properties?category=${type.value}`}
                        onClick={() => setMobileOpen(false)}
                        className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-foreground transition-colors hover:bg-muted"
                      >
                        <Icon className="h-4 w-4 text-muted-foreground" />
                        {type.label}
                      </Link>
                    );
                  })}
                </div>
              </div>
            </div>

            <Link
              to="/about"
              onClick={() => setMobileOpen(false)}
              className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-foreground transition-colors hover:bg-muted"
            >
              <Info className="h-4 w-4 text-muted-foreground" />
              About
            </Link>

            {/* ── Mobile Auth ── */}
            <div className="mt-3 border-t border-border pt-4">
              {isAuthenticated && user ? (
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-3 px-4 py-3">
                    <Avatar size="default">
                      {user.profilePicture && (
                        <AvatarImage
                          src={user.profilePicture}
                          alt={user.name}
                        />
                      )}
                      <AvatarFallback className="bg-primary text-primary-foreground text-xs font-bold">
                        {getUserInitials(user.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col">
                      <span className="text-sm font-semibold">{user.name}</span>
                      <span className="text-xs text-muted-foreground truncate max-w-[180px]">
                        {user.email}
                      </span>
                    </div>
                  </div>
                  <Link
                    to="/user/bookings"
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-foreground transition-colors hover:bg-muted"
                  >
                    <CalendarCheck className="h-4 w-4 text-muted-foreground" />
                    My Bookings
                  </Link>
                  <Link
                    to="/user/saved"
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-foreground transition-colors hover:bg-muted"
                  >
                    <Bookmark className="h-4 w-4 text-muted-foreground" />
                    Saved Properties
                  </Link>
                  <Link
                    to="/user/profile"
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-foreground transition-colors hover:bg-muted"
                  >
                    <User className="h-4 w-4 text-muted-foreground" />
                    Profile
                  </Link>
                  <button
                    onClick={() => {
                      logout();
                      setMobileOpen(false);
                    }}
                    className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-destructive transition-colors hover:bg-destructive/10"
                  >
                    <LogOut className="h-4 w-4" />
                    Logout
                  </button>
                </div>
              ) : (
                <div className="flex flex-col gap-2 px-4">
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => {
                      navigate("/login");
                      setMobileOpen(false);
                    }}
                  >
                    Login
                  </Button>
                  <Button
                    variant="cta"
                    className="w-full"
                    onClick={() => {
                      navigate("/register");
                      setMobileOpen(false);
                    }}
                  >
                    Register
                  </Button>
                </div>
              )}
            </div>
          </nav>
        </div>
      </header>

      {/* ── Mobile Overlay ── */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}
    </>
  );
}
