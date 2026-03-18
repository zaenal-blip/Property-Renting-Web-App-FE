import { useState, useEffect, useCallback } from "react";
import {
  useQueryState,
  parseAsString,
  parseAsArrayOf,
  parseAsInteger,
  parseAsFloat,
} from "nuqs";
import { useDebounce } from "~/hooks/use-debounce";
import type { PropertyFilterState } from "~/types/property";

/**
 * Custom hook that encapsulates all URL-synced filter state,
 * debounced local inputs, and filter actions for the Properties page.
 */
export function usePropertyFilters(): PropertyFilterState {
  // ── URL-synced query state ──
  const [destination, setDestination] = useQueryState(
    "destination",
    parseAsString.withDefault(""),
  );
  const [searchQuery, setSearchQuery] = useQueryState(
    "search",
    parseAsString.withDefault(""),
  );
  const [selectedCategories, setSelectedCategories] = useQueryState(
    "category",
    parseAsArrayOf(parseAsString).withDefault([]),
  );
  const [sortBy, setSortBy] = useQueryState(
    "sort",
    parseAsString.withDefault("price"),
  );
  const [sortOrder, setSortOrder] = useQueryState(
    "order",
    parseAsString.withDefault("asc"),
  );
  const [minPriceQ, setMinPriceQ] = useQueryState("minPrice", parseAsInteger);
  const [maxPriceQ, setMaxPriceQ] = useQueryState("maxPrice", parseAsInteger);
  const [minRatingQ, setMinRatingQ] = useQueryState("minRating", parseAsFloat);
  const [page, setPage] = useQueryState("page", parseAsInteger.withDefault(1));

  // ── Local debounced state ──
  const [localSearchName, setLocalSearchName] = useState(searchQuery || "");
  const debouncedSearchName = useDebounce(localSearchName, 500);

  const [localLocation, setLocalLocation] = useState(destination || "");
  const debouncedLocation = useDebounce(localLocation, 500);

  const [localMinPrice, setLocalMinPrice] = useState<number | "">(
    minPriceQ ?? "",
  );
  const debouncedMinPrice = useDebounce(localMinPrice, 500);

  const [localMaxPrice, setLocalMaxPrice] = useState<number | "">(
    maxPriceQ ?? "",
  );
  const debouncedMaxPrice = useDebounce(localMaxPrice, 500);

  // ── Sync debounced values → URL params ──
  useEffect(() => {
    let changed = false;

    if (debouncedSearchName !== (searchQuery || "")) {
      setSearchQuery(debouncedSearchName || null);
      changed = true;
    }
    if (debouncedLocation !== (destination || "")) {
      setDestination(debouncedLocation || null);
      changed = true;
    }

    const currentMin = minPriceQ ?? "";
    if (debouncedMinPrice !== currentMin) {
      setMinPriceQ(debouncedMinPrice === "" ? null : debouncedMinPrice);
      changed = true;
    }

    const currentMax = maxPriceQ ?? "";
    if (debouncedMaxPrice !== currentMax) {
      setMaxPriceQ(debouncedMaxPrice === "" ? null : debouncedMaxPrice);
      changed = true;
    }

    if (changed) {
      setPage(1);
    }
  }, [
    debouncedSearchName,
    searchQuery,
    setSearchQuery,
    debouncedLocation,
    destination,
    setDestination,
    debouncedMinPrice,
    minPriceQ,
    setMinPriceQ,
    debouncedMaxPrice,
    maxPriceQ,
    setMaxPriceQ,
    setPage,
  ]);

  // ── Actions ──
  const toggleCategory = useCallback(
    (cat: string) => {
      setSelectedCategories((prev) => {
        const newCats = prev.includes(cat)
          ? prev.filter((c) => c !== cat)
          : [...prev, cat];
        return newCats.length > 0 ? newCats : null;
      });
      setPage(1);
    },
    [setSelectedCategories, setPage],
  );

  const handleSetMinRating = useCallback(
    (v: number | null) => {
      setMinRatingQ(v);
      setPage(1);
    },
    [setMinRatingQ, setPage],
  );

  const resetFilters = useCallback(() => {
    setLocalSearchName("");
    setLocalLocation("");
    setLocalMinPrice("");
    setLocalMaxPrice("");
    setSearchQuery(null);
    setDestination(null);
    setSelectedCategories(null);
    setMinPriceQ(null);
    setMaxPriceQ(null);
    setMinRatingQ(null);
    setSortBy(null);
    setSortOrder(null);
    setPage(1);
  }, [
    setSearchQuery,
    setDestination,
    setSelectedCategories,
    setMinPriceQ,
    setMaxPriceQ,
    setMinRatingQ,
    setSortBy,
    setSortOrder,
    setPage,
  ]);

  return {
    // URL-synced values
    destination,
    searchQuery,
    selectedCategories,
    sortBy,
    sortOrder,
    minPrice: minPriceQ,
    maxPrice: maxPriceQ,
    minRating: minRatingQ,
    page,

    // Local input state
    localSearchName,
    localLocation,
    localMinPrice,
    localMaxPrice,

    // Setters
    setLocalSearchName,
    setLocalLocation,
    setLocalMinPrice,
    setLocalMaxPrice,
    setMinRating: handleSetMinRating,
    setSortBy,
    setSortOrder,
    setPage: (v: number) => setPage(v),
    toggleCategory,
    resetFilters,
  };
}
