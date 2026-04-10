import { useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm, type SubmitHandler, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Calendar,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  Plus,
  Pencil,
  Trash2,
  Loader2,
  DollarSign,
  Users,
  Check,
  X,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Badge } from "~/components/ui/badge";
import { Skeleton } from "~/components/ui/skeleton";
import { Separator } from "~/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";

import {
  fetchRoomById,
  fetchAvailability,
  bulkSetAvailability,
  fetchPeakRates,
  createPeakRate,
  updatePeakRate,
  deletePeakRate,
  type RoomAvailability,
  type PeakSeasonRate,
} from "~/lib/tenant-api";

// ─── Peak Rate Form ────────────────────────────────────────
const peakRateSchema = z.object({
  startDate: z.string().min(1, "Start date is required"),
  endDate: z.string().min(1, "End date is required"),
  priceType: z.enum(["NOMINAL", "PERCENTAGE"]),
  value: z.coerce.number().min(0, "Value must be >= 0"),
});

type PeakRateFormValues = z.infer<typeof peakRateSchema>;

// ─── Calendar Helpers ──────────────────────────────────────
function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year: number, month: number) {
  return new Date(year, month, 1).getDay();
}

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

export default function RoomManagementPage() {
  const { id: propertyId, roomId } = useParams<{
    id: string;
    roomId: string;
  }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const now = new Date();
  const [calMonth, setCalMonth] = useState(now.getMonth());
  const [calYear, setCalYear] = useState(now.getFullYear());
  const [selectedDates, setSelectedDates] = useState<Set<string>>(new Set());
  const [showPeakRateDialog, setShowPeakRateDialog] = useState(false);
  const [editingRate, setEditingRate] = useState<PeakSeasonRate | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<PeakSeasonRate | null>(null);

  // Fetch room details
  const { data: room, isLoading: isLoadingRoom } = useQuery({
    queryKey: ["room", roomId],
    queryFn: () => fetchRoomById(roomId!),
    enabled: !!roomId,
  });

  // Fetch availability for current calendar month
  const { data: availability = [], isLoading: isLoadingAvailability } =
    useQuery({
      queryKey: ["availability", roomId, calMonth + 1, calYear],
      queryFn: () => fetchAvailability(roomId!, calMonth + 1, calYear),
      enabled: !!roomId,
    });

  // Fetch peak rates
  const { data: peakRates = [], isLoading: isLoadingRates } = useQuery({
    queryKey: ["peak-rates", roomId],
    queryFn: () => fetchPeakRates(roomId!),
    enabled: !!roomId,
  });

  // Build availability map
  const availabilityMap = useMemo(() => {
    const map: Record<string, boolean> = {};
    availability.forEach((a: RoomAvailability) => {
      const dateStr = new Date(a.date).toISOString().split("T")[0];
      map[dateStr] = a.isAvailable;
    });
    return map;
  }, [availability]);

  // Bulk set availability mutation
  const bulkMutation = useMutation({
    mutationFn: ({
      isAvailable,
    }: {
      isAvailable: boolean;
    }) =>
      bulkSetAvailability(
        roomId!,
        Array.from(selectedDates).map((date) => ({ date, isAvailable })),
      ),
    onSuccess: () => {
      toast.success("Availability updated");
      queryClient.invalidateQueries({
        queryKey: ["availability", roomId],
      });
      setSelectedDates(new Set());
    },
    onError: (error: any) =>
      toast.error(
        error.response?.data?.message || "Failed to update availability",
      ),
  });

  // Peak rate form
  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<PeakRateFormValues>({
    resolver: zodResolver(peakRateSchema) as Resolver<PeakRateFormValues>,
    defaultValues: { priceType: "PERCENTAGE" },
  });

  // Create peak rate mutation
  const createRateMutation = useMutation({
    mutationFn: (data: PeakRateFormValues) =>
      createPeakRate(roomId!, {
        roomId: roomId!,
        ...data,
      }),
    onSuccess: () => {
      toast.success("Peak rate created");
      queryClient.invalidateQueries({ queryKey: ["peak-rates", roomId] });
      setShowPeakRateDialog(false);
      reset();
    },
    onError: (error: any) =>
      toast.error(
        error.response?.data?.message || "Failed to create peak rate",
      ),
  });

  // Update peak rate mutation
  const updateRateMutation = useMutation({
    mutationFn: (data: PeakRateFormValues) =>
      updatePeakRate(editingRate!.id, data),
    onSuccess: () => {
      toast.success("Peak rate updated");
      queryClient.invalidateQueries({ queryKey: ["peak-rates", roomId] });
      setShowPeakRateDialog(false);
      setEditingRate(null);
      reset();
    },
    onError: (error: any) =>
      toast.error(
        error.response?.data?.message || "Failed to update peak rate",
      ),
  });

  // Delete peak rate mutation
  const deleteRateMutation = useMutation({
    mutationFn: (id: string) => deletePeakRate(id),
    onSuccess: () => {
      toast.success("Peak rate deleted");
      queryClient.invalidateQueries({ queryKey: ["peak-rates", roomId] });
      setDeleteTarget(null);
    },
    onError: (error: any) =>
      toast.error(
        error.response?.data?.message || "Failed to delete peak rate",
      ),
  });

  const onPeakRateSubmit: SubmitHandler<PeakRateFormValues> = (data) => {
    if (editingRate) {
      updateRateMutation.mutate(data);
    } else {
      createRateMutation.mutate(data);
    }
  };

  const openEditRate = (rate: PeakSeasonRate) => {
    setEditingRate(rate);
    reset({
      startDate: new Date(rate.startDate).toISOString().split("T")[0],
      endDate: new Date(rate.endDate).toISOString().split("T")[0],
      priceType: rate.priceType as "NOMINAL" | "PERCENTAGE",
      value: Number(rate.value),
    });
    setShowPeakRateDialog(true);
  };

  const openNewRate = () => {
    setEditingRate(null);
    reset({
      startDate: "",
      endDate: "",
      priceType: "PERCENTAGE",
      value: 0,
    });
    setShowPeakRateDialog(true);
  };

  // Calendar navigation
  const prevMonth = () => {
    if (calMonth === 0) {
      setCalMonth(11);
      setCalYear((y) => y - 1);
    } else {
      setCalMonth((m) => m - 1);
    }
  };

  const nextMonth = () => {
    if (calMonth === 11) {
      setCalMonth(0);
      setCalYear((y) => y + 1);
    } else {
      setCalMonth((m) => m + 1);
    }
  };

  const toggleDate = (dateStr: string) => {
    setSelectedDates((prev) => {
      const next = new Set(prev);
      if (next.has(dateStr)) {
        next.delete(dateStr);
      } else {
        next.add(dateStr);
      }
      return next;
    });
  };

  // Calendar rendering
  const daysInMonth = getDaysInMonth(calYear, calMonth);
  const firstDay = getFirstDayOfMonth(calYear, calMonth);

  const formatCurrency = (val: string | number) =>
    new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(Number(val));

  if (isLoadingRoom) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!room) {
    return (
      <div className="text-center py-20">
        <p className="text-muted-foreground">Room not found</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-20">
      {/* Back */}
      <Button
        variant="ghost"
        size="sm"
        className="gap-2 -ml-2"
        onClick={() =>
          navigate(`/tenant/dashboard/properties/${propertyId}`)
        }
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Property
      </Button>

      {/* Room Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{room.name}</h1>
        <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
          <div className="flex items-center gap-1.5">
            <Users className="h-4 w-4" />
            {room.capacity} guests
          </div>
          <div className="flex items-center gap-1.5 font-semibold text-emerald-600">
            <DollarSign className="h-4 w-4" />
            {formatCurrency(room.basePrice)} / night
          </div>
        </div>
        <p className="text-sm text-muted-foreground mt-2">{room.description}</p>
      </div>

      <Separator />

      {/* Availability Calendar */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Availability Calendar
              </CardTitle>
              <CardDescription>
                Click dates to select, then mark as available or unavailable.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Month Navigation */}
          <div className="flex items-center justify-between mb-4">
            <Button variant="outline" size="icon" onClick={prevMonth}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <h3 className="font-semibold text-lg">
              {MONTH_NAMES[calMonth]} {calYear}
            </h3>
            <Button variant="outline" size="icon" onClick={nextMonth}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-1">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(
              (day) => (
                <div
                  key={day}
                  className="text-center text-xs font-semibold text-muted-foreground py-2"
                >
                  {day}
                </div>
              ),
            )}

            {/* Empty cells for offset */}
            {Array.from({ length: firstDay }).map((_, i) => (
              <div key={`empty-${i}`} />
            ))}

            {/* Day cells */}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const dateStr = `${calYear}-${String(calMonth + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
              const isAvailable = availabilityMap[dateStr] !== false; // default available
              const isSelected = selectedDates.has(dateStr);
              const isToday =
                day === now.getDate() &&
                calMonth === now.getMonth() &&
                calYear === now.getFullYear();
              const isPast =
                new Date(dateStr) <
                new Date(
                  now.getFullYear(),
                  now.getMonth(),
                  now.getDate(),
                );

              return (
                <button
                  key={day}
                  type="button"
                  disabled={isPast}
                  onClick={() => toggleDate(dateStr)}
                  className={`
                    relative h-12 rounded-lg text-sm font-medium transition-all
                    ${isPast ? "opacity-30 cursor-not-allowed" : "cursor-pointer hover:ring-2 hover:ring-primary/30"}
                    ${isSelected ? "ring-2 ring-primary bg-primary/10" : ""}
                    ${
                      isAvailable
                        ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400"
                        : "bg-red-50 text-red-600 dark:bg-red-950/30 dark:text-red-400"
                    }
                    ${isToday ? "font-bold underline" : ""}
                  `}
                >
                  {day}
                  {!isAvailable && (
                    <X className="absolute top-0.5 right-0.5 h-3 w-3" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Bulk Actions */}
          {selectedDates.size > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center justify-between mt-4 p-3 rounded-lg bg-muted border"
            >
              <span className="text-sm font-medium">
                {selectedDates.size} date(s) selected
              </span>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  className="gap-1.5 text-emerald-600 border-emerald-200 hover:bg-emerald-50"
                  onClick={() =>
                    bulkMutation.mutate({ isAvailable: true })
                  }
                  disabled={bulkMutation.isPending}
                >
                  {bulkMutation.isPending ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Check className="h-3.5 w-3.5" />
                  )}
                  Mark Available
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="gap-1.5 text-red-600 border-red-200 hover:bg-red-50"
                  onClick={() =>
                    bulkMutation.mutate({ isAvailable: false })
                  }
                  disabled={bulkMutation.isPending}
                >
                  {bulkMutation.isPending ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <X className="h-3.5 w-3.5" />
                  )}
                  Mark Unavailable
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setSelectedDates(new Set())}
                >
                  Clear
                </Button>
              </div>
            </motion.div>
          )}

          {/* Legend */}
          <div className="flex items-center gap-4 mt-4 text-xs text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <div className="h-3 w-3 rounded bg-emerald-100 border border-emerald-300" />
              Available
            </div>
            <div className="flex items-center gap-1.5">
              <div className="h-3 w-3 rounded bg-red-100 border border-red-300" />
              Unavailable
            </div>
            <div className="flex items-center gap-1.5">
              <div className="h-3 w-3 rounded ring-2 ring-primary bg-primary/10" />
              Selected
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Peak Season Rates */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Peak Season Rates
              </CardTitle>
              <CardDescription>
                Adjust room pricing during peak seasons. Final price = base
                price + adjustment.
              </CardDescription>
            </div>
            <Button className="gap-2" size="sm" onClick={openNewRate}>
              <Plus className="h-4 w-4" />
              Add Rate
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {isLoadingRates ? (
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : peakRates.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground text-sm">
              No peak season rates configured. Room price stays at{" "}
              <strong>{formatCurrency(room.basePrice)}</strong> year-round.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Period</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Value</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {peakRates.map((rate) => (
                  <TableRow key={rate.id}>
                    <TableCell>
                      <span className="text-sm">
                        {new Date(rate.startDate).toLocaleDateString("id-ID")}
                        {" → "}
                        {new Date(rate.endDate).toLocaleDateString("id-ID")}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-xs">
                        {rate.priceType === "PERCENTAGE"
                          ? "Percentage"
                          : "Nominal"}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-semibold">
                      {rate.priceType === "PERCENTAGE"
                        ? `+${Number(rate.value)}%`
                        : formatCurrency(rate.value)}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => openEditRate(rate)}
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive hover:text-destructive"
                          onClick={() => setDeleteTarget(rate)}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Peak Rate Dialog */}
      <Dialog
        open={showPeakRateDialog}
        onOpenChange={(open) => {
          if (!open) {
            setShowPeakRateDialog(false);
            setEditingRate(null);
            reset();
          }
        }}
      >
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {editingRate ? "Edit Peak Rate" : "Add Peak Rate"}
            </DialogTitle>
            <DialogDescription>
              Set a price adjustment for a specific date range.
            </DialogDescription>
          </DialogHeader>
          <form
            onSubmit={handleSubmit(onPeakRateSubmit)}
            className="space-y-4"
          >
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="rate-start">Start Date</Label>
                <Input
                  id="rate-start"
                  type="date"
                  {...register("startDate")}
                />
                {errors.startDate && (
                  <p className="text-xs text-destructive">
                    {errors.startDate.message}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="rate-end">End Date</Label>
                <Input
                  id="rate-end"
                  type="date"
                  {...register("endDate")}
                />
                {errors.endDate && (
                  <p className="text-xs text-destructive">
                    {errors.endDate.message}
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Adjustment Type</Label>
                <Select
                  value={watch("priceType")}
                  onValueChange={(val) =>
                    setValue("priceType", val as "NOMINAL" | "PERCENTAGE", {
                      shouldValidate: true,
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PERCENTAGE">
                      Percentage (+%)
                    </SelectItem>
                    <SelectItem value="NOMINAL">
                      Nominal (Fixed IDR)
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="rate-value">
                  Value{" "}
                  {watch("priceType") === "PERCENTAGE" ? "(%)" : "(IDR)"}
                </Label>
                <div className="relative">
                  <Input
                    id="rate-value"
                    type="number"
                    min={0}
                    className={
                      watch("priceType") === "NOMINAL" ? "pl-12" : ""
                    }
                    {...register("value")}
                  />
                  {watch("priceType") === "NOMINAL" && (
                    <span className="absolute left-3 top-2.5 text-sm font-semibold text-muted-foreground">
                      Rp
                    </span>
                  )}
                </div>
                {errors.value && (
                  <p className="text-xs text-destructive">
                    {errors.value.message}
                  </p>
                )}
              </div>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowPeakRateDialog(false);
                  setEditingRate(null);
                  reset();
                }}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={
                  createRateMutation.isPending ||
                  updateRateMutation.isPending
                }
              >
                {(createRateMutation.isPending ||
                  updateRateMutation.isPending) && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                {editingRate ? "Save Changes" : "Create Rate"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Rate Dialog */}
      <Dialog
        open={!!deleteTarget}
        onOpenChange={() => setDeleteTarget(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Peak Rate</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this peak rate? The room
              will revert to base pricing for these dates.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteTarget(null)}
              disabled={deleteRateMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() =>
                deleteTarget && deleteRateMutation.mutate(deleteTarget.id)
              }
              disabled={deleteRateMutation.isPending}
            >
              {deleteRateMutation.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
