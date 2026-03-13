import { create } from "zustand";
import type { Room } from "~/types/property";

interface BookingState {
  selectedRoom: Room | null;
  checkinDate: string;
  checkoutDate: string;
  guests: number;
  total: number;
  setBooking: (params: Partial<BookingState>) => void;
  clearBooking: () => void;
}

const initialState = {
  selectedRoom: null,
  checkinDate: "",
  checkoutDate: "",
  guests: 1,
  total: 0,
};

export const useBookingStore = create<BookingState>((set) => ({
  ...initialState,
  setBooking: (params) => set((state) => ({ ...state, ...params })),
  clearBooking: () => set(initialState),
}));
