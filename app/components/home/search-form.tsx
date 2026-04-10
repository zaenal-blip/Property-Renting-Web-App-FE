import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { Search, MapPin, Calendar, Users, Minus, Plus, Loader2 } from "lucide-react";
import { Button } from "~/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover";
import { Calendar as CalendarUI } from "~/components/ui/calendar";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "~/components/ui/command";
import { cn, formatShortDate } from "~/lib/utils";
import { format } from "date-fns";
import { useSearchStore } from "~/modules/search/search.store";
import { useLocations } from "~/hooks/use-properties";

export function SearchForm() {
  const navigate = useNavigate();
  const { destination, guests, setSearch } = useSearchStore();
  const [destOpen, setDestOpen] = useState(false);
  const [dateRange, setDateRange] = useState<{ from?: Date; to?: Date }>({});
  const [localDest, setLocalDest] = useState(destination);
  const [localGuests, setLocalGuests] = useState(guests);

  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const { data: locations = [], isLoading: isLoadingLocations } =
    useLocations(debouncedSearch);

  const handleSearch = () => {
    setSearch({
      destination: localDest,
      checkinDate: dateRange.from?.toISOString() || "",
      checkoutDate: dateRange.to?.toISOString() || "",
      guests: localGuests,
    });
    const params = new URLSearchParams();
    if (localDest) params.set("city", localDest); // Changed 'destination' to 'city' since properties.tsx listens to 'city' or 'search' (Wait, use-property-filters mapping? Let's keep destination because properties maps it to city) actually I see use-property-filters.ts uses 'destination'. Let's stick with 'destination'.
    if (localDest) params.set("destination", localDest);
    if (dateRange.from) params.set("checkinDate", dateRange.from.toISOString());
    if (dateRange.to) params.set("checkoutDate", dateRange.to.toISOString());
    params.set("guests", String(localGuests));

    navigate(`/properties?${params.toString()}`);
  };

  return (
    <div className="glass-card w-full rounded-2xl p-4 md:p-6">
      <div className="grid grid-cols-1 gap-3 md:grid-cols-4 md:gap-4">
        {/* Destination */}
        <Popover
          open={destOpen}
          onOpenChange={(open) => {
            setDestOpen(open);
            if (!open) setSearchQuery(""); // clear search on close
          }}
        >
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "h-12 w-full justify-start gap-2 text-left font-normal md:h-14 transition-all",
                destOpen && "ring-2 ring-primary border-primary",
              )}
            >
              <MapPin className="h-4 w-4 shrink-0 text-primary" />
              <span className={cn(!localDest && "text-muted-foreground")}>
                {localDest || "Where are you going?"}
              </span>
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-64 p-0" align="start">
            <Command shouldFilter={false}>
              <CommandInput
                placeholder="Search destination..."
                value={searchQuery}
                onValueChange={setSearchQuery}
              />
              <CommandList>
                {isLoadingLocations ? (
                  <div className="flex h-16 items-center justify-center text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin" />
                  </div>
                ) : locations.length === 0 ? (
                  <CommandEmpty>No city found.</CommandEmpty>
                ) : (
                  <CommandGroup>
                    {locations.map((loc) => (
                      <CommandItem
                        key={loc.value}
                        value={loc.value}
                        onSelect={() => {
                          setLocalDest(loc.label);
                          setDestOpen(false);
                        }}
                      >
                        <MapPin className="mr-2 h-4 w-4 text-muted-foreground" />
                        {loc.label}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                )}
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>

        {/* Dates */}
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className="h-12 w-full justify-start gap-2 text-left font-normal md:col-span-1 md:h-14 transition-all data-[state=open]:ring-2 data-[state=open]:ring-primary data-[state=open]:border-primary"
            >
              <Calendar className="h-4 w-4 shrink-0 text-primary" />
              <span className={cn(!dateRange.from && "text-muted-foreground")}>
                {dateRange.from
                  ? dateRange.to
                    ? `${formatShortDate(dateRange.from)} - ${formatShortDate(dateRange.to)}`
                    : formatShortDate(dateRange.from)
                  : "Check-in — Check-out"}
              </span>
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <CalendarUI
              mode="range"
              selected={
                dateRange.from
                  ? { from: dateRange.from, to: dateRange.to }
                  : undefined
              }
              onSelect={(range) =>
                setDateRange({ from: range?.from, to: range?.to })
              }
              numberOfMonths={2}
              disabled={(date) => date < new Date()}
              className="pointer-events-auto p-3"
            />
          </PopoverContent>
        </Popover>

        {/* Guests */}
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className="h-12 w-full justify-start gap-2 text-left font-normal md:h-14 transition-all data-[state=open]:ring-2 data-[state=open]:ring-primary data-[state=open]:border-primary"
            >
              <Users className="h-4 w-4 shrink-0 text-primary" />
              <span>
                {localGuests} Guest{localGuests > 1 ? "s" : ""}
              </span>
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-48" align="start">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-foreground">
                Guests
              </span>
              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => setLocalGuests(Math.max(1, localGuests - 1))}
                  disabled={localGuests <= 1}
                >
                  <Minus className="h-3 w-3" />
                </Button>
                <span className="w-4 text-center text-sm font-medium">
                  {localGuests}
                </span>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => setLocalGuests(Math.min(20, localGuests + 1))}
                  disabled={localGuests >= 20}
                >
                  <Plus className="h-3 w-3" />
                </Button>
              </div>
            </div>
          </PopoverContent>
        </Popover>

        {/* Search */}
        <Button
          variant="cta"
          className="h-12 gap-2 md:h-14"
          onClick={handleSearch}
        >
          <Search className="h-4 w-4" />
          Search Properties
        </Button>
      </div>
    </div>
  );
}
