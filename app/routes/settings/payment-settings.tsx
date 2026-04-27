import { useState } from "react";
import {
  CreditCard,
  AlertCircle,
  Eye,
  ChevronLeft,
  Plus,
  X,
  Loader2,
  Trash2,
  ChevronRight,
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import { Button } from "~/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import { Skeleton } from "~/components/ui/skeleton";
import { cn } from "~/lib/utils";
import { settingsService } from "~/modules/settings/settings.service";
import {
  getReservationStatusLabel,
  type ReservationStatus,
} from "~/types/booking";

interface SavedPaymentMethod {
  id: string;
  cardName: string;
  lastFour: string;
  brand: string;
  expiry: string;
  isDefault: boolean;
  createdAt: string;
}

// DTO type from API
interface ReservationItem {
  id: string;
  propertyName: string;
  checkinDate: string;
  checkoutDate: string;
  totalPrice: number;
  status: ReservationStatus;
  createdAt: string;
  roomCount: number;
}

interface ReservationsResponse {
  data: ReservationItem[];
  meta: {
    page: number;
    take: number;
    total: number;
  };
}

// Status badge styling
function getStatusBadgeClass(status: string) {
  const norm = status.toUpperCase();
  switch (norm) {
    case "COMPLETED":
      return "bg-green-100 text-green-700 border-green-200";
    case "WAITING_PAYMENT":
      return "bg-yellow-100 text-yellow-700 border-yellow-200";
    case "WAITING_CONFIRMATION":
      return "bg-blue-100 text-blue-700 border-blue-200";
    case "CANCELLED":
      return "bg-red-100 text-red-700 border-red-200";
    case "CONFIRMED":
      return "bg-emerald-100 text-emerald-700 border-emerald-200";
    default:
      return "bg-gray-100 text-gray-700 border-gray-200";
  }
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

// Loading skeleton for table
function ReservationTableSkeleton() {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Property</TableHead>
            <TableHead>Check-in</TableHead>
            <TableHead>Check-out</TableHead>
            <TableHead>Total</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Date</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {Array.from({ length: 5 }).map((_, i) => (
            <TableRow key={i}>
              <TableCell>
                <Skeleton className="h-4 w-40" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-4 w-24" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-4 w-24" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-4 w-24" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-5 w-20 rounded-full" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-4 w-28" />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

const ITEMS_PER_PAGE = 10;

export default function PaymentSettingsPage() {
  const [page, setPage] = useState(1);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState({
    cardName: "",
    cardNumber: "",
    expiry: "",
    cvv: "",
  });

  const {
    data: resData,
    isLoading: isLoadingRes,
    isError: isErrorRes,
  } = useQuery<ReservationsResponse>({
    queryKey: ["my-reservations", page],
    queryFn: () => settingsService.getMyReservations(page, ITEMS_PER_PAGE),
  });

  const { data: paymentMethods = [], isLoading: isLoadingPM } = useQuery<
    SavedPaymentMethod[]
  >({
    queryKey: ["payment-methods"],
    queryFn: () => settingsService.getPaymentMethods(),
  });

  const addMutation = useMutation({
    mutationFn: settingsService.addPaymentMethod,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["payment-methods"] });
      setIsAddModalOpen(false);
      setFormData({ cardName: "", cardNumber: "", expiry: "", cvv: "" });
      toast.success("Payment method added successfully!");
    },
    onError: () => toast.error("Failed to add payment method"),
  });

  const deleteMutation = useMutation({
    mutationFn: settingsService.deletePaymentMethod,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["payment-methods"] });
      toast.success("Payment method removed");
    },
    onError: () => toast.error("Failed to remove payment method"),
  });

  const handleAddPayment = (e: React.FormEvent) => {
    e.preventDefault();
    addMutation.mutate(formData);
  };

  const reservations = resData?.data ?? [];
  const meta = resData?.meta;
  const totalPages = meta ? Math.ceil(meta.total / meta.take) : 1;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold tracking-tight">
          Payment & Reservations
        </h2>
        <p className="text-sm text-muted-foreground">
          View your reservation history and payment details.
        </p>
      </div>

      {/* Payment Info Placeholder */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5 text-primary" />
            Payment Information
          </CardTitle>
          <CardDescription>
            Your saved payment methods for faster checkout.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoadingPM ? (
            <div className="space-y-3">
              <Skeleton className="h-20 w-full rounded-xl" />
              <Skeleton className="h-20 w-full rounded-xl" />
            </div>
          ) : paymentMethods.length > 0 ? (
            <div className="grid gap-4 sm:grid-cols-2">
              {paymentMethods.map((pm) => (
                <div
                  key={pm.id}
                  className="group relative flex items-center justify-between p-4 rounded-xl border border-border bg-card transition-all hover:shadow-md"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                      <CreditCard className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-semibold text-sm">
                        {pm.brand} •••• {pm.lastFour}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Exp: {pm.expiry} • {pm.cardName}
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => deleteMutation.mutate(pm.id)}
                    disabled={deleteMutation.isPending}
                  >
                    {deleteMutation.isPending &&
                    deleteMutation.variables === pm.id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Trash2 className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              ))}
              <button
                onClick={() => setIsAddModalOpen(true)}
                className="flex flex-col items-center justify-center gap-2 p-4 rounded-xl border-2 border-dashed border-muted-foreground/20 bg-muted/30 transition-all hover:bg-muted/50 hover:border-primary/30"
              >
                <Plus className="h-5 w-5 text-muted-foreground" />
                <span className="text-xs font-medium text-muted-foreground">
                  Add New Card
                </span>
              </button>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-8 text-center rounded-lg border-2 border-dashed border-muted-foreground/20">
              <CreditCard className="h-12 w-12 text-muted-foreground/50 mb-4" />
              <p className="text-muted-foreground">No payment methods saved.</p>
              <p className="text-sm text-muted-foreground mb-4">
                Payment is done via bank transfer or payment gateway. No
                sensitive data is stored.
              </p>
              <Button
                variant="outline"
                onClick={() => setIsAddModalOpen(true)}
                className="gap-2"
              >
                <Plus className="h-4 w-4" />
                Add Payment Method
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add Payment Method Modal */}
      <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Add Payment Method</DialogTitle>
            <DialogDescription>
              Link a credit or debit card to your account for faster checkout.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleAddPayment} className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="cardName">Name on Card</Label>
              <Input
                id="cardName"
                placeholder="Full Name"
                required
                value={formData.cardName}
                onChange={(e) =>
                  setFormData({ ...formData, cardName: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cardNumber">Card Number</Label>
              <div className="relative">
                <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="cardNumber"
                  placeholder="0000 0000 0000 0000"
                  className="pl-10"
                  required
                  maxLength={16}
                  value={formData.cardNumber}
                  onChange={(e) =>
                    setFormData({ ...formData, cardNumber: e.target.value })
                  }
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="expiry">Expiry Date</Label>
                <Input
                  id="expiry"
                  placeholder="MM/YY"
                  required
                  maxLength={5}
                  value={formData.expiry}
                  onChange={(e) =>
                    setFormData({ ...formData, expiry: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cvv">CVV</Label>
                <Input
                  id="cvv"
                  placeholder="123"
                  type="password"
                  maxLength={3}
                  required
                  value={formData.cvv}
                  onChange={(e) =>
                    setFormData({ ...formData, cvv: e.target.value })
                  }
                />
              </div>
            </div>
            <DialogFooter className="pt-4">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setIsAddModalOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={addMutation.isPending}
                className="btn-gradient"
              >
                {addMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Save Card"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Reservation History */}
      <Card>
        <CardHeader>
          <CardTitle>Reservation History</CardTitle>
          <CardDescription>
            All your property bookings and their status.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoadingRes ? (
            <ReservationTableSkeleton />
          ) : isErrorRes ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <AlertCircle className="h-12 w-12 text-destructive/50 mb-4" />
              <p className="text-destructive font-medium">
                Failed to load reservations.
              </p>
              <p className="text-sm text-muted-foreground">
                Please try again later.
              </p>
            </div>
          ) : reservations.length > 0 ? (
            <>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Property</TableHead>
                      <TableHead>Check-in</TableHead>
                      <TableHead>Check-out</TableHead>
                      <TableHead>Total</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Booked On</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {reservations.map((res) => (
                      <TableRow key={res.id}>
                        <TableCell>
                          <div>
                            <p className="font-medium">
                              {(res as any).property?.name ||
                                res.propertyName ||
                                "Property"}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {res.roomCount ||
                                (res as any).reservationRooms?.length ||
                                1}{" "}
                              {(res.roomCount ||
                                (res as any).reservationRooms?.length) === 1
                                ? "room"
                                : "rooms"}{" "}
                              • #{res.id.slice(0, 8)}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell className="text-sm">
                          {formatDate(res.checkinDate)}
                        </TableCell>
                        <TableCell className="text-sm">
                          {formatDate(res.checkoutDate)}
                        </TableCell>
                        <TableCell className="font-medium">
                          {formatCurrency(res.totalPrice)}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={cn(
                              "border-0",
                              getStatusBadgeClass(res.status),
                            )}
                          >
                            {getReservationStatusLabel(res.status)}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-muted-foreground text-sm">
                          {formatDate(res.createdAt)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-4">
                  <p className="text-sm text-muted-foreground">
                    Page {meta?.page} of {totalPages} ({meta?.total}{" "}
                    reservations)
                  </p>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={page <= 1}
                    >
                      <ChevronLeft className="h-4 w-4 mr-1" />
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        setPage((p) => Math.min(totalPages, p + 1))
                      }
                      disabled={page >= totalPages}
                    >
                      Next
                      <ChevronRight className="h-4 w-4 ml-1" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <AlertCircle className="h-12 w-12 text-muted-foreground/50 mb-4" />
              <p className="text-muted-foreground">No reservations yet.</p>
              <p className="text-sm text-muted-foreground">
                Your property bookings will appear here.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
