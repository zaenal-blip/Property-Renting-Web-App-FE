import * as React from "react";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import type { DateRange } from "react-day-picker";
import { cn } from "~/lib/utils";
import { Button } from "~/components/ui/button";
import { Calendar } from "~/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover";

interface DateRangePickerProps {
  from: Date;
  to: Date;
  onSelect: (range: { from: Date; to: Date }) => void;
  className?: string;
}

export function DateRangePicker({
  from,
  to,
  onSelect,
  className,
}: DateRangePickerProps) {
  const [open, setOpen] = React.useState(false);
  const [range, setRange] = React.useState<DateRange>({ from, to });

  // Reset internal state when popover opens
  React.useEffect(() => {
    if (open) {
      setRange({ from, to });
    }
  }, [open]);

  const handleSelect = (selected: DateRange | undefined) => {
    if (!selected) return;
    setRange(selected);
  };

  const handleApply = () => {
    if (range?.from && range?.to) {
      onSelect({ from: range.from, to: range.to });
      setOpen(false);
    }
  };

  const handleReset = () => {
    setRange({ from, to });
  };

  const label = `${format(from, "dd MMM yyyy")} – ${format(to, "dd MMM yyyy")}`;
  const canApply = range?.from && range?.to;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn("justify-start text-left font-normal", className)}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          <span className="truncate">{label}</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="end">
        <Calendar
          mode="range"
          selected={range}
          onSelect={handleSelect}
          numberOfMonths={2}
          defaultMonth={new Date(from.getFullYear(), from.getMonth())}
          disabled={(date) => date > new Date()}
        />
        <div className="flex items-center justify-end gap-2 p-3 pt-0 border-t">
          <Button variant="ghost" size="sm" onClick={handleReset}>
            Reset
          </Button>
          <Button size="sm" onClick={handleApply} disabled={!canApply}>
            Apply
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
