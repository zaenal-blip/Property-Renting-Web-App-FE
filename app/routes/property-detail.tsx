import { useState } from "react";
import { useParams, Link, useNavigate } from "react-router";
import { format } from "date-fns";
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
  Loader2,
  Calendar as CalendarIcon,
} from "lucide-react";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import { Separator } from "~/components/ui/separator";
import { DatePicker } from "~/components/ui/date-picker";
import { formatPrice } from "~/lib/utils";
import { ImageGallery } from "~/components/property/image-gallery";
import { RoomCard } from "~/components/property/room-card";
import { ReviewSection } from "~/components/property/review-section";
import { toast } from "sonner";
import type { Room } from "~/types/property";
import { useBookingStore } from "~/modules/booking/booking.store";
import { usePropertyDetailQuery } from "~/hooks/use-properties";

const amenityIcons: Record<string, any> = {
  WiFi: Wifi,
  Parking: Car,
  Restaurant: UtensilsCrossed,
  Pool: Waves,
  Gym: Dumbbell,
  Spa: Heart,
};

const PropertyDetailPage = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const setBooking = useBookingStore((s) => s.setBooking);
  const [checkin, setCheckin] = useState<string>("");
  const [checkout, setCheckout] = useState<string>("");

  const {
    data: property,
    isLoading,
    isError,
  } = usePropertyDetailQuery(slug || "", {
    startDate: checkin || undefined,
    endDate: checkout || undefined,
  });

  if (isLoading) {
    return (
      <div className="container mx-auto flex min-h-[60vh] items-center justify-center py-24">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (isError || !property) {
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

  // Compute derived values from API data
  const rooms = property.rooms || [];
  const lowestPrice =
    rooms.length > 0
      ? Math.min(...rooms.map((r) => Number(r.basePrice)))
      : 0;

  // Compute available stock based on inventory
  const displayRooms = rooms.map((room) => {
    let minStock = room.qty || 1; // fallback to 1 if qty is missing
    if (checkin && checkout) {
      const start = new Date(checkin + "T00:00:00");
      const end = new Date(checkout + "T00:00:00");
      let maxBooked = 0;
      for (let d = new Date(start); d < end; d.setDate(d.getDate() + 1)) {
        const dStr = d.toISOString().split("T")[0];
        const inv = room.inventories?.find(
          (i: any) => {
             // Handle both ISO strings and Date objects
             const iDateStr = typeof i.date === 'string' 
                ? i.date.split("T")[0] 
                : new Date(i.date).toISOString().split("T")[0];
             return iDateStr === dStr;
          }
        );
        const booked = inv?.bookedStock || 0;
        if (booked > maxBooked) maxBooked = booked;
      }
      minStock = (room.qty || 1) - maxBooked;
    }
    return { ...room, count: minStock };
  });

  const handleBook = (room: Room) => {
    if (!checkin || !checkout) {
      toast.error("Please select dates first");
      // Scroll to date selection
      document.getElementById("date-selection")?.scrollIntoView({ behavior: "smooth" });
      return;
    }
    setBooking({ 
      selectedRoom: room,
      checkinDate: checkin,
      checkoutDate: checkout,
    });
    toast.success("Room selected", {
      description: `${room.name} — ${formatPrice(Number(room.basePrice))}/malam`,
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
        images={property.images?.map((img: any) => img.imageUrl) || []}
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

          {/* Tenant / Host Info */}
          {property.tenant && (
            <div className="flex items-center gap-3">
              {property.tenant.profilePicture ? (
                <img
                  src={property.tenant.profilePicture}
                  alt={property.tenant.name}
                  className="h-10 w-10 rounded-full object-cover"
                />
              ) : (
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary font-semibold">
                  {property.tenant.name.charAt(0)}
                </div>
              )}
              <div>
                <p className="text-sm text-muted-foreground">Hosted by</p>
                <p className="text-sm font-medium text-foreground">
                  {property.tenant.name}
                </p>
              </div>
            </div>
          )}

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

          {/* Date Selection */}
          <div id="date-selection" className="rounded-xl border border-primary/20 bg-primary/5 p-6">
             <h2 className="mb-4 text-lg font-semibold text-foreground flex items-center gap-2">
               Select Dates to See Availability
             </h2>
             <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
               <div className="space-y-2">
                 <label className="text-sm font-medium flex items-center gap-1.5">
                   <CalendarIcon className="h-4 w-4 text-primary" />
                   Check-in
                 </label>
                 <DatePicker
                   date={checkin ? new Date(checkin + "T00:00:00") : undefined}
                   setDate={(d) => setCheckin(d ? format(d, "yyyy-MM-dd") : "")}
                   placeholder="Pick check-in date"
                 />
               </div>
               <div className="space-y-2">
                 <label className="text-sm font-medium flex items-center gap-1.5">
                   <CalendarIcon className="h-4 w-4 text-primary" />
                   Check-out
                 </label>
                 <DatePicker
                   date={checkout ? new Date(checkout + "T00:00:00") : undefined}
                   setDate={(d) => setCheckout(d ? format(d, "yyyy-MM-dd") : "")}
                   placeholder="Pick check-out date"
                 />
               </div>
             </div>
          </div>

          <Separator />

          {/* Rooms */}
          <div>
            <h2 className="mb-4 text-lg font-semibold text-foreground">
              {checkin && checkout 
                ? `Available Rooms for your dates` 
                : "All Room Types (Select dates to confirm availability)"}
            </h2>
            <div className="space-y-4">
              {displayRooms.length > 0 ? (
                displayRooms.map((room: any) => (
                  <div key={room.id} className="relative">
                    <RoomCard
                      room={{
                        ...room,
                        basePrice: Number(room.basePrice),
                        availability: room.availability || [],
                        peakSeasonRates: room.peakSeasonRates || [],
                      }}
                      onBook={handleBook}
                    />
                    {room.count > 1 && (
                      <Badge className="absolute top-2 right-2 bg-primary text-primary-foreground">
                        {room.count} rooms left
                      </Badge>
                    )}
                  </div>
                ))
              ) : (
                <div className="rounded-xl border border-dashed p-8 text-center text-muted-foreground">
                  No rooms available for the selected dates.
                </div>
              )}
            </div>
          </div>

          <Separator />

          {/* Reviews */}
          <ReviewSection propertyId={property.id} rating={0} reviewCount={0} />
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
                  {formatPrice(lowestPrice)}
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
                const availableRoom = property.rooms[0];
                if (availableRoom)
                  handleBook({
                    ...availableRoom,
                    basePrice: Number(availableRoom.basePrice),
                    availability: availableRoom.availability || [],
                    peakSeasonRates: availableRoom.peakSeasonRates || [],
                  });
              }}
              disabled={property.rooms.length === 0}
            >
              {property.rooms.length > 0 ? "Book Now" : "Not Available"}
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

export default PropertyDetailPage;
