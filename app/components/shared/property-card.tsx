import { Link } from "react-router";
import { Star, Heart, MapPin } from "lucide-react";
import { Badge } from "~/components/ui/badge";
import { cn, formatPrice } from "~/lib/utils";
import { useSavedProperties } from "~/hooks/use-saved-properties";

export interface PropertyCardProperty {
  id: string;
  name: string;
  slug: string;
  city: string;
  category: { id: string; name: string };
  images: { id: string; propertyId: string; imageUrl: string }[];
  lowestPrice: number;
  isAvailable: boolean;
  averageRating: number;
  reviewCount: number;
}

interface PropertyCardProps {
  property: PropertyCardProperty;
}

export function PropertyCard({ property }: PropertyCardProps) {
  const { isSaved, toggleSaved } = useSavedProperties();
  const liked = isSaved(property.id);

  return (
    <Link
      to={`/properties/${property.slug}`}
      className="group block overflow-hidden rounded-2xl border border-border bg-card card-hover"
    >
      <div className="relative aspect-4/3 overflow-hidden">
        <img
          src={property.images[0]?.imageUrl}
          alt={property.name}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
          loading="lazy"
        />
        <button
          onClick={(e) => {
            e.preventDefault();
            toggleSaved(property.id);
          }}
          className="absolute right-3 top-3 rounded-full bg-background/60 p-2 backdrop-blur-sm transition-colors hover:bg-background/80"
        >
          <Heart
            className={cn(
              "h-4 w-4 transition-colors",
              liked ? "fill-destructive text-destructive" : "text-foreground",
            )}
          />
        </button>
        {property.isAvailable ? (
          <Badge className="absolute left-3 top-3 bg-success text-success-foreground border-0">
            Available
          </Badge>
        ) : (
          <Badge variant="secondary" className="absolute left-3 top-3">
            Check Availability
          </Badge>
        )}
      </div>

      <div className="p-4">
        <div className="mb-1 flex items-center gap-1 text-sm text-muted-foreground">
          <MapPin className="h-3 w-3" />
          {property.city}
        </div>
        <h3 className="mb-2 line-clamp-1 text-base font-semibold text-card-foreground">
          {property.name}
        </h3>
        <div className="mb-3 flex items-center gap-1">
          <Star className="h-4 w-4 fill-warning text-warning" />
          <span className="text-sm font-medium text-foreground">
            {property.averageRating > 0 ? property.averageRating : "-"}
          </span>
          <span className="text-xs text-muted-foreground">
            ({property.reviewCount} reviews)
          </span>
        </div>
        <div className="flex items-end justify-between">
          <div>
            <span className="text-lg font-bold text-primary">
              {property.lowestPrice > 0
                ? formatPrice(property.lowestPrice)
                : "Contact"}
            </span>
            {property.lowestPrice > 0 && (
              <span className="text-xs text-muted-foreground">/malam</span>
            )}
          </div>
          <Badge variant="outline" className="text-xs capitalize">
            {property.category.name}
          </Badge>
        </div>
      </div>
    </Link>
  );
}
