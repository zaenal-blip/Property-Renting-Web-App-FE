export interface PropertyCategory {
  id: string;
  name: string;
}

export interface Property {
  id: string;
  tenantId: string;
  categoryId: string;
  name: string;
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

export interface PropertyFilters {
  destination?: string;
  checkIn?: string;
  checkOut?: string;
  guests?: number;
  category?: string[]; // IDs
  sort?: "price_asc" | "price_desc" | "rating";
  page?: number;
  pageSize?: number;
}
