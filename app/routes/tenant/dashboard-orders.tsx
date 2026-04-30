import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router";
import { useDebounce } from "~/hooks/use-debounce";

import {
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  Clock,
  AlertCircle,
  Eye,
  MoreVertical,
  X,
  FileImage,
  ArrowRight,
} from "lucide-react";
import { axiosInstance } from "~/lib/axios";
import { formatPrice } from "~/lib/utils";
import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "~/components/ui/dialog";

// ─── CONSTANTS ────────────────────────────────────────────────────────

type ReservationStatus =
  | "WAITING_PAYMENT"
  | "WAITING_CONFIRMATION"
  | "CONFIRMED"
  | "CANCELLED"
  | "COMPLETED";

const statusConfig: Record<
  ReservationStatus,
  { label: string; color: string; icon: any }
> = {
  WAITING_PAYMENT: {
    label: "Waiting Payment",
    color: "bg-warning/10 text-warning border-warning/20 text-[11px]",
    icon: Clock,
  },
  WAITING_CONFIRMATION: {
    label: "Review Proof",
    color: "bg-info/10 text-info border-info/20 text-[11px]",
    icon: AlertCircle,
  },
  CONFIRMED: {
    label: "Confirmed",
    color: "bg-success/10 text-success border-success/20 text-[11px]",
    icon: CheckCircle2,
  },
  CANCELLED: {
    label: "Cancelled",
    color:
      "bg-destructive/10 text-destructive border-destructive/20 text-[11px]",
    icon: XCircle,
  },
  COMPLETED: {
    label: "Completed",
    color: "bg-muted/10 text-muted-foreground border-muted/20 text-[11px]",
    icon: CheckCircle2,
  },
};

// ─── PAGE ─────────────────────────────────────────────────────────────

export default function DashboardOrdersPage() {
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearchQuery = useDebounce(searchQuery, 500);

  // Modals state
  const [selectedProof, setSelectedProof] = useState<string | null>(null);
  const [confirmModal, setConfirmModal] = useState<{
    id: string;
    action: "APPROVE" | "REJECT" | "CANCEL";
  } | null>(null);

  // 1. Fetch Reservations
  const { data: response, isLoading } = useQuery({
    queryKey: ["tenant-reservations", statusFilter, debouncedSearchQuery],
    queryFn: async () => {
      const params: any = {};
      if (statusFilter !== "ALL") params.status = statusFilter;
      if (debouncedSearchQuery) params.orderId = debouncedSearchQuery;

      const res = await axiosInstance.get("/reservations", { params });
      return res.data;
    },
  });

  const reservations = Array.isArray(response)
    ? response
    : response?.data || [];

  // 2. Mutations
  const confirmMutation = useMutation({
    mutationFn: async ({ id, confirm }: { id: string; confirm: boolean }) => {
      return axiosInstance.patch(`/reservations/${id}/confirm`, { confirm });
    },
    onSuccess: () => {
      toast.success("Reservation updated successfully");
      queryClient.invalidateQueries({ queryKey: ["tenant-reservations"] });
      setConfirmModal(null);
    },
    onError: (err: any) => {
      toast.error(
        err.response?.data?.message || "Failed to update reservation",
      );
    },
  });

  const cancelMutation = useMutation({
    mutationFn: async (id: string) => {
      return axiosInstance.post(`/reservations/${id}/tenant-cancel`);
    },
    onSuccess: () => {
      toast.success("Reservation cancelled");
      queryClient.invalidateQueries({ queryKey: ["tenant-reservations"] });
      setConfirmModal(null);
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || "Failed to cancel");
    },
  });

  const handleAction = () => {
    if (!confirmModal) return;
    if (confirmModal.action === "APPROVE") {
      confirmMutation.mutate({ id: confirmModal.id, confirm: true });
    } else if (confirmModal.action === "REJECT") {
      confirmMutation.mutate({ id: confirmModal.id, confirm: false });
    } else if (confirmModal.action === "CANCEL") {
      cancelMutation.mutate(confirmModal.id);
    }
  };

  // ─── RENDER ─────────────────────────────────────────────────────────

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Orders</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Review and manage guest reservations for your properties.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search order ID..."
              className="w-full pl-9 pr-4 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="gap-2 shrink-0">
                <Filter className="h-4 w-4" />
                Filter
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuLabel>Status</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setStatusFilter("ALL")}>
                All Orders
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => setStatusFilter("WAITING_CONFIRMATION")}
              >
                Review Required
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => setStatusFilter("WAITING_PAYMENT")}
              >
                Pending Payment
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setStatusFilter("CONFIRMED")}>
                Confirmed
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setStatusFilter("CANCELLED")}>
                Cancelled
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Content */}
      <div className="grid gap-6">
        {isLoading ? (
          <div className="grid gap-4">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="h-24 animate-pulse" />
            ))}
          </div>
        ) : reservations.length === 0 ? (
          <Card className="flex flex-col items-center justify-center py-20 text-center border-dashed">
            <div className="h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
              <Clock className="h-8 w-8 text-primary/60" />
            </div>
            <h3 className="text-lg font-semibold">No orders found</h3>
            <p className="text-sm text-muted-foreground mt-1 max-w-xs">
              {searchQuery || statusFilter !== "ALL"
                ? "Try adjusting your filters or search query."
                : "When guests make reservations, they will appear here."}
            </p>
            {(searchQuery || statusFilter !== "ALL") && (
              <Button
                variant="outline"
                size="sm"
                className="mt-4"
                onClick={() => {
                  setStatusFilter("ALL");
                  setSearchQuery("");
                }}
              >
                Clear filters
              </Button>
            )}
          </Card>
        ) : (
          <div className="grid gap-4">
            {reservations.map((res: any) => {
              const config =
                statusConfig[res.status as ReservationStatus] ||
                statusConfig.WAITING_PAYMENT;
              const StatusIcon = config.icon;

              return (
                <Card
                  key={res.id}
                  className="overflow-hidden hover:shadow-sm transition-all border-border/50"
                >
                  <div className="flex flex-col md:flex-row">
                    {/* Side Highlight */}
                    <div className="bg-muted/20 p-4 md:w-52 flex flex-col justify-center border-b md:border-b-0 md:border-r border-border">
                      <Badge
                        className={`w-fit mb-2 ${config.color} border gap-1.5`}
                      >
                        <StatusIcon className="h-3.5 w-3.5" />
                        {config.label}
                      </Badge>
                      <p className="text-[10px] text-muted-foreground font-mono uppercase tracking-tighter">
                        ORDER: {res.id.slice(0, 8)}
                      </p>
                      <p className="text-base font-bold mt-1 text-primary">
                        {formatPrice(res.totalPrice)}
                      </p>
                    </div>

                    {/* Info Section */}
                    <div className="flex-1 p-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 items-center">
                      <div>
                        <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest mb-1">
                          Property
                        </p>
                        <p className="font-bold text-sm leading-tight">
                          {res.property?.name}
                        </p>
                        <p className="text-[11px] text-muted-foreground mt-0.5">
                          {res.reservationRooms?.[0]?.room?.name || "Room"}
                        </p>
                      </div>
                      <div>
                        <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest mb-1">
                          Customer
                        </p>
                        <p className="font-bold text-sm leading-tight">
                          {res.user?.name}
                        </p>
                        <p className="text-[11px] text-muted-foreground mt-0.5">
                          {res.user?.email}
                        </p>
                      </div>
                      <div>
                        <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest mb-1">
                          Schedule
                        </p>
                        <div className="flex items-center gap-2">
                          <p className="font-bold text-xs">
                            {new Date(res.checkinDate).toLocaleDateString()}
                          </p>
                          <ArrowRight className="h-3 w-3 text-muted-foreground" />
                          <p className="font-bold text-xs">
                            {new Date(res.checkoutDate).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Action Bar */}
                    <div className="p-4 flex items-center justify-end gap-2 border-t md:border-t-0 md:border-l border-border bg-muted/5">
                      {res.status === "WAITING_CONFIRMATION" &&
                        res.payment?.paymentProof && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() =>
                              setSelectedProof(res.payment.paymentProof)
                            }
                            className="h-9"
                          >
                            <FileImage className="h-4 w-4 mr-2" />
                            Proof
                          </Button>
                        )}

                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-9 w-9"
                          >
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>
                            Manage Reservation
                          </DropdownMenuLabel>
                          <DropdownMenuSeparator />

                          {res.status === "WAITING_CONFIRMATION" && (
                            <>
                              <DropdownMenuItem
                                className="text-success focus:text-success"
                                onClick={() =>
                                  setConfirmModal({
                                    id: res.id,
                                    action: "APPROVE",
                                  })
                                }
                              >
                                <CheckCircle2 className="h-4 w-4 mr-2" />{" "}
                                Approve
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                className="text-destructive focus:text-destructive"
                                onClick={() =>
                                  setConfirmModal({
                                    id: res.id,
                                    action: "REJECT",
                                  })
                                }
                              >
                                <XCircle className="h-4 w-4 mr-2" /> Reject
                              </DropdownMenuItem>
                            </>
                          )}

                          {res.status === "WAITING_PAYMENT" && (
                            <DropdownMenuItem
                              className="text-destructive focus:text-destructive"
                              onClick={() =>
                                setConfirmModal({
                                  id: res.id,
                                  action: "CANCEL",
                                })
                              }
                            >
                              <XCircle className="h-4 w-4 mr-2" /> Cancel
                              Booking
                            </DropdownMenuItem>
                          )}

                          <DropdownMenuItem asChild>
                            <Link
                              to={`/tenant/dashboard/orders/${res.id}`}
                              className="flex items-center w-full"
                            >
                              <Eye className="h-4 w-4 mr-2" /> Full Details
                            </Link>
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Proof Viewer */}
      <Dialog
        open={!!selectedProof}
        onOpenChange={(open) => !open && setSelectedProof(null)}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Payment Verification</DialogTitle>
            <DialogDescription>
              Review the guest's payment proof image below.
            </DialogDescription>
          </DialogHeader>
          <div className="bg-muted rounded-xl overflow-hidden aspect-3/4 flex items-center justify-center border">
            {selectedProof && (
              <img
                src={selectedProof}
                alt="Proof"
                className="max-h-full w-full object-contain"
              />
            )}
          </div>
          <DialogFooter>
            <Button className="w-full" onClick={() => setSelectedProof(null)}>
              Close Image
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Confirmation Dialogs */}
      <Dialog
        open={!!confirmModal}
        onOpenChange={(open) => !open && setConfirmModal(null)}
      >
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Confirm Action</DialogTitle>
            <DialogDescription className="text-sm">
              {confirmModal?.action === "APPROVE" &&
                "Approve this payment? The room will be locked for these dates and the guest will receive an email."}
              {confirmModal?.action === "REJECT" &&
                "Rejecting will reset the status to Waiting Payment. The guest must upload a new proof."}
              {confirmModal?.action === "CANCEL" &&
                "Are you sure? This will cancel the reservation permanently."}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="ghost"
              onClick={() => setConfirmModal(null)}
              disabled={confirmMutation.isPending || cancelMutation.isPending}
            >
              Back
            </Button>
            <Button
              variant={
                confirmModal?.action === "APPROVE" ? "cta" : "destructive"
              }
              onClick={handleAction}
              isLoading={confirmMutation.isPending || cancelMutation.isPending}
            >
              Proceed
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
