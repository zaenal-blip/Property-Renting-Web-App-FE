import { useQuery } from "@tanstack/react-query";
import {
  fetchProperties,
  fetchCategories,
  fetchLocations,
  fetchPropertyBySlug,
  type PropertyQueryParams,
} from "~/lib/property.api";

/**
 * React Query hook to fetch paginated & filtered properties from the backend.
 */
export function useProperties(params: PropertyQueryParams) {
  return useQuery({
    queryKey: ["properties", params],
    queryFn: () => fetchProperties(params),
  });
}

/** Alias kept for backward compatibility with feature2 code */
export const usePropertiesQuery = useProperties;

/**
 * React Query hook to fetch a single property by slug with optional date filtering.
 */
export function usePropertyDetailQuery(
  slug: string,
  dates?: { startDate?: string; endDate?: string },
) {
  return useQuery({
    queryKey: ["properties", slug, dates],
    queryFn: () => fetchPropertyBySlug(slug, dates),
    enabled: !!slug,
  });
}

/**
 * React Query hook to fetch all property categories.
 */
export function useCategories() {
  return useQuery({
    queryKey: ["property-categories"],
    queryFn: fetchCategories,
    staleTime: 10 * 60 * 1000, // categories rarely change
  });
}

/**
 * React Query hook to fetch locations (unique property cities) with optional server-side search filtering.
 */
export function useLocations(search?: string) {
  return useQuery({
    queryKey: ["property-locations", search],
    queryFn: () => fetchLocations(search),
    staleTime: 5 * 60 * 1000,
  });
}
