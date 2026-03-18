export interface PropertyCategory {
  id: string;
  name: string;
}

export interface Property {
  id: string;
  tenantId: string;
  categoryId: string;
  name: string;
  slug: string;
  description: string;
  address: string;
  city: string;
  latitude?: number | null;
  longitude?: number | null;
  createdAt: string;
  updatedAt: string;

  // Derived/Aggregated for UI
  category: PropertyCategory;
  rating: number;
  reviewCount: number;
  images: PropertyImage[];
  rooms: Room[];
  isAvailable: boolean;
  lowestPrice: number;
  amenities: string[];
}

export interface PropertyImage {
  id: string;
  propertyId: string;
  imageUrl: string;
}

export interface Room {
  id: string;
  propertyId: string;
  name: string;
  description: string;
  capacity: number;
  basePrice: number;
  createdAt: string;
  images: RoomImage[];
  availability: RoomAvailability[];
  peakSeasonRates: PeakSeasonRate[];
}

export interface RoomImage {
  id: string;
  roomId: string;
  imageUrl: string;
}

export interface RoomAvailability {
  id: string;
  roomId: string;
  date: string;
  isAvailable: boolean;
}

export interface PeakSeasonRate {
  id: string;
  roomId: string;
  startDate: string;
  endDate: string;
  priceType: "NOMINAL" | "PERCENTAGE";
  value: number;
}

export type PropertySortBy = "price" | "rating";

export interface PropertyFilters {
  destination?: string;
  checkIn?: string;
  checkOut?: string;
  guests?: number;
  category?: string[];
  sort?: PropertySortBy;
  order?: "asc" | "desc";
  page?: number;
  pageSize?: number;
}

/** Resolved filter values returned by `usePropertyFilters` */
export interface PropertyFilterState {
  // URL-synced values
  destination: string;
  searchQuery: string;
  selectedCategories: string[];
  sortBy: string;
  sortOrder: string;
  minPrice: number | null;
  maxPrice: number | null;
  minRating: number | null;
  page: number;

  // Local (debounced) input state
  localSearchName: string;
  localLocation: string;
  localMinPrice: number | "";
  localMaxPrice: number | "";

  // Setters
  setLocalSearchName: (v: string) => void;
  setLocalLocation: (v: string) => void;
  setLocalMinPrice: (v: number | "") => void;
  setLocalMaxPrice: (v: number | "") => void;
  setMinRating: (v: number | null) => void;
  setSortBy: (v: string) => void;
  setSortOrder: (v: string) => void;
  setPage: (v: number) => void;
  toggleCategory: (cat: string) => void;
  resetFilters: () => void;
}

// ── Constants ──

export const ITEMS_PER_PAGE = 6;

export const PROPERTY_CATEGORIES: { value: string; label: string }[] = [
  { value: "hotel", label: "Hotel" },
  { value: "villa", label: "Villa" },
  { value: "resort", label: "Resort" },
  { value: "apartment", label: "Apartment" },
  { value: "guesthouse", label: "Guesthouse" },
];

export const RATING_OPTIONS: { value: string; label: string }[] = [
  { value: "0", label: "Any Rating" },
  { value: "3", label: "3+ Stars" },
  { value: "4", label: "4+ Stars" },
  { value: "4.5", label: "4.5+ Stars" },
];
