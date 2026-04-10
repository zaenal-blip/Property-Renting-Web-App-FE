import { axiosInstance } from "~/lib/axios";

export interface PropertyQueryParams {
  search?: string;
  categoryId?: string;
  city?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  page?: number;
  take?: number;
  startDate?: string;
  endDate?: string;
  capacity?: number;
}

export interface PropertyListItem {
  id: string;
  tenantId: string;
  categoryId: string;
  name: string;
  slug: string;
  description: string;
  address: string;
  city: string;
  createdAt: string;
  updatedAt: string;
  category: { id: string; name: string };
  images: { id: string; propertyId: string; imageUrl: string }[];
  _count: { rooms: number; reviews: number };
  lowestPrice: number;
  isAvailable: boolean;
  averageRating: number;
  reviewCount: number;
}

export interface PropertyListResponse {
  data: PropertyListItem[];
  meta: {
    page: number;
    take: number;
    total: number;
    totalPages: number;
  };
}

export interface PropertyCategory {
  id: string;
  name: string;
  createdAt: string;
}

export async function fetchProperties(
  params: PropertyQueryParams,
): Promise<PropertyListResponse> {
  const cleanParams: Record<string, string> = {};

  if (params.search) cleanParams.search = params.search;
  if (params.categoryId) cleanParams.categoryId = params.categoryId;
  if (params.city) cleanParams.city = params.city;
  if (params.sortBy) cleanParams.sortBy = params.sortBy;
  if (params.sortOrder) cleanParams.sortOrder = params.sortOrder;
  if (params.page) cleanParams.page = String(params.page);
  if (params.take) cleanParams.take = String(params.take);
  if (params.startDate) cleanParams.startDate = params.startDate;
  if (params.endDate) cleanParams.endDate = params.endDate;
  if (params.capacity) cleanParams.capacity = String(params.capacity);

  const { data } = await axiosInstance.get<PropertyListResponse>(
    "/properties",
    { params: cleanParams },
  );
  return data;
}

export async function fetchCategories(): Promise<PropertyCategory[]> {
  const { data } = await axiosInstance.get<PropertyCategory[]>(
    "/properties/categories",
  );
  return data;
}

export interface PropertyLocation {
  label: string;
  value: string;
}

export async function fetchLocations(
  search?: string,
): Promise<PropertyLocation[]> {
  const { data } = await axiosInstance.get<PropertyLocation[]>(
    "/properties/locations",
    { params: search ? { search } : undefined },
  );
  return data;
}

export interface PropertyDetailRoom {
  id: string;
  propertyId: string;
  name: string;
  description: string;
  capacity: number;
  basePrice: number | string;
  createdAt: string;
  images: { id: string; roomId: string; imageUrl: string }[];
}

export interface PropertyDetail {
  id: string;
  tenantId: string;
  categoryId: string;
  name: string;
  slug: string;
  description: string;
  address: string;
  city: string;
  latitude: number | null;
  longitude: number | null;
  createdAt: string;
  updatedAt: string;
  category: { id: string; name: string; createdAt: string };
  images: { id: string; propertyId: string; imageUrl: string }[];
  rooms: PropertyDetailRoom[];
  tenant: { name: string; profilePicture: string | null };
}

export async function fetchPropertyBySlug(
  slug: string,
): Promise<PropertyDetail> {
  const { data } = await axiosInstance.get<PropertyDetail>(
    `/properties/${slug}`,
  );
  return data;
}
