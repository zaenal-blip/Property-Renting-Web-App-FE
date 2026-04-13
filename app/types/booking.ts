export type ReservationStatus =
  | "WAITING_PAYMENT"
  | "WAITING_CONFIRMATION"
  | "CONFIRMED"
  | "CANCELLED"
  | "COMPLETED";

export interface Reservation {
  id: string;
  userId: string;
  propertyId: string;
  checkinDate: string;
  checkoutDate: string;
  totalPrice: number;
  status: ReservationStatus;
  createdAt: string;
  // Included relations/aggregates for UI
  property?: any; // Simplified for now, but will have images
  reservationRooms?: any[];
  user?: any;
  payment?: Payment;
}

export interface Payment {
  id: string;
  reservationId: string;
  paymentMethod: "MANUAL_TRANSFER" | "PAYMENT_GATEWAY";
  paymentProof?: string;
  paymentStatus: "PENDING" | "CONFIRMED" | "REJECTED";
  paidAt?: string;
  createdAt: string;
  updatedAt: string;
}

// Helpers for ReservationStatus (moved from index.ts)
export function getReservationStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    WAITING_PAYMENT: "Waiting for Payment",
    WAITING_CONFIRMATION: "Waiting for Confirmation",
    CONFIRMED: "Confirmed",
    CANCELLED: "Cancelled",
    COMPLETED: "Completed",
  };
  return labels[status] || status;
}

export function getReservationStatusColor(status: string): string {
  const colors: Record<string, string> = {
    WAITING_PAYMENT: "warning",
    WAITING_CONFIRMATION: "info",
    CONFIRMED: "success",
    CANCELLED: "destructive",
    COMPLETED: "muted",
  };
  return colors[status] || "info";
}
