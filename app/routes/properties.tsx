import { SlidersHorizontal, Loader2 } from "lucide-react";
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
import { useProperties } from "~/hooks/use-properties";
import { ITEMS_PER_PAGE } from "~/types/property";

const PropertiesPage = () => {
  const filters = usePropertyFilters();

  // ── Build API query params (supports multiple categories via comma-separated categoryId) ──
  const queryParams = {
    page: filters.page,
    take: ITEMS_PER_PAGE,
    search: filters.searchQuery || undefined,
    destination: filters.destination || undefined,
    categoryId:
      filters.selectedCategories.length > 0
        ? filters.selectedCategories.join(",")
        : undefined,
    sortBy: filters.sortBy || "createdAt",
    sortOrder: (filters.sortOrder || "desc") as "asc" | "desc",
    startDate: filters.startDate || undefined,
    endDate: filters.endDate || undefined,
    capacity: filters.capacity || undefined,
  };

  const { data: response, isLoading, isError, error } =
    useProperties(queryParams);

  const properties = response?.data || [];
  const meta = response?.meta;
  const totalPages = meta?.totalPages || 1;

  // ── Shared filter props ──
  const filterProps = {
    searchName: filters.localSearchName,
    setSearchName: filters.setLocalSearchName,
    selectedCategories: filters.selectedCategories,
    toggleCategory: filters.toggleCategory,
    sortBy: filters.sortBy,
    setSortBy: filters.setSortBy,
    sortOrder: filters.sortOrder,
    setSortOrder: filters.setSortOrder,
    startDate: filters.localStartDate,
    setStartDate: filters.setLocalStartDate,
    endDate: filters.localEndDate,
    setEndDate: filters.setLocalEndDate,
    capacity: filters.localCapacity,
    setCapacity: filters.setLocalCapacity,
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
          {isLoading
            ? "Loading properties..."
            : `Showing ${properties.length} of ${meta?.total || 0} properties`}
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

          {/* Loading State */}
          {isLoading && (
            <div className="flex flex-col items-center justify-center py-20 gap-3">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="text-sm text-muted-foreground">
                Loading properties...
              </p>
            </div>
          )}

          {/* Error State */}
          {isError && (
            <div className="flex flex-col items-center justify-center py-20 gap-3">
              <p className="text-sm text-destructive">
                Failed to load properties.{" "}
                {(error as Error)?.message || "Please try again."}
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.location.reload()}
              >
                Retry
              </Button>
            </div>
          )}

          {/* Property Grid / Empty State */}
          {!isLoading && !isError && (
            <>
              {properties.length > 0 ? (
                <div className="h-auto grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3 mb-6">
                  {properties.map((property) => (
                    <PropertyCard key={property.id} property={property} />
                  ))}
                </div>
              ) : (
                <PropertyEmptyState onReset={filters.resetFilters} />
              )}
            </>
          )}
        </div>
      </div>

      {/* Pagination */}
      {!isLoading && properties.length > 0 && totalPages > 1 && (
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
