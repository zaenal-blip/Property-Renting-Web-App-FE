import { Users } from "lucide-react";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import { formatPrice } from "~/lib/utils";
import type { Room } from "~/types/property";

interface RoomCardProps {
  room: Room;
  onBook: (room: Room) => void;
}

export function RoomCard({ room, onBook }: RoomCardProps) {
  return (
    <div className="flex flex-col overflow-hidden rounded-xl border border-border bg-card sm:flex-row">
      <div className="aspect-video w-full shrink-0 sm:aspect-square sm:w-48">
        <img
          src={room.images[0]?.imageUrl}
          alt={room.name}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
          loading="lazy"
        />
      </div>
      <div className="flex flex-1 flex-col justify-between p-4">
        <div>
          <h3 className="text-base font-semibold text-foreground">
            {room.name}
          </h3>
          <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
            {room.description}
          </p>
          <div className="mt-2 flex items-center gap-1 text-sm text-muted-foreground">
            <Users className="h-4 w-4" />
            <span>{room.capacity} guests</span>
          </div>
        </div>
        <div className="mt-3 flex items-end justify-between">
          <div>
            <span className="text-xl font-bold text-primary">
              {formatPrice(room.basePrice)}
            </span>
            <span className="text-xs text-muted-foreground">/malam</span>
          </div>
          {/* Simplified for mock: checking if any availability or defaulting to true if not specified */}
          {room.availability.length === 0 ||
          room.availability.some((a) => a.isAvailable) ? (
            <Button variant="cta" size="sm" onClick={() => onBook(room)}>
              Book Now
            </Button>
          ) : (
            <Badge variant="secondary">Unavailable</Badge>
          )}
        </div>
      </div>
    </div>
  );
}
