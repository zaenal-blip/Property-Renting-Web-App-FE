import { useQuery } from "@tanstack/react-query";
import { PropertyService } from "~/modules/properties/property.service";

export const usePropertiesQuery = (params: any) => {
  return useQuery({
    queryKey: ["properties", params],
    queryFn: () => PropertyService.getProperties(params),
  });
};

export const usePropertyDetailQuery = (slug: string) => {
  return useQuery({
    queryKey: ["properties", slug],
    queryFn: () => PropertyService.getPropertyBySlug(slug),
    enabled: !!slug,
  });
};
