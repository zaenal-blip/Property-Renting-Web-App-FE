import type { ReactNode } from "react";

interface AuthLayoutProps {
  children: ReactNode;
  imageSrc: string;
  imageAlt: string;
  quote: string;
  quoteAuthor: string;
}

/**
 * Shared two-panel layout for all auth pages:
 * - Left: form content (passed as children)
 * - Right: hero image with overlay quote (desktop only)
 */
export function AuthLayout({
  children,
  imageSrc,
  imageAlt,
  quote,
  quoteAuthor,
}: AuthLayoutProps) {
  return (
    <div className="min-h-screen flex">
      {/* Left Side — Form */}
      <div className="flex-1 flex items-center justify-center p-8">
        {children}
      </div>

      {/* Right Side — Image & Quote */}
      <div className="hidden lg:block lg:w-1/2 relative overflow-hidden">
        <img
          src={imageSrc}
          alt={imageAlt}
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-linear-to-t from-primary/90 to-primary/40" />
        <div className="absolute bottom-0 left-0 right-0 p-12">
          <blockquote className="text-primary-foreground">
            <p className="text-2xl font-semibold mb-4">"{quote}"</p>
            <footer className="text-primary-foreground/80">
              — {quoteAuthor}
            </footer>
          </blockquote>
        </div>
      </div>
    </div>
  );
}
