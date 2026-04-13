import { useState, useEffect, useCallback } from "react";
import { useQueryState, parseAsString, parseAsInteger } from "nuqs";
import { useDebounce } from "~/hooks/use-debounce";

/**
 * Simplified hook for server-side filtering.
 * Manages URL state for: search, categoryId, sortBy, sortOrder, page.
 * All filtering/sorting/pagination is done server-side.
 */
export function usePropertyFilters() {
  // ── URL-synced query state ──
  const [searchQuery, setSearchQuery] = useQueryState(
    "search",
    parseAsString.withDefault(""),
  );
  const [categoryId, setCategoryId] = useQueryState(
    "category",
    parseAsString.withDefault(""),
  );
  const [sortBy, setSortBy] = useQueryState(
    "sort",
    parseAsString.withDefault("createdAt"),
  );
  const [sortOrder, setSortOrder] = useQueryState(
    "order",
    parseAsString.withDefault("desc"),
  );
  const [page, setPage] = useQueryState("page", parseAsInteger.withDefault(1));

  // Keep destination from the landing page search form
  const [destination, setDestination] = useQueryState(
    "destination",
    parseAsString.withDefault(""),
  );

  // ── Debounced search input ──
  const [localSearchName, setLocalSearchName] = useState(searchQuery || "");
  const debouncedSearchName = useDebounce(localSearchName, 400);

  // Sync debounced search → URL
  useEffect(() => {
    if (debouncedSearchName !== (searchQuery || "")) {
      setSearchQuery(debouncedSearchName || null);
      setPage(1);
    }
  }, [debouncedSearchName, searchQuery, setSearchQuery, setPage]);

  // ── Actions ──
  const toggleCategory = useCallback(
    (catName: string) => {
      const normalized = catName.toLowerCase();
      setCategoryId((prev) => {
        const current = prev ? prev.split(",").filter(Boolean) : [];
        const updated = current.includes(normalized)
          ? current.filter((c) => c !== normalized)
          : [...current, normalized];
        return updated.length > 0 ? updated.join(",") : null;
      });
      setPage(1);
    },
    [setCategoryId, setPage],
  );

  const selectedCategories = categoryId
    ? categoryId.split(",").filter(Boolean).map((c) => c.toLowerCase())
    : [];

  const handleSetSortBy = useCallback(
    (v: string) => {
      setSortBy(v || null);
      setPage(1);
    },
    [setSortBy, setPage],
  );

  const handleSetSortOrder = useCallback(
    (v: string) => {
      setSortOrder(v || null);
      setPage(1);
    },
    [setSortOrder, setPage],
  );

  const resetFilters = useCallback(() => {
    setLocalSearchName("");
    setSearchQuery(null);
    setCategoryId(null);
    setSortBy(null);
    setSortOrder(null);
    setDestination(null);
    setPage(1);
  }, [
    setSearchQuery,
    setCategoryId,
    setSortBy,
    setSortOrder,
    setDestination,
    setPage,
  ]);

  return {
    // Values for API query params
    searchQuery,
    categoryId,
    selectedCategories,
    sortBy,
    sortOrder,
    page,
    destination,

    // Local input state
    localSearchName,

    // Setters
    setLocalSearchName,
    toggleCategory,
    setSortBy: handleSetSortBy,
    setSortOrder: handleSetSortOrder,
    setPage: (v: number) => setPage(v),
    resetFilters,
  };
}
