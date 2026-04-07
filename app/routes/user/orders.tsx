import { useNavigate } from "react-router";
import { useQuery } from "@tanstack/react-query";
import { 
  ShoppingBag, 
  Calendar, 
  MapPin, 
  ChevronRight, 
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle
} from "lucide-react";
import { Button } from "~/components/ui/button";
import { Card, CardContent } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { Skeleton } from "~/components/ui/skeleton";
import { axiosInstance } from "~/lib/axios";
import { formatPrice } from "~/lib/utils";
import type { Reservation, ReservationStatus } from "~/types/booking";

const statusIcons: Record<ReservationStatus, React.ElementType> = {
  WAITING_PAYMENT: Clock,
  WAITING_CONFIRMATION: AlertCircle,
  CONFIRMED: CheckCircle2,
  COMPLETED: CheckCircle2,
  CANCELLED: XCircle,
};

const statusColors: Record<ReservationStatus, string> = {
  WAITING_PAYMENT: "bg-warning/10 text-warning border-warning/20",
  WAITING_CONFIRMATION: "bg-info/10 text-info border-info/20",
  CONFIRMED: "bg-success/10 text-success border-success/20",
  COMPLETED: "bg-muted/10 text-muted-foreground border-muted/20",
  CANCELLED: "bg-destructive/10 text-destructive border-destructive/20",
};

export default function UserOrdersPage() {
  const navigate = useNavigate();

  const { data: reservations, isLoading, isError } = useQuery({
    queryKey: ["user-reservations"],
    queryFn: async () => {
      const response = await axiosInstance.get("/reservations/user");
      return response.data as (Reservation & { property: any, room: any })[];
    },
  });

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-24 md:py-28">
        <h1 className="mb-8 text-2xl font-bold">My Bookings</h1>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-32 w-full rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-24 md:py-28">
      <div className="mx-auto max-w-4xl">
        <div className="mb-8 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-foreground md:text-3xl">My Bookings</h1>
          <Badge variant="outline" className="px-3 py-1">
            {reservations?.length || 0} Reservations
          </Badge>
        </div>

        {isError || !reservations || reservations.length === 0 ? (
          <Card className="flex flex-col items-center justify-center p-12 text-center border-dashed">
            <div className="rounded-full bg-secondary p-4 mb-4">
              <ShoppingBag className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold">No bookings found</h3>
            <p className="mt-1 text-sm text-muted-foreground">You haven't made any reservations yet.</p>
            <Button className="mt-6" onClick={() => navigate("/properties")}>
              Find Properties
            </Button>
          </Card>
        ) : (
          <div className="space-y-4">
            {reservations.map((reservation) => {
              const StatusIcon = statusIcons[reservation.status] || AlertCircle;
              
              return (
                <Card 
                  key={reservation.id} 
                  className="group overflow-hidden border-border transition-all hover:border-primary/50 hover:shadow-md cursor-pointer"
                  onClick={() => navigate(`/user/order-detail/${reservation.id}`)}
                >
                  <CardContent className="p-0">
                    <div className="flex flex-col sm:flex-row">
                      {/* Property Image */}
                      <div className="h-32 w-full shrink-0 overflow-hidden sm:w-48">
                        <img 
                          src={reservation.property?.images?.[0]?.imageUrl || "https://images.unsplash.com/photo-1566073771259-6a8506099945"} 
                          alt={reservation.property?.name}
                          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                      </div>

                      {/* Content */}
                      <div className="flex flex-1 flex-col justify-between p-4">
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <h3 className="font-bold text-foreground group-hover:text-primary transition-colors">
                              {reservation.property?.name || "Property Name"}
                            </h3>
                            <div className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                              <MapPin className="h-3 w-3" />
                              {reservation.property?.city}
                            </div>
                          </div>
                          <Badge className={`flex items-center gap-1 border ${statusColors[reservation.status]}`}>
                            <StatusIcon className="h-3 w-3" />
                            <span className="capitalize">{reservation.status.replace("_", " ").toLowerCase()}</span>
                          </Badge>
                        </div>

                        <div className="mt-4 flex flex-wrap items-center justify-between gap-4">
                          <div className="flex items-center gap-4">
                            <div className="flex flex-col">
                              <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Check-in</span>
                              <div className="flex items-center gap-1.5 text-sm font-medium">
                                <Calendar className="h-3.5 w-3.5 text-primary" />
                                {new Date(reservation.checkinDate).toLocaleDateString()}
                              </div>
                            </div>
                            <div className="h-8 w-px bg-border mx-1" />
                            <div className="flex flex-col">
                              <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Check-out</span>
                              <div className="flex items-center gap-1.5 text-sm font-medium">
                                <Calendar className="h-3.5 w-3.5 text-primary" />
                                {new Date(reservation.checkoutDate).toLocaleDateString()}
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-4">
                            <div className="text-right">
                              <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Total Price</span>
                              <div className="text-sm font-bold text-primary">
                                {formatPrice(Number(reservation.totalPrice))}
                              </div>
                            </div>
                            <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
