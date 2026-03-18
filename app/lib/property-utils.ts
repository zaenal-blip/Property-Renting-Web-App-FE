import type { Property } from "~/types/property";

interface FilterCriteria {
  destination: string;
  searchQuery: string;
  selectedCategories: string[];
  sortBy: string;
  sortOrder: string;
  minPrice: number | null;
  maxPrice: number | null;
  minRating: number | null;
}

/**
 * Pure function — filters and sorts a property array based on the given criteria.
 * Easy to unit-test because it has no side-effects or hook dependencies.
 */
export function filterAndSortProperties(
  properties: Property[],
  criteria: FilterCriteria,
): Property[] {
  const {
    destination,
    searchQuery,
    selectedCategories,
    sortBy,
    sortOrder,
    minPrice,
    maxPrice,
    minRating,
  } = criteria;

  let result = [...properties];

  if (destination) {
    const lower = destination.toLowerCase();
    result = result.filter((p) => p.city.toLowerCase().includes(lower));
  }

  if (searchQuery) {
    const lower = searchQuery.toLowerCase();
    result = result.filter((p) => p.name.toLowerCase().includes(lower));
  }

  if (selectedCategories.length > 0) {
    result = result.filter((p) => selectedCategories.includes(p.category.name));
  }

  if (minPrice !== null) {
    result = result.filter((p) => p.lowestPrice >= minPrice);
  }

  if (maxPrice !== null) {
    result = result.filter((p) => p.lowestPrice <= maxPrice);
  }

  if (minRating !== null) {
    result = result.filter((p) => p.rating >= minRating);
  }

  // Sort
  if (sortBy === "price") {
    result.sort((a, b) => {
      return sortOrder === "asc"
        ? a.lowestPrice - b.lowestPrice
        : b.lowestPrice - a.lowestPrice;
    });
  } else if (sortBy === "rating") {
    result.sort((a, b) => {
      // For rating, asc means lowest to highest, desc means highest to lowest (standard)
      return sortOrder === "asc" ? a.rating - b.rating : b.rating - a.rating;
    });
  }

  return result;
}

/**
 * Generic paginate helper.
 * Returns the slice of items for the given page.
 */
export function paginateItems<T>(
  items: T[],
  page: number,
  pageSize: number,
): T[] {
  const start = (page - 1) * pageSize;
  return items.slice(start, start + pageSize);
}

/**
 * Calculate total number of pages for a given item count and page size.
 */
export function getTotalPages(totalItems: number, pageSize: number): number {
  return Math.max(1, Math.ceil(totalItems / pageSize));
}
