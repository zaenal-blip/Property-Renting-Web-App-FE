import { create } from "zustand";

interface SearchState {
  destination: string;
  checkinDate: string;
  checkoutDate: string;
  guests: number;
  setSearch: (params: Partial<SearchState>) => void;
  reset: () => void;
}

const initialState = {
  destination: "",
  checkinDate: "",
  checkoutDate: "",
  guests: 2,
};

export const useSearchStore = create<SearchState>((set) => ({
  ...initialState,
  setSearch: (params) => set((state) => ({ ...state, ...params })),
  reset: () => set(initialState),
}));
