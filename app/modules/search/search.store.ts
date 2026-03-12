import { create } from "zustand";

interface SearchState {
  destination: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  setSearch: (params: Partial<SearchState>) => void;
  reset: () => void;
}

const initialState = {
  destination: "",
  checkIn: "",
  checkOut: "",
  guests: 2,
};

export const useSearchStore = create<SearchState>((set) => ({
  ...initialState,
  setSearch: (params) => set((state) => ({ ...state, ...params })),
  reset: () => set(initialState),
}));
