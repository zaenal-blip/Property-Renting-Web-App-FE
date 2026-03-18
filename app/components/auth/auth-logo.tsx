import { Link } from "react-router";
import { Home } from "lucide-react";

interface AuthLogoProps {
  /** Additional classes for the container, e.g. "justify-center" */
  className?: string;
}

/**
 * Rentivo logo used across all auth pages.
 * Links back to the homepage.
 */
export function AuthLogo({ className = "" }: AuthLogoProps) {
  return (
    <Link to="/" className={`flex items-center gap-2 mb-8 ${className}`}>
      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
        <Home className="h-6 w-6 text-primary-foreground" />
      </div>
      <span className="text-2xl font-bold text-foreground">Rentivo</span>
    </Link>
  );
}
