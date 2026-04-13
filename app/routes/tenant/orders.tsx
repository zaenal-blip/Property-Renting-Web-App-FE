import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
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
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
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
    color: "bg-warning/10 text-warning border-warning/20",
    icon: Clock,
  },
  WAITING_CONFIRMATION: {
    label: "Review Proof",
    color: "bg-info/10 text-info border-info/20",
    icon: AlertCircle,
  },
  CONFIRMED: {
    label: "Confirmed",
    color: "bg-success/10 text-success border-success/20",
    icon: CheckCircle2,
  },
  CANCELLED: {
    label: "Cancelled",
    color: "bg-destructive/10 text-destructive border-destructive/20",
    icon: XCircle,
  },
  COMPLETED: {
    label: "Completed",
    color: "bg-muted/10 text-muted-foreground border-muted/20",
    icon: CheckCircle2,
  },
};

// ─── PAGE ─────────────────────────────────────────────────────────────

export default function TenantOrdersPage() {
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  
  // Modals state
  const [selectedProof, setSelectedProof] = useState<string | null>(null);
  const [confirmModal, setConfirmModal] = useState<{
    id: string;
    action: "APPROVE" | "REJECT" | "CANCEL";
  } | null>(null);

  // 1. Fetch Reservations
  const { data: response, isLoading } = useQuery({
    queryKey: ["tenant-reservations", statusFilter, searchQuery],
    queryFn: async () => {
      const params: any = {};
      if (statusFilter !== "ALL") params.status = statusFilter;
      if (searchQuery) params.orderId = searchQuery; // Simplify for now

      const res = await axiosInstance.get("/reservations", { params });
      return res.data;
    },
  });

  const reservations = Array.isArray(response) ? response : response?.data || [];

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
      toast.error(err.response?.data?.message || "Failed to update reservation");
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
    <div className="container mx-auto px-4 py-24 md:py-28 min-h-screen max-w-7xl">
      <div className="flex flex-col gap-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Manage Orders</h1>
            <p className="text-muted-foreground mt-1">Review and manage your property reservations.</p>
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
                <DropdownMenuItem onClick={() => setStatusFilter("ALL")}>All Orders</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setStatusFilter("WAITING_CONFIRMATION")}>Review Required</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setStatusFilter("WAITING_PAYMENT")}>Pending Payment</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setStatusFilter("CONFIRMED")}>Confirmed</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setStatusFilter("CANCELLED")}>Cancelled</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Content */}
        <div className="grid gap-6">
          {isLoading ? (
             <div className="space-y-4">
               {[1,2,3].map(i => <Card key={i} className="h-24 animate-pulse" />)}
             </div>
          ) : reservations.length === 0 ? (
            <Card className="p-12 text-center border-dashed">
                <div className="mx-auto w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-4">
                    <X className="h-6 w-6 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-semibold">No orders found</h3>
                <p className="text-sm text-muted-foreground mt-1">Try adjusting your filters or search query.</p>
                <Button variant="outline" className="mt-4" onClick={() => { setStatusFilter("ALL"); setSearchQuery(""); }}>
                    Clear all filters
                </Button>
            </Card>
          ) : (
            <div className="grid gap-4">
              {reservations.map((res: any) => {
                const config = statusConfig[res.status as ReservationStatus] || statusConfig.WAITING_PAYMENT;
                const StatusIcon = config.icon;
                
                return (
                  <Card key={res.id} className="overflow-hidden hover:shadow-md transition-shadow">
                    <div className="flex flex-col md:flex-row">
                      {/* Side Info */}
                      <div className="bg-muted/30 p-4 md:w-56 flex flex-col justify-center border-b md:border-b-0 md:border-r border-border">
                        <Badge className={`w-fit mb-2 ${config.color} border gap-1`}>
                          <StatusIcon className="h-3 w-3" />
                          {config.label}
                        </Badge>
                        <p className="text-xs text-muted-foreground font-mono">ID: {res.id.slice(0,8)}...</p>
                        <p className="text-sm font-bold mt-1 text-primary">{formatPrice(res.totalPrice)}</p>
                      </div>
                      
                      {/* Main Info */}
                      <div className="flex-1 p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 italic items-center">
                        <div className="not-italic">
                           <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">Property</p>
                           <p className="font-bold">{res.property?.name}</p>
                           <p className="text-xs text-muted-foreground">{res.reservationRooms?.[0]?.room?.name || "Room"}</p>
                        </div>
                        <div className="not-italic">
                           <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">Customer</p>
                           <p className="font-bold">{res.user?.name}</p>
                           <p className="text-xs text-muted-foreground">{res.user?.email}</p>
                        </div>
                        <div className="not-italic">
                           <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">Schedule</p>
                           <div className="flex items-center gap-2">
                             <p className="font-bold text-sm">{new Date(res.checkinDate).toLocaleDateString()}</p>
                             <ArrowRight className="h-3 w-3 text-muted-foreground" />
                             <p className="font-bold text-sm">{new Date(res.checkoutDate).toLocaleDateString()}</p>
                           </div>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="p-4 flex items-center justify-end gap-2 border-t md:border-t-0 md:border-l border-border bg-muted/5">
                        {res.status === "WAITING_CONFIRMATION" && res.payment?.paymentProof && (
                           <Button 
                             size="sm" 
                             variant="outline" 
                             className="gap-2"
                             onClick={() => setSelectedProof(res.payment.paymentProof)}
                           >
                             <FileImage className="h-4 w-4" />
                             View Proof
                           </Button>
                        )}
                        
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            
                            {res.status === "WAITING_CONFIRMATION" && (
                              <>
                                <DropdownMenuItem 
                                    className="text-success focus:text-success"
                                    onClick={() => setConfirmModal({ id: res.id, action: "APPROVE" })}
                                >
                                    <CheckCircle2 className="h-4 w-4 mr-2" /> Approve Payment
                                </DropdownMenuItem>
                                <DropdownMenuItem 
                                    className="text-destructive focus:text-destructive"
                                    onClick={() => setConfirmModal({ id: res.id, action: "REJECT" })}
                                >
                                    <XCircle className="h-4 w-4 mr-2" /> Reject Payment
                                </DropdownMenuItem>
                              </>
                            )}

                            {res.status === "WAITING_PAYMENT" && (
                              <DropdownMenuItem 
                                  className="text-destructive focus:text-destructive"
                                  onClick={() => setConfirmModal({ id: res.id, action: "CANCEL" })}
                              >
                                  <Ban className="h-4 w-4 mr-2" /> Cancel Reservation
                              </DropdownMenuItem>
                            )}
                            
                            <DropdownMenuItem onClick={() => toast.info("Detail view coming soon")}>
                              <Eye className="h-4 w-4 mr-2" /> Full Details
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
      </div>

      {/* Proof Modal */}
      <Dialog open={!!selectedProof} onOpenChange={(open) => !open && setSelectedProof(null)}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Payment Proof</DialogTitle>
          </DialogHeader>
          <div className="bg-muted rounded-xl overflow-hidden aspect-[3/4] flex items-center justify-center">
            {selectedProof && (
                <img src={selectedProof} alt="Proof" className="max-h-full object-contain" />
            )}
          </div>
          <DialogFooter>
            <Button onClick={() => setSelectedProof(null)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Confirm Action Modal */}
      <Dialog open={!!confirmModal} onOpenChange={(open) => !open && setConfirmModal(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Action</DialogTitle>
            <DialogDescription>
              {confirmModal?.action === "APPROVE" && "Are you sure you want to approve this payment? The reservation will be confirmed and dates will be locked."}
              {confirmModal?.action === "REJECT" && "Rejecting this proof will send the status back to 'Waiting for Payment'. The customer can upload a new proof."}
              {confirmModal?.action === "CANCEL" && "Are you sure you want to cancel this reservation? The user has not uploaded any proof yet."}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setConfirmModal(null)} disabled={confirmMutation.isPending || cancelMutation.isPending}>
              Cancel
            </Button>
            <Button 
                variant={confirmModal?.action === "APPROVE" ? "cta" : "destructive"} 
                onClick={handleAction}
                isLoading={confirmMutation.isPending || cancelMutation.isPending}
            >
              Confirm
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function Ban({ className }: { className?: string }) {
    return <XCircle className={className} />; // Fallback icon
}
