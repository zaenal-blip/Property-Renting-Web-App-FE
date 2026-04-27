import { useQuery } from "@tanstack/react-query";
import { Heart } from "lucide-react";
import { Button } from "~/components/ui/button";
import { Card } from "~/components/ui/card";
import { Skeleton } from "~/components/ui/skeleton";
import { PropertyCard, PropertyCardProperty } from "~/components/shared/property-card";
import { getSavedProperties } from "~/lib/user.api";
import { useNavigate } from "react-router";

export default function SavedPropertiesPage() {
  const navigate = useNavigate();

  const {
    data: savedProperties = [],
    isLoading,
    isError,
  } = useQuery<PropertyCardProperty[]>({
    queryKey: ["savedProperties"],
    queryFn: getSavedProperties,
  });

  return (
    <div className="container mx-auto px-4 py-24 md:py-28">
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground md:text-3xl">Saved Properties</h1>
            <p className="text-muted-foreground mt-1">
              Properties you've saved for later.
            </p>
          </div>
          <div className="flex items-center justify-center bg-destructive/10 rounded-full h-12 w-12 text-destructive">
            <Heart className="h-6 w-6 fill-current" />
          </div>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex flex-col gap-3">
                <Skeleton className="aspect-4/3 w-full rounded-2xl" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-8 w-full" />
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!isLoading && (isError || savedProperties.length === 0) && (
          <Card className="flex flex-col items-center justify-center p-12 text-center border-dashed mt-4">
            <div className="rounded-full bg-secondary p-4 mb-4">
              <Heart className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold">
              No saved properties yet
            </h3>
            <p className="mt-1 text-sm text-muted-foreground max-w-md">
              Start exploring and click the heart icon on properties you like to save them for later.
            </p>
            <Button className="mt-6" onClick={() => navigate("/properties")}>
              Explore Properties
            </Button>
          </Card>
        )}

        {/* Content */}
        {!isLoading && savedProperties.length > 0 && (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
            {savedProperties.map((property) => (
              <PropertyCard key={property.id} property={property} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
