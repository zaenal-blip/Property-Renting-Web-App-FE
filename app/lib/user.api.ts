import { axiosInstance } from "~/lib/axios";
import { PropertyListItem } from "./property.api";

export async function getSavedProperties(): Promise<PropertyListItem[]> {
  const { data } = await axiosInstance.get<PropertyListItem[]>("/users/me/saved-properties");
  return data;
}

export async function getSavedPropertyIds(): Promise<string[]> {
  const { data } = await axiosInstance.get<string[]>("/users/me/saved-properties/ids");
  return data;
}

export async function toggleSaveProperty(propertyId: string): Promise<{ isSaved: boolean; message: string }> {
  const { data } = await axiosInstance.post<{ isSaved: boolean; message: string }>(`/properties/${propertyId}/save`);
  return data;
}
