import { axiosInstance } from "~/lib/axios";
import type { Property } from "~/types/property";

export const PropertyService = {
  getProperties: async (params: any) => {
    // Convert array fields to string if necessary, though axios handles some natively
    const { data } = await axiosInstance.get<{ data: Property[], meta: any }>("/properties", { params });
    return data;
  },
  getPropertyBySlug: async (slug: string) => {
    const { data } = await axiosInstance.get<Property>(`/properties/${slug}`);
    return data;
  }
};
