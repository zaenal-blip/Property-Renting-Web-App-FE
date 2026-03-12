import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router";
import { Menu, X, Search, User, Home } from "lucide-react";
import { Button } from "~/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "~/components/ui/sheet";
import { cn } from "~/lib/utils";
import { useScrollPosition } from "~/hooks/use-scroll-position";
import { useAuthStore } from "~/modules/auth/auth.store";

const navLinks = [{ label: "Home", href: "/" }];

const propertyTypes = [
  { label: "Hotel", value: "hotel" },
  { label: "Villa", value: "villa" },
  { label: "Resort", value: "resort" },
  { label: "Apartment", value: "apartment" },
  { label: "Guesthouse", value: "guesthouse" },
];

export function Navbar() {
  const isScrolled = useScrollPosition(50);
  const { isAuthenticated, user } = useAuthStore();
  const [isOpen, setIsOpen] = useState(false);
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

          <div className="group h-full flex items-center">
            <Link
              to="/properties"
              className={cn(
                "text-sm font-medium transition-colors py-4 hover:text-accent",
                isSolid ? "text-foreground" : "text-primary-foreground/90",
              )}
            >
              Properties
            </Link>

            {/* Horizontal Mega Menu */}
            <div className="absolute left-0 top-16 hidden w-full group-hover:block">
              {/* Invisible bridge to prevent hover gap issues */}
              <div className="z-0 relative h-4 w-full bg-transparent" />

              <div className="bg-background/95 backdrop-blur-md shadow-md border-b border-border pointer-events-auto z-40 transform opacity-0 -translate-y-4 transition-all duration-300 ease-in-out group-hover:opacity-100 group-hover:translate-y-0">
                <div className="container mx-auto px-4 py-5">
                  <div className="flex flex-row items-center justify-center gap-10 md:gap-16">
                    <Link
                      to="/properties"
                      className="text-sm font-semibold text-foreground hover:text-accent transition-all hover:-translate-y-0.5"
                    >
                      All Properties
                    </Link>
                    {propertyTypes.map((type) => (
                      <Link
                        key={type.value}
                        to={`/properties?category=${type.value}`}
                        className="text-sm font-medium text-muted-foreground hover:text-accent transition-all hover:-translate-y-0.5"
                      >
                        {type.label}
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            </div>
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
    </header>
  );
}
