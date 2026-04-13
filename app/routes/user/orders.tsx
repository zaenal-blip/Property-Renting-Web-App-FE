import { useState } from "react";
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
  AlertCircle,
  Search,
  X,
} from "lucide-react";
import { Button } from "~/components/ui/button";
import { Card, CardContent } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { Skeleton } from "~/components/ui/skeleton";
import { axiosInstance } from "~/lib/axios";
import { formatPrice } from "~/lib/utils";
import type { Reservation, ReservationStatus } from "~/types/booking";

// ─── STATUS MAPS ─────────────────────────────────────────────────────

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

// ─── FILTER TABS ─────────────────────────────────────────────────────

type TabKey = "ALL" | "ONGOING" | "COMPLETED" | "CANCELLED";

const tabs: { key: TabKey; label: string }[] = [
  { key: "ALL", label: "All" },
  { key: "ONGOING", label: "Ongoing" },
  { key: "COMPLETED", label: "Completed" },
  { key: "CANCELLED", label: "Cancelled" },
];

const tabToStatuses: Record<TabKey, ReservationStatus[] | null> = {
  ALL: null,
  ONGOING: ["WAITING_PAYMENT", "WAITING_CONFIRMATION", "CONFIRMED"],
  COMPLETED: ["COMPLETED"],
  CANCELLED: ["CANCELLED"],
};

// ─── PAGE ────────────────────────────────────────────────────────────

export default function UserOrdersPage() {
  const navigate = useNavigate();

  // Filter state
  const [activeTab, setActiveTab] = useState<TabKey>("ALL");
  const [searchOrderId, setSearchOrderId] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  // Build query params
  const buildParams = () => {
    const params: Record<string, string> = { take: "50" };
    const statuses = tabToStatuses[activeTab];
    if (statuses && statuses.length === 1) {
      params.status = statuses[0];
    }
    if (searchOrderId.trim()) params.orderId = searchOrderId.trim();
    if (startDate) params.startDate = startDate;
    if (endDate) params.endDate = endDate;
    return params;
  };

  const {
    data: apiResponse,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["user-reservations", activeTab, searchOrderId, startDate, endDate],
    queryFn: async () => {
      const response = await axiosInstance.get("/reservations", {
        params: buildParams(),
      });
      return response.data;
    },
  });

  // Handle both { data: [...] } and plain array response shapes
  const rawReservations: (Reservation & { property: any; reservationRooms?: any[] })[] =
    Array.isArray(apiResponse) ? apiResponse : apiResponse?.data ?? [];

  // Client-side filter for multi-status tabs (ONGOING has 3 statuses)
  const reservations = rawReservations.filter((r) => {
    const statuses = tabToStatuses[activeTab];
    if (!statuses) return true;
    return statuses.includes(r.status);
  });

  const clearFilters = () => {
    setSearchOrderId("");
    setStartDate("");
    setEndDate("");
    setActiveTab("ALL");
  };

  const hasActiveFilters = searchOrderId || startDate || endDate || activeTab !== "ALL";

  // ─── RENDER ────────────────────────────────────────────────────────

  return (
    <div className="container mx-auto px-4 py-24 md:py-28">
      <div className="mx-auto max-w-4xl">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-foreground md:text-3xl">My Bookings</h1>
          <Badge variant="outline" className="px-3 py-1">
            {reservations.length} Reservations
          </Badge>
        </div>

        {/* ── Status Tabs ── */}
        <div className="mb-5 flex gap-2 overflow-x-auto pb-1">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`shrink-0 rounded-full px-4 py-2 text-sm font-medium transition-all ${
                activeTab === tab.key
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "bg-secondary text-muted-foreground hover:bg-secondary/80"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* ── Search & Date Filters ── */}
        <div className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
          {/* Order ID search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search by Order ID..."
              value={searchOrderId}
              onChange={(e) => setSearchOrderId(e.target.value)}
              className="w-full rounded-lg border border-input bg-background py-2.5 pl-10 pr-3 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
            />
          </div>

          {/* Start date */}
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground pointer-events-none" />
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full rounded-lg border border-input bg-background py-2.5 pl-10 pr-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
              title="Filter from date"
            />
          </div>

          {/* End date */}
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground pointer-events-none" />
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              min={startDate}
              className="w-full rounded-lg border border-input bg-background py-2.5 pl-10 pr-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
              title="Filter to date"
            />
          </div>
        </div>

        {/* Clear filters */}
        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="mb-4 flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="h-3 w-3" />
            Clear all filters
          </button>
        )}

        {/* ── Loading ── */}
        {isLoading && (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-32 w-full rounded-xl" />
            ))}
          </div>
        )}

        {/* ── Empty State ── */}
        {!isLoading && (isError || reservations.length === 0) && (
          <Card className="flex flex-col items-center justify-center p-12 text-center border-dashed">
            <div className="rounded-full bg-secondary p-4 mb-4">
              <ShoppingBag className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold">
              {hasActiveFilters ? "No matching bookings" : "No bookings found"}
            </h3>
            <p className="mt-1 text-sm text-muted-foreground">
              {hasActiveFilters
                ? "Try adjusting your filters or search criteria."
                : "You haven't made any reservations yet."}
            </p>
            {hasActiveFilters ? (
              <Button variant="outline" className="mt-6" onClick={clearFilters}>
                Clear Filters
              </Button>
            ) : (
              <Button className="mt-6" onClick={() => navigate("/properties")}>
                Find Properties
              </Button>
            )}
          </Card>
        )}

        {/* ── Reservation List ── */}
        {!isLoading && reservations.length > 0 && (
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
                          src={
                            reservation.property?.images?.[0]?.imageUrl ||
                            "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400"
                          }
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
                          <Badge
                            className={`flex items-center gap-1 border shrink-0 ${statusColors[reservation.status]}`}
                          >
                            <StatusIcon className="h-3 w-3" />
                            <span className="capitalize">
                              {reservation.status.replace(/_/g, " ").toLowerCase()}
                            </span>
                          </Badge>
                        </div>

                        <div className="mt-4 flex flex-wrap items-center justify-between gap-4">
                          <div className="flex items-center gap-4">
                            <div className="flex flex-col">
                              <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">
                                Check-in
                              </span>
                              <div className="flex items-center gap-1.5 text-sm font-medium">
                                <Calendar className="h-3.5 w-3.5 text-primary" />
                                {new Date(reservation.checkinDate).toLocaleDateString()}
                              </div>
                            </div>
                            <div className="h-8 w-px bg-border mx-1" />
                            <div className="flex flex-col">
                              <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">
                                Check-out
                              </span>
                              <div className="flex items-center gap-1.5 text-sm font-medium">
                                <Calendar className="h-3.5 w-3.5 text-primary" />
                                {new Date(reservation.checkoutDate).toLocaleDateString()}
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-4">
                            <div className="text-right">
                              <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">
                                Total Price
                              </span>
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
