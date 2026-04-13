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

  // ── Build API query params ──
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

  const {
    data: response,
    isLoading,
    isError,
    error,
  } = useProperties(queryParams);

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
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground md:text-3xl">
          {filters.destination
            ? `Properties in ${filters.destination}`
            : "All Properties"}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground font-medium">
          {isLoading ? (
            <span className="flex items-center gap-2">
              <Loader2 className="h-3 w-3 animate-spin" />
              Searching properties...
            </span>
          ) : (
            `Showing ${properties.length} of ${meta?.total || 0} properties`
          )}
        </p>
      </div>

      <div className="flex gap-8">
        {/* Desktop Sidebar */}
        <aside className="hidden w-64 shrink-0 lg:block">
          <div className="sticky top-32 rounded-3xl border border-border/50 bg-card/50 p-6 backdrop-blur-sm shadow-sm">
            <h2 className="mb-5 text-base font-semibold text-foreground">
              Filters
            </h2>
            <FilterContent {...filterProps} />
          </div>
        </aside>

        {/* Main Content Area */}
        <div className="flex-1">
          {/* Mobile Filter Button */}
          <div className="mb-6 lg:hidden">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2 rounded-full px-5">
                  <SlidersHorizontal className="h-4 w-4" />
                  Apply Filters
                </Button>
              </SheetTrigger>
              <SheetContent
                side="bottom"
                className="max-h-[85vh] overflow-y-auto rounded-t-[2.5rem] p-0"
              >
                <SheetHeader className="p-6 pb-0">
                  <SheetTitle className="text-xl">Filters</SheetTitle>
                </SheetHeader>
                <div className="px-6 py-6 pb-12">
                  <FilterContent {...filterProps} />
                </div>
              </SheetContent>
            </Sheet>
          </div>

          {/* Data Presentation Layer */}
          <div className="min-h-[40vh]">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-24 gap-4">
                <div className="relative">
                  <Loader2 className="h-10 w-10 animate-spin text-primary opacity-20" />
                  <Loader2 className="h-10 w-10 animate-spin text-primary absolute inset-0 [animation-delay:-0.3s]" />
                </div>
                <p className="text-sm font-medium text-muted-foreground animate-pulse">
                  Finding the best stays for you...
                </p>
              </div>
            ) : isError ? (
              <div className="flex flex-col items-center justify-center py-20 rounded-3xl border-2 border-dashed border-muted/20 bg-muted/5">
                <p className="text-sm font-medium text-destructive mb-4">
                  Failed to load properties: {(error as Error)?.message || "Internal Error"}
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  className="rounded-full"
                  onClick={() => window.location.reload()}
                >
                  Try Refreshing
                </Button>
              </div>
            ) : properties.length > 0 ? (
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
                {properties.map((property) => (
                  <PropertyCard key={property.id} property={property} />
                ))}
              </div>
            ) : (
              <PropertyEmptyState onReset={filters.resetFilters} />
            )}
          </div>

          {/* Pagination Layer */}
          {!isLoading && properties.length > 0 && totalPages > 1 && (
            <div className="mt-12 pt-8 border-t border-border/50">
              <PropertyPagination
                page={filters.page}
                totalPages={totalPages}
                onPageChange={filters.setPage}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PropertiesPage;
