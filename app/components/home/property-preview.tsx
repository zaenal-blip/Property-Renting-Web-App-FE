import { Link } from "react-router";
import { ArrowRight, Loader2 } from "lucide-react";
import { Button } from "~/components/ui/button";
import { PropertyCard } from "~/components/shared/property-card";
import { motion } from "framer-motion";
import { useProperties } from "~/hooks/use-properties";

export function PropertyPreview() {
  const { data: response, isLoading } = useProperties({
    take: 6,
    sortBy: "createdAt",
    sortOrder: "desc",
  });

  const featured = response?.data || [];

  return (
    <section className="container mx-auto py-12 px-4 md:py-16">
      <div className="mb-8 flex items-end justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground md:text-3xl">
            Popular Properties Near You
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Handpicked stays across Indonesia's best destinations
          </p>
        </div>
        <Button
          variant="ghost"
          className="hidden gap-1 text-primary md:inline-flex"
          asChild
        >
          <Link to="/properties">
            View All
            <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {isLoading ? (
          // Simple loading skeletons
          Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="h-[300px] w-full animate-pulse rounded-2xl bg-muted"
            />
          ))
        ) : featured.length > 0 ? (
          featured.map((property: any, i: number) => (
            <motion.div
              key={property.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.4 }}
            >
              <PropertyCard property={property} />
            </motion.div>
          ))
        ) : (
          <div className="col-span-full py-12 text-center text-muted-foreground">
            No properties found
          </div>
        )}
      </div>

      <div className="mt-8 text-center md:hidden">
        <Button variant="outline" className="gap-1" asChild>
          <Link to="/properties">
            View All Properties
            <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
      </div>
    </section>
  );
}
