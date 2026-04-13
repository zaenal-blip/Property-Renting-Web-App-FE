import { Search, ArrowDownAZ, ArrowDownZA, Loader2 } from "lucide-react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Checkbox } from "~/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "~/components/ui/radio-group";
import { useCategories } from "~/hooks/use-properties";

export interface FilterContentProps {
  searchName: string;
  setSearchName: (v: string) => void;
  selectedCategories: string[];
  toggleCategory: (c: string) => void;
  sortBy: string;
  setSortBy: (v: string) => void;
  sortOrder: string;
  setSortOrder: (v: string) => void;
  onReset: () => void;
}

export function FilterContent({
  searchName,
  setSearchName,
  selectedCategories,
  toggleCategory,
  sortBy,
  setSortBy,
  sortOrder,
  setSortOrder,
  onReset,
}: FilterContentProps) {
  const { data: categories, isLoading: catLoading } = useCategories();

  return (
    <div className="space-y-6">
      {/* Search by name */}
      <div>
        <Label className="mb-2 block text-sm font-medium">
          Search by Property Name
        </Label>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            id="filter-search-name"
            placeholder="Property name..."
            value={searchName}
            onChange={(e) => setSearchName(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      {/* Category */}
      <div>
        <Label className="mb-3 block text-sm font-medium">Category</Label>
        {catLoading ? (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            Loading...
          </div>
        ) : (
          <div className="space-y-2">
            {(categories || []).map((cat) => (
              <label
                key={cat.id}
                className="flex items-center gap-2 cursor-pointer"
              >
                <Checkbox
                  id={`filter-category-${cat.name}`}
                  checked={selectedCategories.includes(cat.name.toLowerCase())}
                  onCheckedChange={() => toggleCategory(cat.name)}
                />
                <span className="text-sm text-foreground capitalize">
                  {cat.name}
                </span>
              </label>
            ))}
          </div>
        )}
      </div>

      {/* Sort By */}
      <div>
        <Label className="mb-3 block text-sm font-medium">Sort By</Label>
        <RadioGroup value={sortBy} onValueChange={setSortBy}>
          <label className="flex items-center gap-2 cursor-pointer">
            <RadioGroupItem value="name" id="sort-name" />
            <span className="text-sm">Name</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <RadioGroupItem value="price" id="sort-price" />
            <span className="text-sm">Price</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <RadioGroupItem value="createdAt" id="sort-newest" />
            <span className="text-sm">Newest</span>
          </label>
        </RadioGroup>
      </div>

      {/* Sort Order */}
      <div>
        <Label className="mb-3 block text-sm font-medium">Sort Order</Label>
        <RadioGroup value={sortOrder} onValueChange={setSortOrder}>
          <label className="flex items-center gap-2 cursor-pointer">
            <RadioGroupItem value="asc" id="order-asc" />
            <span className="flex items-center gap-1.5 text-sm">
              Ascending{" "}
              <ArrowDownAZ className="h-3.5 w-3.5 text-muted-foreground" />
            </span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <RadioGroupItem value="desc" id="order-desc" />
            <span className="flex items-center gap-1.5 text-sm">
              Descending{" "}
              <ArrowDownZA className="h-3.5 w-3.5 text-muted-foreground" />
            </span>
          </label>
        </RadioGroup>
      </div>

      <Button
        id="filter-reset-btn"
        variant="outline"
        size="sm"
        onClick={onReset}
        className="w-full"
      >
        Reset Filters
      </Button>
    </div>
  );
}
