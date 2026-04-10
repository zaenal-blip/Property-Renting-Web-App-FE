import { useState } from "react";
import { Link, useParams, useNavigate } from "react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm, type SubmitHandler, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  Building2,
  DoorOpen,
  MapPin,
  Plus,
  Pencil,
  Trash2,
  Loader2,
  Calendar,
  TrendingUp,
  Users,
  DollarSign,
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
import { Textarea } from "~/components/ui/textarea";
import { Badge } from "~/components/ui/badge";
import { Skeleton } from "~/components/ui/skeleton";
import { Separator } from "~/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";

import {
  fetchPropertyById,
  fetchRooms,
  createRoom,
  updateRoom,
  deleteRoom,
  type Room,
} from "~/lib/tenant-api";

const roomSchema = z.object({
  name: z.string().min(1, "Room name is required"),
  description: z.string().min(1, "Description is required"),
  capacity: z.coerce.number().min(1, "At least 1 guest"),
  basePrice: z.coerce.number().min(0, "Price must be >= 0"),
});

type RoomFormValues = z.infer<typeof roomSchema>;

export default function PropertyDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [showRoomDialog, setShowRoomDialog] = useState(false);
  const [editingRoom, setEditingRoom] = useState<Room | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Room | null>(null);

  // Fetch property
  const { data: property, isLoading } = useQuery({
    queryKey: ["property", id],
    queryFn: () => fetchPropertyById(id!),
    enabled: !!id,
  });

  // Fetch rooms
  const { data: roomsData, isLoading: isLoadingRooms } = useQuery({
    queryKey: ["rooms", id],
    queryFn: () => fetchRooms({ propertyId: id!, take: 100 }),
    enabled: !!id,
  });

  const rooms = roomsData?.data ?? [];

  // Room form
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<RoomFormValues>({
    resolver: zodResolver(roomSchema) as Resolver<RoomFormValues>,
  });

  // Create room mutation
  const createMutation = useMutation({
    mutationFn: (data: RoomFormValues) =>
      createRoom({ propertyId: id!, ...data }),
    onSuccess: () => {
      toast.success("Room created successfully");
      queryClient.invalidateQueries({ queryKey: ["rooms", id] });
      queryClient.invalidateQueries({ queryKey: ["tenant-properties"] });
      setShowRoomDialog(false);
      reset();
    },
    onError: (error: any) =>
      toast.error(error.response?.data?.message || "Failed to create room"),
  });

  // Update room mutation
  const updateMutation = useMutation({
    mutationFn: (data: RoomFormValues) =>
      updateRoom(editingRoom!.id, data),
    onSuccess: () => {
      toast.success("Room updated successfully");
      queryClient.invalidateQueries({ queryKey: ["rooms", id] });
      setEditingRoom(null);
      setShowRoomDialog(false);
      reset();
    },
    onError: (error: any) =>
      toast.error(error.response?.data?.message || "Failed to update room"),
  });

  // Delete room mutation
  const deleteMutation = useMutation({
    mutationFn: (roomId: string) => deleteRoom(roomId),
    onSuccess: () => {
      toast.success("Room deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["rooms", id] });
      queryClient.invalidateQueries({ queryKey: ["tenant-properties"] });
      setDeleteTarget(null);
    },
    onError: (error: any) =>
      toast.error(error.response?.data?.message || "Failed to delete room"),
  });

  const onRoomSubmit: SubmitHandler<RoomFormValues> = (data) => {
    if (editingRoom) {
      updateMutation.mutate(data);
    } else {
      createMutation.mutate(data);
    }
  };

  const openEditRoom = (room: Room) => {
    setEditingRoom(room);
    reset({
      name: room.name,
      description: room.description,
      capacity: room.capacity,
      basePrice: Number(room.basePrice),
    });
    setShowRoomDialog(true);
  };

  const openNewRoom = () => {
    setEditingRoom(null);
    reset({ name: "", description: "", capacity: 1, basePrice: 0 });
    setShowRoomDialog(true);
  };

  const formatCurrency = (val: string | number) =>
    new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(Number(val));

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!property) {
    return (
      <div className="text-center py-20">
        <p className="text-muted-foreground">Property not found</p>
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
        onClick={() => navigate("/tenant/dashboard/properties")}
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Properties
      </Button>

      {/* Property Header */}
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-2xl font-bold tracking-tight">
              {property.name}
            </h1>
            <Badge>{property.category?.name}</Badge>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <MapPin className="h-4 w-4" />
            {property.address}, {property.city}
          </div>
        </div>
        <Button
          variant="outline"
          className="gap-2"
          asChild
        >
          <Link to={`/tenant/dashboard/properties/${id}/edit`}>
            <Pencil className="h-4 w-4" />
            Edit Property
          </Link>
        </Button>
      </div>

      <Separator />

      {/* Rooms Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <DoorOpen className="h-5 w-5" />
              Rooms
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              Manage rooms for this property. Click on a room to manage availability and rates.
            </p>
          </div>
          <Button className="gap-2" onClick={openNewRoom}>
            <Plus className="h-4 w-4" />
            Add Room
          </Button>
        </div>

        {isLoadingRooms ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <Card key={i}>
                <CardContent className="py-6 space-y-3">
                  <Skeleton className="h-5 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                  <Skeleton className="h-4 w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : rooms.length === 0 ? (
          <Card>
            <CardContent className="py-12">
              <div className="flex flex-col items-center justify-center text-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 mb-4">
                  <DoorOpen className="h-7 w-7 text-primary/60" />
                </div>
                <h3 className="font-semibold mb-1">No Rooms Yet</h3>
                <p className="text-muted-foreground text-sm max-w-sm">
                  Add rooms to this property to start receiving bookings.
                </p>
                <Button className="mt-4 gap-2" onClick={openNewRoom}>
                  <Plus className="h-4 w-4" />
                  Add First Room
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <AnimatePresence mode="popLayout">
              {rooms.map((room, i) => (
                <motion.div
                  key={room.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <Card className="group hover:shadow-md transition-all">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <CardTitle className="text-base">
                          {room.name}
                        </CardTitle>
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => openEditRoom(room)}
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive hover:text-destructive"
                            onClick={() => setDeleteTarget(room)}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </div>
                      <CardDescription className="line-clamp-2 text-xs">
                        {room.description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex items-center gap-4 text-sm">
                        <div className="flex items-center gap-1.5 text-muted-foreground">
                          <Users className="h-3.5 w-3.5" />
                          <span>{room.capacity} guests</span>
                        </div>
                        <div className="flex items-center gap-1.5 font-semibold text-emerald-600">
                          <DollarSign className="h-3.5 w-3.5" />
                          <span>{formatCurrency(room.basePrice)}</span>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1 gap-1.5 text-xs"
                          asChild
                        >
                          <Link
                            to={`/tenant/dashboard/properties/${id}/rooms/${room.id}`}
                          >
                            <Calendar className="h-3.5 w-3.5" />
                            Availability
                          </Link>
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1 gap-1.5 text-xs"
                          asChild
                        >
                          <Link
                            to={`/tenant/dashboard/properties/${id}/rooms/${room.id}`}
                          >
                            <TrendingUp className="h-3.5 w-3.5" />
                            Peak Rates
                          </Link>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Room Create/Edit Dialog */}
      <Dialog
        open={showRoomDialog}
        onOpenChange={(open) => {
          if (!open) {
            setShowRoomDialog(false);
            setEditingRoom(null);
            reset();
          }
        }}
      >
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {editingRoom ? "Edit Room" : "Add New Room"}
            </DialogTitle>
            <DialogDescription>
              {editingRoom
                ? "Update the room details below."
                : "Fill in the details for the new room."}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit(onRoomSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="room-name">Room Name</Label>
              <Input
                id="room-name"
                placeholder="e.g. Deluxe Suite, Standard Room"
                {...register("name")}
              />
              {errors.name && (
                <p className="text-xs text-destructive">
                  {errors.name.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="room-description">Description</Label>
              <Textarea
                id="room-description"
                placeholder="Describe the room..."
                {...register("description")}
              />
              {errors.description && (
                <p className="text-xs text-destructive">
                  {errors.description.message}
                </p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="room-capacity">Capacity (Guests)</Label>
                <Input
                  id="room-capacity"
                  type="number"
                  min={1}
                  {...register("capacity")}
                />
                {errors.capacity && (
                  <p className="text-xs text-destructive">
                    {errors.capacity.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="room-price">Base Price (IDR / Night)</Label>
                <div className="relative">
                  <Input
                    id="room-price"
                    type="number"
                    min={0}
                    className="pl-12"
                    {...register("basePrice")}
                  />
                  <span className="absolute left-3 top-2.5 text-sm font-semibold text-muted-foreground">
                    Rp
                  </span>
                </div>
                {errors.basePrice && (
                  <p className="text-xs text-destructive">
                    {errors.basePrice.message}
                  </p>
                )}
              </div>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowRoomDialog(false);
                  setEditingRoom(null);
                  reset();
                }}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={
                  createMutation.isPending || updateMutation.isPending
                }
              >
                {(createMutation.isPending || updateMutation.isPending) && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                {editingRoom ? "Save Changes" : "Create Room"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Room Dialog */}
      <Dialog
        open={!!deleteTarget}
        onOpenChange={() => setDeleteTarget(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Room</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete <strong>{deleteTarget?.name}</strong>?
              This will remove all availability and peak rate data for this room.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteTarget(null)}
              disabled={deleteMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() =>
                deleteTarget && deleteMutation.mutate(deleteTarget.id)
              }
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending && (
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
