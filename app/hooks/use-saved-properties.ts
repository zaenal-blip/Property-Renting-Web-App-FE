import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getSavedPropertyIds, toggleSaveProperty } from "~/lib/user.api";
import { useAuthStore } from "~/modules/auth/auth.store";
import { toast } from "sonner";

export function useSavedProperties() {
  const queryClient = useQueryClient();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  const { data: savedIds = [], isLoading } = useQuery({
    queryKey: ["savedPropertyIds"],
    queryFn: getSavedPropertyIds,
    enabled: isAuthenticated,
  });

  const mutation = useMutation({
    mutationFn: toggleSaveProperty,
    onMutate: async (propertyId) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ["savedPropertyIds"] });

      // Snapshot the previous value
      const previousIds = queryClient.getQueryData<string[]>(["savedPropertyIds"]);

      // Optimistically update
      queryClient.setQueryData<string[]>(["savedPropertyIds"], (old) => {
        if (!old) return [propertyId];
        return old.includes(propertyId)
          ? old.filter((id) => id !== propertyId)
          : [...old, propertyId];
      });

      return { previousIds };
    },
    onError: (err, propertyId, context) => {
      // Rollback on error
      if (context?.previousIds) {
        queryClient.setQueryData(["savedPropertyIds"], context.previousIds);
      }
      toast.error("Failed to update saved properties");
    },
    onSettled: () => {
      // Refresh to ensure server sync
      queryClient.invalidateQueries({ queryKey: ["savedPropertyIds"] });
      // In case we are on the saved properties page, we might want to refresh the full list:
      queryClient.invalidateQueries({ queryKey: ["savedProperties"] });
    },
    onSuccess: (data) => {
      if (data.isSaved) {
        toast.success(data.message);
      } else {
        toast.info(data.message);
      }
    }
  });

  const toggleSaved = (propertyId: string) => {
    if (!isAuthenticated) {
      toast.error("Please login to save properties");
      return;
    }
    mutation.mutate(propertyId);
  };

  const isSaved = (propertyId: string) => savedIds.includes(propertyId);

  return {
    savedIds,
    isLoading,
    toggleSaved,
    isSaved,
  };
}
