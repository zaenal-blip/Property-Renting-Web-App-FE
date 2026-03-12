import { useState, useEffect, useCallback } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "~/components/ui/button";
import promo1 from "~/assets/promo-1.jpg";
import promo2 from "~/assets/promo-2.jpg";
import { cn } from "~/lib/utils";

const promos = [
  {
    id: 1,
    image: promo1,
    title: "Diskon Hingga 50%",
    subtitle: "Nikmati penawaran spesial untuk liburan akhir tahun",
  },
  {
    id: 2,
    image: promo2,
    title: "Free Cancellation",
    subtitle:
      "Flexible bookings with full refund up to 24 hours before check-in",
  },
];

export function PromoCarousel() {
  const [current, setCurrent] = useState(0);

  const next = useCallback(() => {
    setCurrent((prev) => (prev + 1) % promos.length);
  }, []);

  const prev = useCallback(() => {
    setCurrent((prev) => (prev - 1 + promos.length) % promos.length);
  }, []);

  useEffect(() => {
    const timer = setInterval(next, 4000);
    return () => clearInterval(timer);
  }, [next]);

  return (
    <section className="container mx-auto py-8 md:py-12">
      <div className="relative overflow-hidden rounded-2xl">
        <div
          className="flex transition-transform duration-500 ease-out"
          style={{ transform: `translateX(-${current * 100}%)` }}
        >
          {promos.map((promo) => (
            <div key={promo.id} className="relative min-w-full">
              <img
                src={promo.image}
                alt={promo.title}
                className="h-48 w-full object-cover md:h-72 lg:h-80"
              />
              <div className="hero-gradient absolute inset-0 flex items-end p-6 md:p-10">
                <div>
                  <h3 className="text-xl font-bold text-primary-foreground md:text-3xl">
                    {promo.title}
                  </h3>
                  <p className="mt-1 text-sm text-primary-foreground/80 md:text-base">
                    {promo.subtitle}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <Button
          variant="ghost"
          size="icon"
          className="absolute left-3 top-1/2 -translate-y-1/2 bg-background/30 text-primary-foreground backdrop-blur-sm hover:bg-background/50"
          onClick={prev}
        >
          <ChevronLeft className="h-5 w-5" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="absolute right-3 top-1/2 -translate-y-1/2 bg-background/30 text-primary-foreground backdrop-blur-sm hover:bg-background/50"
          onClick={next}
        >
          <ChevronRight className="h-5 w-5" />
        </Button>

        <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-2">
          {promos.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              className={cn(
                "h-2 rounded-full transition-all duration-300",
                i === current
                  ? "w-6 bg-accent"
                  : "w-2 bg-primary-foreground/50",
              )}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
