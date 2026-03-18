import { useMemo } from "react";
import { SlidersHorizontal } from "lucide-react";
import { Button } from "~/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "~/components/ui/sheet";
import { PropertyCard } from "~/components/shared/property-card";
import { FilterContent } from "~/components/property/filter-content";
import { PropertyEmptyState } from "~/components/property/property-empty-state";
import { PropertyPagination } from "~/components/property/property-pagination";
import { usePropertyFilters } from "~/hooks/use-property-filters";
import {
  filterAndSortProperties,
  paginateItems,
  getTotalPages,
} from "~/lib/property-utils";
import { ITEMS_PER_PAGE } from "~/types/property";
import { mockProperties } from "~/data/mock-properties";

const PropertiesPage = () => {
  const filters = usePropertyFilters();

  // ── Derived data ──
  const allFiltered = useMemo(
    () => filterAndSortProperties(mockProperties, filters),
    [filters],
  );

  const totalPages = getTotalPages(allFiltered.length, ITEMS_PER_PAGE);

  const paginatedProperties = useMemo(
    () => paginateItems(allFiltered, filters.page, ITEMS_PER_PAGE),
    [allFiltered, filters.page],
  );

  // ── Shared filter props ──
  const filterProps = {
    searchName: filters.localSearchName,
    setSearchName: filters.setLocalSearchName,
    location: filters.localLocation,
    setLocation: filters.setLocalLocation,
    minPrice: filters.localMinPrice,
    setMinPrice: filters.setLocalMinPrice,
    maxPrice: filters.localMaxPrice,
    setMaxPrice: filters.setLocalMaxPrice,
    minRating: filters.minRating,
    setMinRating: filters.setMinRating,
    selectedCategories: filters.selectedCategories,
    toggleCategory: filters.toggleCategory,
    sortBy: filters.sortBy,
    setSortBy: filters.setSortBy,
    sortOrder: filters.sortOrder,
    setSortOrder: filters.setSortOrder,
    onReset: filters.resetFilters,
  };

  return (
    <div className="container mx-auto px-4 py-24 md:py-28">
      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground md:text-3xl">
          {filters.destination
            ? `Properties in ${filters.destination}`
            : "All Properties"}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Showing {allFiltered.length} properties
        </p>
      </div>

      <div className="flex gap-8">
        {/* Desktop Sidebar */}
        <aside className="hidden w-64 shrink-0 lg:block">
          <div className="sticky top-32 rounded-2xl border border-border bg-card p-5">
            <h2 className="mb-4 text-base font-semibold text-card-foreground">
              Filters
            </h2>
            <FilterContent {...filterProps} />
          </div>
        </aside>

        {/* Main Grid */}
        <div className="flex-1">
          {/* Mobile Filter Button */}
          <div className="mb-4 lg:hidden">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2">
                  <SlidersHorizontal className="h-4 w-4" />
                  Filters
                </Button>
              </SheetTrigger>
              <SheetContent
                side="bottom"
                className="max-h-[80vh] overflow-y-auto rounded-t-2xl"
              >
                <SheetHeader>
                  <SheetTitle>Filters</SheetTitle>
                </SheetHeader>
                <div className="px-4 py-4 pb-6">
                  <FilterContent {...filterProps} />
                </div>
              </SheetContent>
            </Sheet>
          </div>

          {/* Property Grid / Empty State */}
          {paginatedProperties.length > 0 ? (
            <div className="h-auto grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3 mb-6">
              {paginatedProperties.map((property) => (
                <PropertyCard key={property.id} property={property} />
              ))}
            </div>
          ) : (
            <PropertyEmptyState onReset={filters.resetFilters} />
          )}
        </div>
      </div>

      {/* Pagination */}
      {paginatedProperties.length > 0 && totalPages > 1 && (
        <PropertyPagination
          page={filters.page}
          totalPages={totalPages}
          onPageChange={filters.setPage}
        />
      )}
    </div>
  );
};

export default PropertiesPage;
