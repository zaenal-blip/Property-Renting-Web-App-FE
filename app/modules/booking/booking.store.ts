import { create } from "zustand";
import type { Room } from "~/types/property";

interface BookingState {
  selectedRoom: Room | null;
  checkIn: string;
  checkOut: string;
  guests: number;
  total: number;
  setBooking: (params: Partial<BookingState>) => void;
  clearBooking: () => void;
}

const initialState = {
  selectedRoom: null,
  checkIn: "",
  checkOut: "",
  guests: 1,
  total: 0,
};

export const useBookingStore = create<BookingState>((set) => ({
  ...initialState,
  setBooking: (params) => set((state) => ({ ...state, ...params })),
  clearBooking: () => set(initialState),
}));
