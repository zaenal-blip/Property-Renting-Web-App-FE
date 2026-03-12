import { useState, useMemo, useEffect } from "react";
import { useSearchParams } from "react-router";
import {
  useQueryState,
  parseAsString,
  parseAsArrayOf,
  parseAsInteger,
} from "nuqs";
import { useDebounce } from "~/hooks/use-debounce";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Checkbox } from "~/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "~/components/ui/radio-group";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "~/components/ui/sheet";
import { PropertyCard } from "~/components/shared/property-card";
import type { PropertyCategory } from "~/types/property";
import { mockProperties } from "~/data/mock-properties";

const categories: { value: PropertyCategory; label: string }[] = [
  { value: "hotel", label: "Hotel" },
  { value: "villa", label: "Villa" },
  { value: "resort", label: "Resort" },
  { value: "apartment", label: "Apartment" },
  { value: "guesthouse", label: "Guesthouse" },
];

function FilterContent({
  searchName,
  setSearchName,
  selectedCategories,
  toggleCategory,
  sortBy,
  setSortBy,
  onReset,
}: {
  searchName: string;
  setSearchName: (v: string) => void;
  selectedCategories: PropertyCategory[];
  toggleCategory: (c: PropertyCategory) => void;
  sortBy: string;
  setSortBy: (v: string) => void;
  onReset: () => void;
}) {
  return (
    <div className="space-y-6">
      <div>
        <Label className="mb-2 block text-sm font-medium">Search by name</Label>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Property name..."
            value={searchName}
            onChange={(e) => setSearchName(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      <div>
        <Label className="mb-3 block text-sm font-medium">Category</Label>
        <div className="space-y-2">
          {categories.map((cat) => (
            <label
              key={cat.value}
              className="flex items-center gap-2 cursor-pointer"
            >
              <Checkbox
                checked={selectedCategories.includes(cat.value)}
                onCheckedChange={() => toggleCategory(cat.value)}
              />
              <span className="text-sm text-foreground">{cat.label}</span>
            </label>
          ))}
        </div>
      </div>

      <div>
        <Label className="mb-3 block text-sm font-medium">Sort by Price</Label>
        <RadioGroup value={sortBy} onValueChange={setSortBy}>
          <label className="flex items-center gap-2 cursor-pointer">
            <RadioGroupItem value="price_asc" />
            <span className="text-sm">Lowest Price</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <RadioGroupItem value="price_desc" />
            <span className="text-sm">Highest Price</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <RadioGroupItem value="rating" />
            <span className="text-sm">Best Rating</span>
          </label>
        </RadioGroup>
      </div>

      <Button variant="outline" size="sm" onClick={onReset} className="w-full">
        Reset Filters
      </Button>
    </div>
  );
}

const ITEMS_PER_PAGE = 6;

const PropertiesPage = () => {
  const [destination] = useQueryState(
    "destination",
    parseAsString.withDefault(""),
  );
  const [searchQuery, setSearchQuery] = useQueryState(
    "q",
    parseAsString.withDefault(""),
  );
  const [selectedCategories, setSelectedCategories] = useQueryState(
    "category",
    parseAsArrayOf(parseAsString).withDefault([]),
  );
  const [sortBy, setSortBy] = useQueryState(
    "sort",
    parseAsString.withDefault("price_asc"),
  );
  const [page, setPage] = useQueryState("page", parseAsInteger.withDefault(1));

  // Local state for debounced search input
  const [localSearchName, setLocalSearchName] = useState(searchQuery || "");
  const debouncedSearchName = useDebounce(localSearchName, 500);

  useEffect(() => {
    if (debouncedSearchName !== searchQuery) {
      setSearchQuery(debouncedSearchName || null);
      setPage(1); // Reset to page 1 on new search
    }
  }, [debouncedSearchName, setSearchQuery, searchQuery, setPage]);

  const toggleCategory = (cat: string) => {
    setSelectedCategories((prev) => {
      const newCats = prev.includes(cat)
        ? prev.filter((c) => c !== cat)
        : [...prev, cat];
      return newCats.length > 0 ? newCats : null;
    });
    setPage(1); // Reset page on filter change
  };

  const resetFilters = () => {
    setLocalSearchName("");
    setSearchQuery(null);
    setSelectedCategories(null);
    setSortBy(null); // Goes back to default 'price_asc'
    setPage(1);
  };

  const allFiltered = useMemo(() => {
    let result = [...mockProperties];

    if (destination) {
      result = result.filter((p) =>
        p.city.toLowerCase().includes(destination.toLowerCase()),
      );
    }
    if (searchQuery) {
      result = result.filter((p) =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase()),
      );
    }
    if (selectedCategories.length > 0) {
      result = result.filter((p) => selectedCategories.includes(p.category));
    }

    if (sortBy === "price_asc")
      result.sort((a, b) => a.lowestPrice - b.lowestPrice);
    if (sortBy === "price_desc")
      result.sort((a, b) => b.lowestPrice - a.lowestPrice);
    if (sortBy === "rating") result.sort((a, b) => b.rating - a.rating);

    return result;
  }, [destination, searchQuery, selectedCategories, sortBy]);

  const totalPages = Math.max(
    1,
    Math.ceil(allFiltered.length / ITEMS_PER_PAGE),
  );

  const paginatedProperties = useMemo(() => {
    const startIndex = (page - 1) * ITEMS_PER_PAGE;
    return allFiltered.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [allFiltered, page]);

  return (
    <div className="container mx-auto px-4 py-24 md:py-28">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground md:text-3xl">
          {destination ? `Properties in ${destination}` : "All Properties"}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Showing {allFiltered.length} properties
        </p>
      </div>

      <div className="flex gap-8">
        {/* Desktop Sidebar */}
        <aside className="hidden w-64 shrink-0 lg:block">
          <div className="sticky top-36 rounded-2xl border border-border bg-card p-5">
            <h2 className="mb-4 text-base font-semibold text-card-foreground">
              Filters
            </h2>
            <FilterContent
              searchName={localSearchName}
              setSearchName={setLocalSearchName}
              selectedCategories={selectedCategories as PropertyCategory[]}
              toggleCategory={toggleCategory}
              sortBy={sortBy}
              setSortBy={setSortBy}
              onReset={resetFilters}
            />
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
                <div className="py-4">
                  <FilterContent
                    searchName={localSearchName}
                    setSearchName={setLocalSearchName}
                    selectedCategories={
                      selectedCategories as PropertyCategory[]
                    }
                    toggleCategory={toggleCategory}
                    sortBy={sortBy}
                    setSortBy={setSortBy}
                    onReset={resetFilters}
                  />
                </div>
              </SheetContent>
            </Sheet>
          </div>

          {paginatedProperties.length > 0 ? (
            <div className="space-y-8">
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
                {paginatedProperties.map((property) => (
                  <PropertyCard key={property.id} property={property} />
                ))}
              </div>

              {/* Pagination Controls */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 pt-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage(Math.max(1, page - 1))}
                    disabled={page <= 1}
                  >
                    Previous
                  </Button>
                  <span className="text-sm font-medium">
                    Page {page} of {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage(Math.min(totalPages, page + 1))}
                    disabled={page >= totalPages}
                  >
                    Next
                  </Button>
                </div>
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <Search className="mb-4 h-12 w-12 text-muted-foreground/50" />
              <h3 className="text-lg font-semibold text-foreground">
                No properties found
              </h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Try adjusting your filters or search criteria
              </p>
              <Button
                variant="outline"
                size="sm"
                className="mt-4"
                onClick={resetFilters}
              >
                Reset Filters
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PropertiesPage;
