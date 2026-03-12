export type OrderStatus =
  | "Menunggu Pembayaran"
  | "Menunggu Konfirmasi"
  | "Diproses"
  | "Dibatalkan"
  | "Selesai";

export interface Booking {
  id: string;
  propertyId: string;
  roomId: string;
  userId: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  totalPrice: number;
  status: OrderStatus;
  paymentProof?: string;
  createdAt: string;
}
