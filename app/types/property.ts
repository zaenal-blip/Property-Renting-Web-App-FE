export interface Property {
  id: string;
  name: string;
  city: string;
  address: string;
  description: string;
  category: PropertyCategory;
  rating: number;
  reviewCount: number;
  images: string[];
  lowestPrice: number;
  isAvailable: boolean;
  amenities: string[];
  rooms: Room[];
}

export type PropertyCategory =
  | "hotel"
  | "villa"
  | "resort"
  | "apartment"
  | "guesthouse";

export interface Room {
  id: string;
  propertyId: string;
  name: string;
  description: string;
  price: number;
  capacity: number;
  images: string[];
  isAvailable: boolean;
}

export interface PropertyFilters {
  destination?: string;
  checkIn?: string;
  checkOut?: string;
  guests?: number;
  category?: PropertyCategory[];
  sort?: "price_asc" | "price_desc" | "rating";
  page?: number;
  pageSize?: number;
}
