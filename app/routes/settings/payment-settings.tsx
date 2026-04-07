import { useState } from "react";
import {
  CreditCard,
  AlertCircle,
  Eye,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";

import { Button } from "~/components/ui/button";
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

  const { data, isLoading, isError } = useQuery<ReservationsResponse>({
    queryKey: ["my-reservations", page],
    queryFn: () => settingsService.getMyReservations(page, ITEMS_PER_PAGE),
  });

  const reservations = data?.data ?? [];
  const meta = data?.meta;
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
            Your payment methods and preferences.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-8 text-center rounded-lg border-2 border-dashed border-muted-foreground/20">
            <CreditCard className="h-12 w-12 text-muted-foreground/50 mb-4" />
            <p className="text-muted-foreground">No payment methods saved.</p>
            <p className="text-sm text-muted-foreground mb-4">
              Payment is done via bank transfer or payment gateway. No sensitive
              data is stored.
            </p>
            <Button variant="outline" disabled>
              Add Payment Method (Coming Soon)
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Reservation History */}
      <Card>
        <CardHeader>
          <CardTitle>Reservation History</CardTitle>
          <CardDescription>
            All your property bookings and their status.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <ReservationTableSkeleton />
          ) : isError ? (
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
                            <p className="font-medium">{res.propertyName}</p>
                            <p className="text-xs text-muted-foreground">
                              {res.roomCount}{" "}
                              {res.roomCount === 1 ? "room" : "rooms"} • #
                              {res.id}
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
