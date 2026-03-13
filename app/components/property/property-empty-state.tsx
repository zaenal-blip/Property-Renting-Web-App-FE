import { Search } from "lucide-react";
import { Button } from "~/components/ui/button";

interface PropertyEmptyStateProps {
  onReset: () => void;
}

export function PropertyEmptyState({ onReset }: PropertyEmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <Search className="mb-4 h-12 w-12 text-muted-foreground/50" />
      <h3 className="text-lg font-semibold text-foreground">
        No properties found
      </h3>
      <p className="mt-1 text-sm text-muted-foreground">
        Try adjusting your filters or search criteria
      </p>
      <Button variant="outline" size="sm" className="mt-4" onClick={onReset}>
        Reset Filters
      </Button>
    </div>
  );
}
