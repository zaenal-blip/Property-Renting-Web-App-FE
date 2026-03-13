import { useParams, Link, useNavigate } from "react-router";
import {
  Star,
  MapPin,
  ArrowLeft,
  Wifi,
  Car,
  UtensilsCrossed,
  Waves,
  Dumbbell,
  Heart,
} from "lucide-react";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import { Separator } from "~/components/ui/separator";
import { mockProperties } from "~/data/mock-properties";
import { formatPrice } from "~/lib/utils";
import { ImageGallery } from "~/components/property/image-gallery";
import { RoomCard } from "~/components/property/room-card";
import { ReviewSection } from "~/components/property/review-section";
import { toast } from "sonner";
import type { Room } from "~/types/property";
import { useBookingStore } from "~/modules/booking/booking.store";

const amenityIcons: Record<string, React.ElementType> = {
  WiFi: Wifi,
  Parking: Car,
  Restaurant: UtensilsCrossed,
  Pool: Waves,
  "Infinity Pool": Waves,
  "Private Pool": Waves,
  Gym: Dumbbell,
  Spa: Heart,
};

const PropertyDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const setBooking = useBookingStore((s) => s.setBooking);
  const property = mockProperties.find((p) => p.id === id);

  if (!property) {
    return (
      <div className="container mx-auto flex min-h-[60vh] items-center justify-center py-24">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground">
            Property not found
          </h1>
          <Button variant="outline" className="mt-4" asChild>
            <Link to="/properties">Back to Properties</Link>
          </Button>
        </div>
      </div>
    );
  }

  const handleBook = (room: Room) => {
    setBooking({ selectedRoom: room });
    toast.success("Room selected", {
      description: `${room.name} — ${formatPrice(room.basePrice)}/malam`,
    });

    navigate(`/booking/${property.id}`);
  };

  return (
    <div className="container mx-auto px-4 py-24 md:py-28">
      <Button variant="ghost" size="sm" className="mb-4 gap-1" asChild>
        <Link to="/properties">
          <ArrowLeft className="h-4 w-4" />
          Back to Properties
        </Link>
      </Button>

      <ImageGallery
        images={property.images.map((img) => img.imageUrl)}
        name={property.name}
      />

      <div className="mt-6 grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          {/* Header */}
          <div>
            <div className="flex flex-wrap items-start gap-3">
              <Badge variant="outline" className="capitalize">
                {property.category.name}
              </Badge>

              <div className="flex items-center gap-1">
                <Star className="h-4 w-4 fill-warning text-warning" />
                <span className="text-sm font-medium">{property.rating}</span>
                <span className="text-xs text-muted-foreground">
                  ({property.reviewCount} reviews)
                </span>
              </div>
            </div>
            <h1 className="mt-3 text-2xl font-bold text-foreground md:text-3xl">
              {property.name}
            </h1>
            <div className="mt-2 flex items-center gap-1 text-sm text-muted-foreground">
              <MapPin className="h-4 w-4" />
              {property.address}, {property.city}
            </div>
          </div>

          <Separator />

          {/* Description */}
          <div>
            <h2 className="mb-2 text-lg font-semibold text-foreground">
              About this property
            </h2>
            <p className="text-sm leading-relaxed text-muted-foreground">
              {property.description}
            </p>
          </div>

          <Separator />

          {/* Amenities */}
          <div>
            <h2 className="mb-4 text-lg font-semibold text-foreground">
              Amenities
            </h2>
            <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
              {property.amenities.map((amenity) => {
                const Icon = amenityIcons[amenity] || Wifi;
                return (
                  <div
                    key={amenity}
                    className="flex items-center gap-2 rounded-lg border border-border bg-secondary/50 px-3 py-2"
                  >
                    <Icon className="h-4 w-4 text-primary" />
                    <span className="text-sm text-foreground">{amenity}</span>
                  </div>
                );
              })}
            </div>
          </div>

          <Separator />

          {/* Rooms */}
          <div>
            <h2 className="mb-4 text-lg font-semibold text-foreground">
              Available Rooms
            </h2>
            <div className="space-y-4">
              {property.rooms.map((room) => (
                <RoomCard key={room.id} room={room} onBook={handleBook} />
              ))}
            </div>
          </div>

          <Separator />

          {/* Reviews */}
          <ReviewSection
            propertyId={property.id}
            rating={property.rating}
            reviewCount={property.reviewCount}
          />
        </div>

        {/* Sticky Booking Card */}
        <div className="lg:col-span-1">
          <div className="sticky top-24 rounded-2xl border border-border bg-card p-6 shadow-lg">
            <div className="mb-4">
              <span className="text-sm text-muted-foreground">
                Starting from
              </span>
              <div className="flex items-end gap-1">
                <span className="text-2xl font-bold text-primary">
                  {formatPrice(property.lowestPrice)}
                </span>
                <span className="mb-1 text-sm text-muted-foreground">
                  /malam
                </span>
              </div>
            </div>
            <Button
              variant="cta"
              className="w-full"
              size="lg"
              onClick={() => {
                const availableRoom = property.rooms[0]; // Simplified for now since Room interface changed
                if (availableRoom) handleBook(availableRoom);
              }}
              disabled={!property.isAvailable}
            >
              {property.isAvailable ? "Book Now" : "Not Available"}
            </Button>
            <p className="mt-3 text-center text-xs text-muted-foreground">
              Free cancellation available
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PropertyDetail;
