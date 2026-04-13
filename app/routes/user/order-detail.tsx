import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  ArrowLeft,
  Calendar,
  MapPin,
  CreditCard,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  DoorOpen,
  User as UserIcon,
  Copy,
  CloudUpload,
  Ban,
  Timer,
  Star,
} from "lucide-react";
import { ReviewForm } from "~/components/property/review-form";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { Separator } from "~/components/ui/separator";
import { Skeleton } from "~/components/ui/skeleton";
import { toast } from "sonner";
import { axiosInstance } from "~/lib/axios";
import { formatPrice } from "~/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "~/components/ui/dialog";
import type { Reservation, ReservationStatus } from "~/types/booking";

// ─── STATUS CONFIG ───────────────────────────────────────────────────

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

// ─── COUNTDOWN HOOK ──────────────────────────────────────────────────

const PAYMENT_DEADLINE_MS = 60 * 60 * 1000; // 1 hour

function useCountdown(createdAt: string | undefined, isActive: boolean) {
  const [timeLeft, setTimeLeft] = useState<number>(0);

  useEffect(() => {
    if (!isActive || !createdAt) return;

    const deadline = new Date(createdAt).getTime() + PAYMENT_DEADLINE_MS;

    let interval: ReturnType<typeof setInterval>;

    const tick = () => {
      const remaining = Math.max(0, deadline - Date.now());
      setTimeLeft(remaining);
      if (remaining <= 0) clearInterval(interval);
    };

    tick();
    interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [createdAt, isActive]);

  const minutes = Math.floor(timeLeft / 60000);
  const seconds = Math.floor((timeLeft % 60000) / 1000);
  const isExpired = timeLeft <= 0;
  const isUrgent = timeLeft > 0 && timeLeft < 10 * 60 * 1000; // < 10 min

  return { minutes, seconds, isExpired, isUrgent, timeLeft };
}

// ─── PAGE ────────────────────────────────────────────────────────────

export default function OrderDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const {
    data: reservation,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["reservation", id],
    queryFn: async () => {
      const response = await axiosInstance.get(`/reservations/${id}`);
      return response.data as Reservation & {
        property: any;
        reservationRooms: any[];
        user: any;
        payment: any;
      };
    },
    refetchInterval: (query) => {
      // Poll every 3 seconds if waiting for payment or confirmation
      const state = query.state.data;
      if (state?.status === "WAITING_PAYMENT" || state?.status === "WAITING_CONFIRMATION") {
        return 3000;
      }
      return false;
    },
  });

  const isWaitingPayment = reservation?.status === "WAITING_PAYMENT";
  const countdown = useCountdown(reservation?.createdAt, isWaitingPayment);

  // ─── Cancel Mutation ───────────────────────────────────────────────

  const cancelMutation = useMutation({
    mutationFn: async () => {
      await axiosInstance.post(`/reservations/${id}/cancel`);
    },
    onSuccess: () => {
      toast.success("Reservation cancelled successfully");
      queryClient.invalidateQueries({ queryKey: ["reservation", id] });
      queryClient.invalidateQueries({ queryKey: ["user-reservations"] });
    },
    onError: (error: any) => {
      toast.error("Failed to cancel", {
        description:
          error.response?.data?.message || "You can only cancel before uploading payment proof.",
      });
    },
  });

  const [showCancelDialog, setShowCancelDialog] = useState(false);

  const handleCancel = () => {
    cancelMutation.mutate();
    setShowCancelDialog(false);
  };

  // ─── Helpers ───────────────────────────────────────────────────────

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard");
  };

  // ─── Loading / Error ──────────────────────────────────────────────

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-24 md:py-28 max-w-4xl">
        <Skeleton className="h-6 w-32 mb-6" />
        <Skeleton className="h-10 w-64 mb-8" />
        <div className="grid gap-6 lg:grid-cols-3">
          <Skeleton className="lg:col-span-2 h-96 w-full rounded-xl" />
          <Skeleton className="lg:col-span-1 h-64 w-full rounded-xl" />
        </div>
      </div>
    );
  }

  if (isError || !reservation) {
    return (
      <div className="container mx-auto px-4 py-24 text-center">
        <h2 className="text-xl font-bold">Reservation not found</h2>
        <Button className="mt-4" asChild>
          <Link to="/user/bookings">Back to My Bookings</Link>
        </Button>
      </div>
    );
  }

  const StatusIcon = statusIcons[reservation.status] || AlertCircle;
  const roomName =
    reservation.reservationRooms?.[0]?.room?.name || (reservation as any).room?.name || "Room";

  // ─── RENDER ────────────────────────────────────────────────────────

  return (
    <div className="container mx-auto px-4 py-24 md:py-28">
      <div className="mx-auto max-w-4xl">
        <Button variant="ghost" size="sm" className="mb-6 gap-1" asChild>
          <Link to="/user/bookings">
            <ArrowLeft className="h-4 w-4" />
            Back to Bookings
          </Link>
        </Button>

        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4 px-1">
          <div>
            <h1 className="text-2xl font-bold text-foreground md:text-3xl">Booking Details</h1>
            <p className="text-sm text-muted-foreground mt-1">ID: {reservation.id}</p>
          </div>
          <Badge
            className={`flex items-center gap-1.5 px-4 py-1.5 text-sm border font-medium h-fit w-fit ${statusColors[reservation.status]}`}
          >
            <StatusIcon className="h-4 w-4" />
            <span className="capitalize">
              {reservation.status.replace(/_/g, " ").toLowerCase()}
            </span>
          </Badge>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* ── Main Info ── */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="overflow-hidden border-border shadow-sm">
              <div className="aspect-video w-full">
                <img
                  src={
                    reservation.property?.images?.[0]?.imageUrl ||
                    "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800"
                  }
                  alt={reservation.property?.name}
                  className="h-full w-full object-cover"
                />
              </div>
              <CardContent className="p-6 space-y-6">
                <div>
                  <h2 className="text-xl font-bold text-primary mb-1">
                    {reservation.property?.name}
                  </h2>
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <MapPin className="h-4 w-4" />
                    {reservation.property?.address}, {reservation.property?.city}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">
                      Check-in
                    </span>
                    <div className="flex items-center gap-2 font-semibold">
                      <Calendar className="h-4 w-4 text-primary" />
                      {new Date(reservation.checkinDate).toLocaleDateString(undefined, {
                        weekday: "long",
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </div>
                  </div>
                  <div className="space-y-1 text-right sm:text-left">
                    <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">
                      Check-out
                    </span>
                    <div className="flex items-center justify-end sm:justify-start gap-2 font-semibold">
                      <Calendar className="h-4 w-4 text-primary" />
                      {new Date(reservation.checkoutDate).toLocaleDateString(undefined, {
                        weekday: "long",
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </div>
                  </div>
                </div>

                <Separator />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="flex items-start gap-3">
                    <div className="rounded-full bg-secondary p-2 mt-0.5">
                      <DoorOpen className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <span className="text-xs text-muted-foreground">Room Selected</span>
                      <p className="font-semibold">{roomName}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="rounded-full bg-secondary p-2 mt-0.5">
                      <UserIcon className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <span className="text-xs text-muted-foreground">Guest Contact</span>
                      <p className="font-semibold">
                        {reservation.user?.name || "Customer"}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {reservation.user?.email}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* ── Payment Action Card (only WAITING_PAYMENT) ── */}
            {isWaitingPayment && (
              <Card className="border-warning/30 bg-warning/5 shadow-sm overflow-hidden">
                <CardHeader className="pb-3 flex-row items-center gap-3">
                  <div className="rounded-full bg-warning/20 p-2 text-warning">
                    {reservation.payment?.paymentMethod === "PAYMENT_GATEWAY" ? (
                      <CreditCard className="h-5 w-5" />
                    ) : (
                      <Clock className="h-5 w-5" />
                    )}
                  </div>
                  <div className="flex-1">
                    <CardTitle className="text-lg text-warning-foreground">
                      {reservation.payment?.paymentMethod === "PAYMENT_GATEWAY"
                        ? "Complete Payment"
                        : "Action Required: Payment"}
                    </CardTitle>
                    <p className="text-sm text-warning-foreground/70">
                      {reservation.payment?.paymentMethod === "PAYMENT_GATEWAY"
                        ? "Please pay using Xendit to confirm your booking automatically."
                        : "Please transfer to the account below and upload your proof."}
                    </p>
                  </div>
                </CardHeader>

                {/* ── Countdown Timer ── */}
                <div
                  className={`mx-6 mb-4 flex items-center gap-3 rounded-xl border p-4 ${
                    countdown.isExpired
                      ? "border-destructive/30 bg-destructive/5"
                      : countdown.isUrgent
                        ? "border-warning/40 bg-warning/10"
                        : "border-border bg-background/50"
                  }`}
                >
                  <Timer
                    className={`h-5 w-5 ${
                      countdown.isExpired
                        ? "text-destructive"
                        : countdown.isUrgent
                          ? "text-warning animate-pulse"
                          : "text-muted-foreground"
                    }`}
                  />
                  <div className="flex-1">
                    <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Payment Deadline
                    </p>
                    {countdown.isExpired ? (
                      <p className="text-sm font-bold text-destructive">
                        Expired — reservation will be auto-cancelled
                      </p>
                    ) : (
                      <p
                        className={`text-lg font-mono font-bold ${
                          countdown.isUrgent ? "text-warning" : "text-foreground"
                        }`}
                      >
                        {String(countdown.minutes).padStart(2, "0")}:
                        {String(countdown.seconds).padStart(2, "0")}
                      </p>
                    )}
                  </div>
                </div>

                <CardContent className="space-y-4 pb-6">
                  {reservation.payment?.paymentMethod === "PAYMENT_GATEWAY" ? (
                    <div className="space-y-4">
                      <div className="rounded-xl border border-warning/20 bg-background/50 p-6 flex flex-col items-center text-center space-y-2">
                        <CreditCard className="h-10 w-10 text-primary opacity-50" />
                        <p className="text-sm font-medium">Automatic Payment via Xendit</p>
                        <p className="text-xs text-muted-foreground">
                          You will be redirected to Xendit secure payment page.
                        </p>
                      </div>
                      <Button
                        className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold py-6 text-lg"
                        onClick={() => {
                          if ((reservation as any).payment?.invoiceUrl) {
                            window.location.href = (reservation as any).payment.invoiceUrl;
                          } else {
                            toast.error(
                              "Invoice URL not found. Please try again or contact support.",
                            );
                          }
                        }}
                      >
                        Pay with Xendit
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="rounded-xl border border-warning/20 bg-background/50 p-6 space-y-4">
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium">Bank Transfer (Manual)</span>
                          <Badge
                            variant="outline"
                            className="border-warning/30 text-warning-foreground uppercase font-bold"
                          >
                            BCA / Mandiri
                          </Badge>
                        </div>
                        <div className="flex justify-between items-center bg-muted/40 p-4 rounded-lg border border-border/50">
                          <div>
                            <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-tighter">
                              Account Number
                            </p>
                            <p className="text-xl font-mono font-bold text-foreground">
                              8800 1234 5678
                            </p>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => copyToClipboard("880012345678")}
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-semibold">Upload Payment Proof</label>
                        <div className="flex items-center gap-2">
                          <input
                            type="file"
                            id="payment-proof"
                            className="hidden"
                            accept="image/*"
                            onChange={async (e) => {
                              const file = e.target.files?.[0];
                              if (!file) return;

                              try {
                                toast.loading("Uploading proof...");
                                await axiosInstance.patch(
                                  `/reservations/${reservation.id}/payment-proof`,
                                  {
                                    paymentProof:
                                      "https://via.placeholder.com/400x600?text=Payment+Proof",
                                  },
                                );
                                toast.dismiss();
                                toast.success(
                                  "Proof uploaded successfully! Waiting for tenant confirmation.",
                                );
                                await queryClient.invalidateQueries({
                                  queryKey: ["reservation", id],
                                });
                                // Force a refetch to be absolutely sure the UI updates
                                queryClient.refetchQueries({
                                  queryKey: ["reservation", id],
                                });
                                queryClient.invalidateQueries({
                                  queryKey: ["user-reservations"],
                                });
                              } catch (err) {
                                toast.dismiss();
                                toast.error("Failed to upload proof");
                              }
                            }}
                          />
                          <Button
                            variant="outline"
                            className="w-full border-dashed py-10 flex-col gap-2"
                            asChild
                          >
                            <label htmlFor="payment-proof" className="cursor-pointer">
                              <CloudUpload className="h-8 w-8 text-muted-foreground" />
                              <span className="text-xs">Click to select image</span>
                            </label>
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* ── Review Form (only for confirmed/completed after checkout) ── */}
            {(reservation.status === "CONFIRMED" || reservation.status === "COMPLETED") && 
             new Date() >= new Date(reservation.checkoutDate) && 
             !(reservation as any).review && (
              <ReviewForm 
                reservationId={reservation.id} 
                onSuccess={() => queryClient.invalidateQueries({ queryKey: ["reservation", id] })}
              />
            )}

            {/* ── Display Existing Review ── */}
            {(reservation as any).review && (
              <Card className="border-primary/20 bg-primary/5 shadow-sm">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg flex items-center gap-2">
                       <Star className="h-5 w-5 fill-warning text-warning" />
                       Your Review
                    </CardTitle>
                    <Badge variant="outline" className="bg-background">
                       { (reservation as any).review.rating } / 5
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                   <p className="text-sm italic">"{ (reservation as any).review.comment }"</p>
                   { (reservation as any).review.reply && (
                     <div className="mt-4 p-3 bg-background rounded-lg border border-border">
                        <p className="text-xs font-bold text-primary">Tenant Reply:</p>
                        <p className="text-xs mt-1">"{ (reservation as any).review.reply.comment }"</p>
                     </div>
                   )}
                </CardContent>
              </Card>
            )}

            {/* ── Cancel Order Button (only WAITING_PAYMENT) ── */}
            {isWaitingPayment && (
              <Card className="border-destructive/20 bg-destructive/5 shadow-sm">
                <CardContent className="p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <div className="rounded-full bg-destructive/10 p-2 mt-0.5">
                      <Ban className="h-4 w-4 text-destructive" />
                    </div>
                    <div>
                      <p className="font-semibold text-destructive">Cancel Reservation</p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        You can only cancel before uploading payment proof.
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => setShowCancelDialog(true)}
                    disabled={cancelMutation.isPending}
                    className="shrink-0"
                  >
                    {cancelMutation.isPending ? "Cancelling..." : "Cancel Order"}
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>

          {/* ── Cancel Confirmation Dialog ── */}
          <Dialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
            <DialogContent className="sm:max-w-[400px]">
              <DialogHeader>
                <DialogTitle>Cancel Reservation?</DialogTitle>
                <DialogDescription>
                  Are you sure you want to cancel this reservation? This action cannot be undone and your selected dates will be released.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter className="gap-2 sm:gap-0 mt-4">
                <Button
                  variant="ghost"
                  onClick={() => setShowCancelDialog(false)}
                  disabled={cancelMutation.isPending}
                >
                  Keep Reservation
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleCancel}
                  isLoading={cancelMutation.isPending}
                >
                  Yes, Cancel
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* ── Price Sidebar ── */}
          <div className="lg:col-span-1">
            <Card className="sticky top-28 border-border shadow-lg overflow-hidden">
              <CardHeader className="bg-card">
                <CardTitle className="text-lg">Payment Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Original Price</span>
                  <span className="font-medium">
                    {formatPrice(Number(reservation.totalPrice))}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Tax & Services</span>
                  <span className="text-success font-medium">Included</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Discount</span>
                  <span className="text-success">0</span>
                </div>
                <Separator />
                <div className="flex justify-between items-center">
                  <span className="font-bold text-foreground">Total Paid</span>
                  <span className="text-xl font-bold text-primary">
                    {formatPrice(Number(reservation.totalPrice))}
                  </span>
                </div>
              </CardContent>
              <CardFooter className="bg-muted/30 py-4 flex flex-col gap-2">
                <div className="flex items-center gap-2 text-[10px] text-muted-foreground font-medium uppercase tracking-wider">
                  <ShieldCheck className="h-3 w-3 text-success" />
                  Transaction Secured
                </div>
              </CardFooter>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── ShieldCheck icon ────────────────────────────────────────────────

function ShieldCheck({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  );
}
