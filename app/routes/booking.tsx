import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import {
  Calendar as CalendarIcon,
  Users,
  ArrowLeft,
  CreditCard,
  ShieldCheck,
  Info,
  Loader2,
  TrendingUp,
} from "lucide-react";
import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from "~/components/ui/card";
import { Separator } from "~/components/ui/separator";
import { Badge } from "~/components/ui/badge";
import { DatePicker } from "~/components/ui/date-picker";
import { toast } from "sonner";
import { formatPrice } from "~/lib/utils";
import { useBookingStore } from "~/modules/booking/booking.store";
import { axiosInstance } from "~/lib/axios";
import { usePropertyDetailQuery } from "~/hooks/use-properties";

// Fetch the accurate total price from backend (includes peak rate calculation)
async function fetchTotalPrice(
  roomId: string,
  startDate: string,
  endDate: string,
) {
  const { data } = await axiosInstance.get(
    `/availability/${roomId}/total-price`,
    {
      params: { startDate, endDate },
    },
  );
  return data as {
    roomId: string;
    startDate: string;
    endDate: string;
    nights: number;
    totalPrice: number;
    basePrice: number | string;
  };
}

export default function BookingPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { selectedRoom, checkinDate, checkoutDate, setBooking, clearBooking } =
    useBookingStore();
  const { data: property, isLoading: propertyLoading } =
    usePropertyDetailQuery(id || "");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [localCheckin, setLocalCheckin] = useState(checkinDate || "");
  const [localCheckout, setLocalCheckout] = useState(checkoutDate || "");
  const [paymentMethod, setPaymentMethod] = useState<
    "MANUAL_TRANSFER" | "PAYMENT_GATEWAY"
  >("MANUAL_TRANSFER");

  // Fetch accurate price from backend (accounts for peak rates)
  const hasDates =
    !!localCheckin &&
    !!localCheckout &&
    new Date(localCheckin) < new Date(localCheckout);
  const { data: priceData, isLoading: priceLoading } = useQuery({
    queryKey: ["total-price", selectedRoom?.id, localCheckin, localCheckout],
    queryFn: () =>
      fetchTotalPrice(selectedRoom!.id, localCheckin, localCheckout),
    enabled: !!selectedRoom && hasDates,
    retry: false,
  });

  // Redirect if no room selected (but not if we just finished booking)
  useEffect(() => {
    if (!selectedRoom && !propertyLoading && !isSubmitting) {
      toast.error("Please select a room first");
      navigate(`/properties/${id || ""}`);
    }
  }, [selectedRoom, propertyLoading, navigate, id, isSubmitting]);

  const handleBooking = async () => {
    if (!localCheckin || !localCheckout) {
      toast.error("Please select check-in and check-out dates");
      return;
    }

    if (new Date(localCheckin) >= new Date(localCheckout)) {
      toast.error("Check-out date must be after check-in date");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await axiosInstance.post("/reservations", {
        propertyId: id,
        roomId: selectedRoom?.id,
        checkinDate: localCheckin,
        checkoutDate: localCheckout,
        paymentMethod,
      });

      const { invoiceUrl, id: resId } = response.data;

      toast.success("Booking Created!", {
        description:
          paymentMethod === "PAYMENT_GATEWAY"
            ? "Redirecting to payment gateway..."
            : "Please upload your payment proof.",
      });

      if (paymentMethod === "PAYMENT_GATEWAY" && invoiceUrl) {
        window.location.href = invoiceUrl;
        setTimeout(() => clearBooking(), 500);
      } else {
        navigate(`/user/order-detail/${resId}`);
        setTimeout(() => clearBooking(), 500);
      }
    } catch (error: any) {
      console.error("Booking error:", error);
      toast.error("Booking Failed", {
        description:
          error.response?.data?.message ||
          "Something went wrong during reservation.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (propertyLoading || !property || !selectedRoom) {
    return (
      <div className="container mx-auto flex min-h-[60vh] items-center justify-center py-24">
        <p className="text-muted-foreground animate-pulse">
          Preparing your booking...
        </p>
      </div>
    );
  }

  // Use backend price data if available, otherwise fallback to simple calculation
  const nights =
    priceData?.nights ??
    (localCheckin && localCheckout
      ? Math.max(
          1,
          Math.ceil(
            (new Date(localCheckout).getTime() -
              new Date(localCheckin).getTime()) /
              (1000 * 60 * 60 * 24),
          ),
        )
      : 1);

  const totalPrice =
    priceData?.totalPrice ?? selectedRoom.basePrice * nights;
  const baseTotal = Number(selectedRoom.basePrice) * nights;
  const hasPeakAdjustment =
    priceData && Number(priceData.totalPrice) !== baseTotal;

  return (
    <div className="container mx-auto px-4 py-24 md:py-28">
      <div className="mx-auto max-w-5xl">
        <Button variant="ghost" size="sm" className="mb-6 gap-1" asChild>
          <Link to={`/properties/${property.slug}`}>
            <ArrowLeft className="h-4 w-4" />
            Back to Property
          </Link>
        </Button>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* Left Column: Form */}
          <div className="lg:col-span-2 space-y-6">
            <h1 className="text-2xl font-bold text-foreground md:text-3xl">
              Confirm Your Booking
            </h1>

            {/* Step 1: Dates */}
            <Card className="border-border shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <CalendarIcon className="h-5 w-5 text-primary" />
                  Your Trip
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">
                      Check-in Date
                    </label>
                    <DatePicker
                      date={
                        localCheckin
                          ? new Date(localCheckin + "T00:00:00")
                          : undefined
                      }
                      setDate={(d) => {
                        const val = d ? format(d, "yyyy-MM-dd") : "";
                        setLocalCheckin(val);
                        setBooking({ checkinDate: val });
                      }}
                      placeholder="Pick check-in date"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">
                      Check-out Date
                    </label>
                    <DatePicker
                      date={
                        localCheckout
                          ? new Date(localCheckout + "T00:00:00")
                          : undefined
                      }
                      setDate={(d) => {
                        const val = d ? format(d, "yyyy-MM-dd") : "";
                        setLocalCheckout(val);
                        setBooking({ checkoutDate: val });
                      }}
                      placeholder="Pick check-out date"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Step 2: Payment Method */}
            <Card className="border-border shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <CreditCard className="h-5 w-5 text-primary" />
                  Select Payment Method
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div
                  className={`flex items-center justify-between p-4 rounded-xl border-2 cursor-pointer transition-all ${paymentMethod === "MANUAL_TRANSFER" ? "border-primary bg-primary/5" : "border-border hover:border-border/80"}`}
                  onClick={() => setPaymentMethod("MANUAL_TRANSFER")}
                >
                  <div className="flex items-center gap-4">
                    <div
                      className={`p-2 rounded-full ${paymentMethod === "MANUAL_TRANSFER" ? "bg-primary text-white" : "bg-secondary text-muted-foreground"}`}
                    >
                      <Info className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-bold">Manual Transfer</p>
                      <p className="text-xs text-muted-foreground">
                        Transfer to our bank account and upload proof.
                      </p>
                    </div>
                  </div>
                  <div
                    className={`h-5 w-5 rounded-full border-2 flex items-center justify-center ${paymentMethod === "MANUAL_TRANSFER" ? "border-primary" : "border-muted"}`}
                  >
                    {paymentMethod === "MANUAL_TRANSFER" && (
                      <div className="h-2.5 w-2.5 rounded-full bg-primary" />
                    )}
                  </div>
                </div>

                <div
                  className={`flex items-center justify-between p-4 rounded-xl border-2 cursor-pointer transition-all ${paymentMethod === "PAYMENT_GATEWAY" ? "border-primary bg-primary/5" : "border-border hover:border-border/80"}`}
                  onClick={() => setPaymentMethod("PAYMENT_GATEWAY")}
                >
                  <div className="flex items-center gap-4">
                    <div
                      className={`p-2 rounded-full ${paymentMethod === "PAYMENT_GATEWAY" ? "bg-primary text-white" : "bg-secondary text-muted-foreground"}`}
                    >
                      <CreditCard className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-bold">Instant Payment (Xendit)</p>
                      <p className="text-xs text-muted-foreground">
                        Pay via E-Wallet, VA, or Credit Card. Automatic
                        confirm.
                      </p>
                    </div>
                  </div>
                  <div
                    className={`h-5 w-5 rounded-full border-2 flex items-center justify-center ${paymentMethod === "PAYMENT_GATEWAY" ? "border-primary" : "border-muted"}`}
                  >
                    {paymentMethod === "PAYMENT_GATEWAY" && (
                      <div className="h-2.5 w-2.5 rounded-full bg-primary" />
                    )}
                  </div>
                </div>
              </CardContent>
              <CardFooter className="bg-muted/30 py-3 flex items-center justify-center gap-2">
                <ShieldCheck className="h-4 w-4 text-success" />
                <span className="text-xs text-muted-foreground italic">
                  Your booking is protected and secure
                </span>
              </CardFooter>
            </Card>

            <Button
              variant="cta"
              size="lg"
              className="w-full"
              disabled={isSubmitting || priceLoading}
              onClick={handleBooking}
            >
              {isSubmitting
                ? "Processing..."
                : priceLoading
                  ? "Calculating price..."
                  : `Confirm & Pay ${formatPrice(totalPrice)}`}
            </Button>
          </div>

          {/* Right Column: Summary */}
          <div className="lg:col-span-1">
            <Card className="sticky top-28 border-border shadow-lg overflow-hidden">
              <div className="aspect-video w-full overflow-hidden">
                <img
                  src={
                    selectedRoom.images[0]?.imageUrl ||
                    property.images[0]?.imageUrl
                  }
                  alt={selectedRoom.name}
                  className="h-full w-full object-cover"
                />
              </div>
              <CardHeader className="pb-2">
                <Badge variant="outline" className="w-fit mb-2">
                  {property.category.name}
                </Badge>
                <CardTitle className="text-xl leading-tight">
                  {property.name}
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  {selectedRoom.name}
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                <Separator />

                <div className="space-y-2">
                  <h4 className="text-sm font-semibold">Price Details</h4>
                  <div className="flex justify-between text-sm">
                    <span>
                      {formatPrice(Number(selectedRoom.basePrice))} x{" "}
                      {nights} night
                      {nights > 1 ? "s" : ""}
                    </span>
                    <span>{formatPrice(baseTotal)}</span>
                  </div>
                  {hasPeakAdjustment && (
                    <div className="flex justify-between text-sm text-amber-600">
                      <span className="flex items-center gap-1">
                        <TrendingUp className="h-3.5 w-3.5" />
                        Peak Season Adjustment
                      </span>
                      <span>
                        +
                        {formatPrice(
                          Number(priceData.totalPrice) - baseTotal,
                        )}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm">
                    <span>Service Fee</span>
                    <span className="text-success">Free</span>
                  </div>
                </div>

                <Separator />

                <div className="flex justify-between font-bold text-lg">
                  <span>Total (IDR)</span>
                  <span className="text-primary">
                    {priceLoading ? (
                      <Loader2 className="h-5 w-5 animate-spin inline" />
                    ) : (
                      formatPrice(totalPrice)
                    )}
                  </span>
                </div>

                <div className="rounded-md border border-primary/20 bg-primary/5 p-3 flex gap-2 items-center">
                  <Users className="h-4 w-4 text-primary" />
                  <span className="text-xs text-muted-foreground">
                    Occupancy: Up to {selectedRoom.capacity} guests
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
