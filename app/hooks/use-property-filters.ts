import { useState, useEffect, useCallback } from "react";
import { useQueryState, parseAsString, parseAsInteger } from "nuqs";
import { useDebounce } from "~/hooks/use-debounce";

/**
 * Hook for server-side filtering with advanced filter support.
 * Manages URL state for: search, categoryId, destination, sortBy, sortOrder,
 * startDate, endDate, capacity, and page.
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
  const [startDateQ, setStartDateQ] = useQueryState("startDate", parseAsString);
  const [endDateQ, setEndDateQ] = useQueryState("endDate", parseAsString);
  const [capacityQ, setCapacityQ] = useQueryState("capacity", parseAsInteger);

  // Keep destination from the landing page search form
  const [destination, setDestination] = useQueryState(
    "destination",
    parseAsString.withDefault(""),
  );

  // ── Debounced local input state ──
  const [localSearchName, setLocalSearchName] = useState(searchQuery || "");
  const debouncedSearchName = useDebounce(localSearchName, 400);

  const [localStartDate, setLocalStartDate] = useState<string | "">(
    startDateQ ?? "",
  );
  const debouncedStartDate = useDebounce(localStartDate, 500);

  const [localEndDate, setLocalEndDate] = useState<string | "">(
    endDateQ ?? "",
  );
  const debouncedEndDate = useDebounce(localEndDate, 500);

  const [localCapacity, setLocalCapacity] = useState<number | "">(
    capacityQ ?? "",
  );
  const debouncedCapacity = useDebounce(localCapacity, 500);

  // ── Sync debounced values → URL params ──
  useEffect(() => {
    let changed = false;

    if (debouncedSearchName !== (searchQuery || "")) {
      setSearchQuery(debouncedSearchName || null);
      changed = true;
    }

    const currentStart = startDateQ ?? "";
    if (debouncedStartDate !== currentStart) {
      setStartDateQ(debouncedStartDate === "" ? null : debouncedStartDate);
      changed = true;
    }

    const currentEnd = endDateQ ?? "";
    if (debouncedEndDate !== currentEnd) {
      setEndDateQ(debouncedEndDate === "" ? null : debouncedEndDate);
      changed = true;
    }

    const currentCap = capacityQ ?? "";
    if (debouncedCapacity !== currentCap) {
      setCapacityQ(debouncedCapacity === "" ? null : debouncedCapacity);
      changed = true;
    }

    if (changed) {
      setPage(1);
    }
  }, [
    debouncedSearchName,
    searchQuery,
    setSearchQuery,
    debouncedStartDate,
    startDateQ,
    setStartDateQ,
    debouncedEndDate,
    endDateQ,
    setEndDateQ,
    debouncedCapacity,
    capacityQ,
    setCapacityQ,
    setPage,
  ]);

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
    setLocalStartDate("");
    setLocalEndDate("");
    setLocalCapacity("");
    setSearchQuery(null);
    setCategoryId(null);
    setStartDateQ(null);
    setEndDateQ(null);
    setCapacityQ(null);
    setSortBy(null);
    setSortOrder(null);
    setDestination(null);
    setPage(1);
  }, [
    setSearchQuery,
    setCategoryId,
    setStartDateQ,
    setEndDateQ,
    setCapacityQ,
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
    startDate: startDateQ,
    endDate: endDateQ,
    capacity: capacityQ,

    // Local input state
    localSearchName,
    localStartDate,
    localEndDate,
    localCapacity,

    // Setters
    setLocalSearchName,
    setLocalStartDate,
    setLocalEndDate,
    setLocalCapacity,
    toggleCategory,
    setSortBy: handleSetSortBy,
    setSortOrder: handleSetSortOrder,
    setPage: (v: number) => setPage(v),
    resetFilters,
  };
}
