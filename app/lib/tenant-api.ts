import { axiosInstance } from "~/lib/axios";

// ─── Types ──────────────────────────────────────────────────
export interface TenantProperty {
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
  tenantSubcategoryId?: string | null;
  tenantSubcategory?: { id: string; name: string } | null;
  images: { id: string; propertyId: string; imageUrl: string }[];
  _count: { rooms: number; reviews: number; reservations: number };
}

export interface TenantPropertyListResponse {
  data: TenantProperty[];
  meta: { page: number; take: number; total: number; totalPages: number };
}

export interface TenantPropertiesParams {
  search?: string;
  categoryId?: string;
  page?: number;
  take?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export interface Category {
  id: string;
  name: string;
  tenantId: string;
  categoryId: string;
  category?: { id: string; name: string };
  createdAt: string;
  _count: { properties: number };
}

export interface CategoryListResponse {
  data: Category[];
  meta: { page: number; take: number; total: number; totalPages: number };
}

export interface Room {
  id: string;
  propertyId: string;
  name: string;
  description: string;
  capacity: number;
  qty: number;
  basePrice: string;
  createdAt: string;
  images: { id: string; roomId: string; imageUrl: string }[];
  property?: any;
  availability?: any[];
  peakSeasonRates?: PeakSeasonRate[];
}

export interface RoomListResponse {
  data: Room[];
  meta: { page: number; take: number; total: number };
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
  value: string;
}

// ─── Property APIs ──────────────────────────────────────────

export async function fetchTenantProperties(
  params: TenantPropertiesParams,
): Promise<TenantPropertyListResponse> {
  const cleanParams: Record<string, string> = {};
  if (params.search) cleanParams.search = params.search;
  if (params.categoryId) cleanParams.categoryId = params.categoryId;
  if (params.page) cleanParams.page = String(params.page);
  if (params.take) cleanParams.take = String(params.take);
  if (params.sortBy) cleanParams.sortBy = params.sortBy;
  if (params.sortOrder) cleanParams.sortOrder = params.sortOrder;

  const { data } = await axiosInstance.get<TenantPropertyListResponse>(
    "/properties/tenant",
    { params: cleanParams },
  );
  return data;
}

export async function createProperty(payload: FormData): Promise<TenantProperty> {
  const { data } = await axiosInstance.post("/properties", payload, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data;
}

export async function updateProperty(id: string, payload: FormData): Promise<TenantProperty> {
  const { data } = await axiosInstance.patch(`/properties/${id}`, payload, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data;
}

export async function deleteProperty(id: string) {
  const { data } = await axiosInstance.delete(`/properties/${id}`);
  return data;
}

export async function fetchPropertyById(id: string): Promise<TenantProperty> {
  const { data } = await axiosInstance.get<TenantProperty>(`/properties/id/${id}`);
  return data;
}

// ─── Category APIs ──────────────────────────────────────────

export async function fetchTenantCategories(params?: {
  search?: string;
  tenantId?: string;
}): Promise<CategoryListResponse> {
  const { data } = await axiosInstance.get<CategoryListResponse>(
    "/categories",
    { params },
  );
  return data;
}

export async function createCategory(payload: { name: string; categoryId: string }) {
  const { data } = await axiosInstance.post("/categories", payload);
  return data;
}

export async function updateCategory(id: string, payload: { name?: string; categoryId?: string }) {
  const { data } = await axiosInstance.patch(`/categories/${id}`, payload);
  return data;
}

export async function deleteCategory(id: string) {
  const { data } = await axiosInstance.delete(`/categories/${id}`);
  return data;
}

// ─── Room APIs ──────────────────────────────────────────────

export async function fetchRooms(params: {
  propertyId: string;
  page?: number;
  take?: number;
}): Promise<RoomListResponse> {
  const cleanParams: Record<string, string> = {
    propertyId: params.propertyId,
  };
  if (params.page) cleanParams.page = String(params.page);
  if (params.take) cleanParams.take = String(params.take);
  const { data } = await axiosInstance.get<RoomListResponse>("/rooms", {
    params: cleanParams,
  });
  return data;
}

export async function fetchRoomById(id: string): Promise<Room> {
  const { data } = await axiosInstance.get<Room>(`/rooms/${id}`);
  return data;
}

export async function createRoom(payload: FormData) {
  const { data } = await axiosInstance.post("/rooms", payload, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data;
}

export async function updateRoom(id: string, payload: FormData) {
  const { data } = await axiosInstance.patch(`/rooms/${id}`, payload, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data;
}

export async function deleteRoom(id: string) {
  const { data } = await axiosInstance.delete(`/rooms/${id}`);
  return data;
}

// ─── Availability APIs ──────────────────────────────────────

export async function fetchAvailability(
  roomId: string,
  month: number,
  year: number,
): Promise<RoomAvailability[]> {
  const { data } = await axiosInstance.get<RoomAvailability[]>(
    `/availability/${roomId}`,
    { params: { month, year } },
  );
  return data;
}

export async function setAvailability(
  roomId: string,
  payload: { roomId: string; date: string; isAvailable: boolean },
) {
  const { data } = await axiosInstance.post(`/availability/${roomId}`, payload);
  return data;
}

export async function bulkSetAvailability(
  roomId: string,
  items: { date: string; isAvailable: boolean }[],
) {
  const { data } = await axiosInstance.post(`/availability/${roomId}/bulk`, {
    items,
  });
  return data;
}

// ─── Peak Season Rate APIs ─────────────────────────────────

export async function fetchPeakRates(
  roomId: string,
): Promise<PeakSeasonRate[]> {
  const { data } = await axiosInstance.get<PeakSeasonRate[]>(
    `/availability/${roomId}/peak-rates`,
  );
  return data;
}

export async function createPeakRate(
  roomId: string,
  payload: {
    roomId: string;
    startDate: string;
    endDate: string;
    priceType: string;
    value: number;
  },
) {
  const { data } = await axiosInstance.post(
    `/availability/${roomId}/peak-rates`,
    payload,
  );
  return data;
}

export async function updatePeakRate(
  id: string,
  payload: Partial<{
    startDate: string;
    endDate: string;
    priceType: string;
    value: number;
  }>,
) {
  const { data } = await axiosInstance.patch(
    `/availability/peak-rates/${id}`,
    payload,
  );
  return data;
}

export async function deletePeakRate(id: string) {
  const { data } = await axiosInstance.delete(`/availability/peak-rates/${id}`);
  return data;
}
