import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router";
import {
  Menu,
  X,
  Search,
  User,
  Home,
  ChevronDown,
  Hotel,
  Building,
  Tent,
  Trees,
} from "lucide-react";
import { Button } from "~/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "~/components/ui/sheet";
import { cn } from "~/lib/utils";
import { useScrollPosition } from "~/hooks/use-scroll-position";
import { useAuthStore } from "~/modules/auth/auth.store";
import { motion, AnimatePresence } from "framer-motion";

const navLinks = [{ label: "Home", href: "/" }];

const propertyTypes = [
  { label: "Hotel", value: "hotel", icon: Hotel },
  { label: "Villa", value: "villa", icon: Home },
  { label: "Resort", value: "resort", icon: Trees },
  { label: "Apartment", value: "apartment", icon: Building },
  { label: "Guesthouse", value: "guesthouse", icon: Tent },
];

export function Navbar() {
  const isScrolled = useScrollPosition(50);
  const { isAuthenticated, user } = useAuthStore();
  const [isOpen, setIsOpen] = useState(false);
  const [showSubbar, setShowSubbar] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const isHome = location.pathname === "/";
  const isSolid = isScrolled || !isHome;

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
        isSolid
          ? "bg-background/95 backdrop-blur-md shadow-md border-b border-border"
          : "bg-transparent",
      )}
    >
      <div className="container mx-auto flex h-16 items-center justify-between lg:h-20">
        <Link to="/" className="flex items-center gap-2">
          <Home
            className={cn(
              "h-6 w-6 transition-colors",
              isSolid ? "text-primary" : "text-accent",
            )}
          />
          <span
            className={cn(
              "text-xl font-bold transition-colors",
              isSolid ? "text-foreground" : "text-primary-foreground",
            )}
          >
            Rentivo
          </span>
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              to={link.href}
              className={cn(
                "text-sm font-medium transition-colors hover:text-accent",
                isSolid ? "text-foreground" : "text-primary-foreground/90",
              )}
            >
              {link.label}
            </Link>
          ))}

          <div className="flex items-center gap-1">
            <Link
              to="/properties"
              className={cn(
                "text-sm font-medium transition-colors hover:text-accent mr-2",
                isSolid ? "text-foreground" : "text-primary-foreground/90",
              )}
            >
              Properties
            </Link>

            <button
              onClick={() => setShowSubbar(!showSubbar)}
              className={cn(
                "flex items-center gap-1 text-sm font-medium transition-colors hover:text-accent px-2 py-1 rounded-md",
                isSolid
                  ? "text-muted-foreground hover:bg-muted/50"
                  : "text-primary-foreground/80 hover:bg-white/10",
              )}
            >
              Categories
              <ChevronDown
                className={cn(
                  "h-4 w-4 transition-transform duration-300",
                  showSubbar && "rotate-180",
                )}
              />
            </button>
          </div>
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          {isAuthenticated ? (
            <Button
              variant="ghost"
              size="sm"
              className={cn(
                "gap-2",
                !isSolid &&
                  "text-primary-foreground hover:bg-primary-foreground/10",
              )}
              onClick={() => navigate("/user/profile")}
            >
              <User className="h-4 w-4" />
              {user?.name || "Profile"}
            </Button>
          ) : (
            <>
              <Button
                variant={isSolid ? "ghost" : "hero-outline"}
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

        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild className="md:hidden">
            <Button
              variant="ghost"
              size="icon"
              className={cn(
                !isSolid &&
                  "text-primary-foreground hover:bg-primary-foreground/10",
              )}
            >
              {isOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-72">
            <nav className="mt-8 flex flex-col gap-4">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  to={link.href}
                  onClick={() => setIsOpen(false)}
                  className="rounded-lg px-4 py-3 text-sm font-medium text-foreground transition-colors hover:bg-muted"
                >
                  {link.label}
                </Link>
              ))}

              <div className="flex flex-col gap-2 px-4 py-2">
                <span className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                  Properties
                </span>
                <Link
                  to="/properties"
                  onClick={() => setIsOpen(false)}
                  className="rounded-lg px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted ml-2"
                >
                  All Properties
                </Link>
                {propertyTypes.map((type) => (
                  <Link
                    key={type.value}
                    to={`/properties?category=${type.value}`}
                    onClick={() => setIsOpen(false)}
                    className="rounded-lg px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted ml-2"
                  >
                    {type.label}
                  </Link>
                ))}
              </div>
              <div className="mt-4 flex flex-col gap-2 border-t border-border pt-4">
                <Button
                  variant="outline"
                  onClick={() => {
                    navigate("/auth/login");
                    setIsOpen(false);
                  }}
                >
                  Login
                </Button>
                <Button
                  variant="cta"
                  onClick={() => {
                    navigate("/auth/register");
                    setIsOpen(false);
                  }}
                >
                  Register
                </Button>
              </div>
            </nav>
          </SheetContent>
        </Sheet>
      </div>

      {/* Animated Dropdown Drawer Subbar */}
      <AnimatePresence>
        {showSubbar && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="w-full md:w-auto bg-background/95 backdrop-blur-md border-b border-x border-border rounded-b-3xl overflow-hidden shadow-xl absolute top-full left-1/2 -translate-x-1/2 z-40"
          >
            <div className="py-4 px-6 md:px-10">
              <div className="flex flex-wrap justify-center gap-2 md:gap-6">
                {propertyTypes.map((type) => {
                  const Icon = type.icon;
                  return (
                    <Link
                      key={type.value}
                      to={`/properties?category=${type.value}`}
                      onClick={() => setShowSubbar(false)}
                      className="flex items-center gap-3 px-4 py-2.5 rounded-full border border-transparent hover:border-border hover:bg-muted/50 transition-all group"
                    >
                      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary group-hover:text-primary-foreground text-primary transition-all duration-300 transform group-hover:scale-110">
                        <Icon className="h-5 w-5" />
                      </div>
                      <span className="text-sm font-semibold text-foreground">
                        {type.label}
                      </span>
                    </Link>
                  );
                })}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
