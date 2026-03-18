import { Search, MapPin, ArrowDownAZ, ArrowDownZA } from "lucide-react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Checkbox } from "~/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "~/components/ui/radio-group";
import { PROPERTY_CATEGORIES, RATING_OPTIONS } from "~/types/property";

export interface FilterContentProps {
  searchName: string;
  setSearchName: (v: string) => void;
  location: string;
  setLocation: (v: string) => void;
  minPrice: number | "";
  setMinPrice: (v: number | "") => void;
  maxPrice: number | "";
  setMaxPrice: (v: number | "") => void;
  minRating: number | null;
  setMinRating: (v: number | null) => void;
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
  location,
  setLocation,
  minPrice,
  setMinPrice,
  maxPrice,
  setMaxPrice,
  minRating,
  setMinRating,
  selectedCategories,
  toggleCategory,
  sortBy,
  setSortBy,
  sortOrder,
  setSortOrder,
  onReset,
}: FilterContentProps) {
  return (
    <div className="space-y-6">
      {/* Location */}
      <div>
        <Label className="mb-2 block text-sm font-medium">Location</Label>
        <div className="relative">
          <MapPin className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="City or location..."
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      {/* Search by name */}
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

      {/* Price Range */}
      <div>
        <Label className="mb-3 block text-sm font-medium">
          Price Range (Rp)
        </Label>
        <div className="flex items-center gap-2">
          <Input
            type="number"
            placeholder="Min RP"
            value={minPrice}
            onChange={(e) =>
              setMinPrice(e.target.value ? Number(e.target.value) : "")
            }
          />
          <span className="text-muted-foreground">-</span>
          <Input
            type="number"
            placeholder="Max RP"
            value={maxPrice}
            onChange={(e) =>
              setMaxPrice(e.target.value ? Number(e.target.value) : "")
            }
          />
        </div>
      </div>

      {/* Category */}
      <div>
        <Label className="mb-3 block text-sm font-medium">Category</Label>
        <div className="space-y-2">
          {PROPERTY_CATEGORIES.map((cat) => (
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

      {/* Sort By */}
      <div>
        <Label className="mb-3 block text-sm font-medium">Sort By</Label>
        <RadioGroup value={sortBy} onValueChange={setSortBy}>
          <label className="flex items-center gap-2 cursor-pointer">
            <RadioGroupItem value="price" />
            <span className="text-sm">Price</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <RadioGroupItem value="rating" />
            <span className="text-sm">Rating</span>
          </label>
        </RadioGroup>
      </div>

      {/* Sort Order */}
      <div>
        <Label className="mb-3 block text-sm font-medium">Sort Order</Label>
        <RadioGroup value={sortOrder} onValueChange={setSortOrder}>
          <label className="flex items-center gap-2 cursor-pointer">
            <RadioGroupItem value="asc" />
            <span className="flex items-center gap-1.5 text-sm">
              Ascending (A-Z){" "}
              <ArrowDownAZ className="h-3.5 w-3.5 text-muted-foreground" />
            </span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <RadioGroupItem value="desc" />
            <span className="flex items-center gap-1.5 text-sm">
              Descending (Z-A){" "}
              <ArrowDownZA className="h-3.5 w-3.5 text-muted-foreground" />
            </span>
          </label>
        </RadioGroup>
      </div>

      {/* Minimum Rating */}
      <div>
        <Label className="mb-3 block text-sm font-medium">Minimum Rating</Label>
        <RadioGroup
          value={minRating?.toString() || "0"}
          onValueChange={(v) => setMinRating(v === "0" ? null : Number(v))}
        >
          {RATING_OPTIONS.map((opt) => (
            <label
              key={opt.value}
              className="flex items-center gap-2 cursor-pointer"
            >
              <RadioGroupItem value={opt.value} />
              <span className="text-sm">{opt.label}</span>
            </label>
          ))}
        </RadioGroup>
      </div>

      <Button variant="outline" size="sm" onClick={onReset} className="w-full">
        Reset Filters
      </Button>
    </div>
  );
}
