import { useState, useRef, useEffect } from "react";
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
  X,
  ImageIcon,
  Info,
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
  fetchPropertyById,
  fetchRooms,
  fetchTenantCategories,
  updateProperty,
  createRoom,
  updateRoom,
  deleteRoom,
  type Room,
} from "~/lib/tenant-api";
import { useAuthStore } from "~/modules/auth/auth.store";

// ─── Schemas ──────────────────────────────────────────
const roomSchema = z.object({
  name: z.string().min(1, "Room name is required"),
  description: z.string().min(1, "Description is required"),
  capacity: z.coerce.number().min(1, "At least 1 guest"),
  qty: z.coerce.number().min(1, "At least 1 room unit").default(1),
  basePrice: z.coerce.number().min(0, "Price must be >= 0"),
});

type RoomFormValues = z.infer<typeof roomSchema>;

const editPropertySchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters"),
  description: z.string().min(20, "Description must be at least 20 characters"),
  categoryId: z.string().min(1, "Category is required"),
  city: z.string().min(1, "City is required"),
  address: z.string().min(5, "Address must be at least 5 characters"),
});

type EditPropertyValues = z.infer<typeof editPropertySchema>;

// ─── Types ──────────────────────────────────────────
interface ExistingImage {
  id: string;
  imageUrl: string;
}

interface NewImage {
  file: File;
  previewUrl: string;
}

const MAX_IMAGES = 5;
const MAX_ROOM_IMAGES = 5;

export default function PropertyDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useAuthStore();
  const roomFileInputRef = useRef<HTMLInputElement>(null);
  const propFileInputRef = useRef<HTMLInputElement>(null);

  // ─── Room Dialog State ──────────────────────────────
  const [showRoomDialog, setShowRoomDialog] = useState(false);
  const [editingRoom, setEditingRoom] = useState<Room | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Room | null>(null);
  const [existingRoomImages, setExistingRoomImages] = useState<ExistingImage[]>(
    [],
  );
  const [newRoomImages, setNewRoomImages] = useState<NewImage[]>([]);
  const [removedRoomImageIds, setRemovedRoomImageIds] = useState<string[]>([]);

  // ─── Edit Property Dialog State ──────────────────────
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [existingPropImages, setExistingPropImages] = useState<ExistingImage[]>(
    [],
  );
  const [newPropImages, setNewPropImages] = useState<NewImage[]>([]);
  const [removedPropImageIds, setRemovedPropImageIds] = useState<string[]>([]);

  // ─── Queries ──────────────────────────────────────────
  const { data: property, isLoading } = useQuery({
    queryKey: ["property", id],
    queryFn: () => fetchPropertyById(id!),
    enabled: !!id,
  });

  const { data: roomsData, isLoading: isLoadingRooms } = useQuery({
    queryKey: ["rooms", id],
    queryFn: () => fetchRooms({ propertyId: id!, take: 100 }),
    enabled: !!id,
  });

  const { data: categoriesData } = useQuery({
    queryKey: ["tenant-categories", user?.id],
    queryFn: () => fetchTenantCategories({ tenantId: user?.id }),
    enabled: !!user?.id,
  });

  const rooms = roomsData?.data ?? [];
  const categories = categoriesData?.data ?? [];

  // Ensure current category is in list
  const categoriesToRender = [...categories];
  if (
    property?.category &&
    !categoriesToRender.find((c) => c.id === property.category.id)
  ) {
    categoriesToRender.push(property.category as any);
  }

  // ─── Room Form ──────────────────────────────────────────
  const {
    register: registerRoom,
    handleSubmit: handleSubmitRoom,
    reset: resetRoom,
    formState: { errors: roomErrors },
  } = useForm<RoomFormValues>({
    resolver: zodResolver(roomSchema) as Resolver<RoomFormValues>,
  });

  // ─── Edit Property Form ──────────────────────────────────
  const {
    register: registerProp,
    handleSubmit: handleSubmitProp,
    watch: watchProp,
    setValue: setValueProp,
    reset: resetProp,
    formState: { errors: propErrors },
  } = useForm<EditPropertyValues>({
    resolver: zodResolver(editPropertySchema) as Resolver<EditPropertyValues>,
    defaultValues: {
      name: "",
      description: "",
      categoryId: "",
      city: "",
      address: "",
    },
  });

  // ─── Room Mutations ──────────────────────────────────────
  const resetRoomImageState = () => {
    newRoomImages.forEach((img) => URL.revokeObjectURL(img.previewUrl));
    setExistingRoomImages([]);
    setNewRoomImages([]);
    setRemovedRoomImageIds([]);
  };

  const createRoomMutation = useMutation({
    mutationFn: (data: RoomFormValues) => {
      const formData = new FormData();
      formData.append("propertyId", id!);
      formData.append("name", data.name);
      formData.append("description", data.description);
      formData.append("capacity", String(data.capacity));
      formData.append("qty", String(data.qty));
      formData.append("basePrice", String(data.basePrice));
      for (const img of newRoomImages) {
        formData.append("images", img.file);
      }
      return createRoom(formData);
    },
    onSuccess: () => {
      toast.success("Room created successfully");
      queryClient.invalidateQueries({ queryKey: ["rooms", id] });
      queryClient.invalidateQueries({ queryKey: ["tenant-properties"] });
      setShowRoomDialog(false);
      resetRoom();
      resetRoomImageState();
    },
    onError: (error: any) =>
      toast.error(error.response?.data?.message || "Failed to create room"),
  });

  const updateRoomMutation = useMutation({
    mutationFn: (data: RoomFormValues) => {
      const formData = new FormData();
      formData.append("name", data.name);
      formData.append("description", data.description);
      formData.append("capacity", String(data.capacity));
      formData.append("qty", String(data.qty));
      formData.append("basePrice", String(data.basePrice));
      if (removedRoomImageIds.length > 0) {
        formData.append(
          "removedImageIds",
          JSON.stringify(removedRoomImageIds),
        );
      }
      for (const img of newRoomImages) {
        formData.append("images", img.file);
      }
      return updateRoom(editingRoom!.id, formData);
    },
    onSuccess: () => {
      toast.success("Room updated successfully");
      queryClient.invalidateQueries({ queryKey: ["rooms", id] });
      setEditingRoom(null);
      setShowRoomDialog(false);
      resetRoom();
      resetRoomImageState();
    },
    onError: (error: any) =>
      toast.error(error.response?.data?.message || "Failed to update room"),
  });

  const deleteRoomMutation = useMutation({
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

  // ─── Edit Property Mutation ──────────────────────────────
  const updatePropMutation = useMutation({
    mutationFn: (data: EditPropertyValues) => {
      const formData = new FormData();
      formData.append("name", data.name);
      formData.append("description", data.description);
      formData.append("categoryId", data.categoryId);
      formData.append("city", data.city);
      formData.append("address", data.address);
      if (removedPropImageIds.length > 0) {
        formData.append(
          "removedImageIds",
          JSON.stringify(removedPropImageIds),
        );
      }
      for (const img of newPropImages) {
        formData.append("images", img.file);
      }
      return updateProperty(id!, formData);
    },
    onSuccess: () => {
      toast.success("Property updated successfully!");
      queryClient.invalidateQueries({ queryKey: ["tenant-properties"] });
      queryClient.invalidateQueries({ queryKey: ["property", id] });
      closeEditDialog();
    },
    onError: (error: any) =>
      toast.error(
        error.response?.data?.message || "Failed to update property",
      ),
  });

  // ─── Room Dialog Handlers ──────────────────────────────
  const onRoomSubmit: SubmitHandler<RoomFormValues> = (data) => {
    if (editingRoom) {
      updateRoomMutation.mutate(data);
    } else {
      createRoomMutation.mutate(data);
    }
  };

  const openEditRoom = (room: Room) => {
    setEditingRoom(room);
    resetRoom({
      name: room.name,
      description: room.description,
      capacity: room.capacity,
      qty: room.qty || 1,
      basePrice: Number(room.basePrice),
    });
    setExistingRoomImages(
      (room.images || []).map((img) => ({
        id: img.id,
        imageUrl: img.imageUrl,
      })),
    );
    setNewRoomImages([]);
    setRemovedRoomImageIds([]);
    setShowRoomDialog(true);
  };

  const openNewRoom = () => {
    setEditingRoom(null);
    resetRoom({ name: "", description: "", capacity: 1, qty: 1, basePrice: 0 });
    resetRoomImageState();
    setShowRoomDialog(true);
  };

  // Room image handlers
  const activeExistingRoomImages = existingRoomImages.filter(
    (img) => !removedRoomImageIds.includes(img.id),
  );
  const totalRoomImageCount =
    activeExistingRoomImages.length + newRoomImages.length;

  const handleAddRoomImages = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    const available = MAX_ROOM_IMAGES - totalRoomImageCount;
    if (available <= 0) {
      toast.error(`Maximum ${MAX_ROOM_IMAGES} images allowed`);
      e.target.value = "";
      return;
    }
    const filesToAdd = Array.from(files).slice(0, available);
    if (filesToAdd.some((f) => f.size > 2 * 1024 * 1024)) {
      toast.error("Each image must be less than 2MB");
      e.target.value = "";
      return;
    }
    setNewRoomImages((prev) => [
      ...prev,
      ...filesToAdd.map((file) => ({
        file,
        previewUrl: URL.createObjectURL(file),
      })),
    ]);
    e.target.value = "";
  };

  // ─── Edit Property Dialog Handlers ──────────────────────
  const openEditDialog = () => {
    if (!property) return;
    resetProp({
      name: property.name,
      description: property.description,
      categoryId: property.categoryId,
      city: property.city,
      address: property.address,
    });
    setExistingPropImages(
      (property.images || []).map((img: any) => ({
        id: img.id,
        imageUrl: img.imageUrl,
      })),
    );
    setNewPropImages([]);
    setRemovedPropImageIds([]);
    setShowEditDialog(true);
  };

  const closeEditDialog = () => {
    newPropImages.forEach((img) => URL.revokeObjectURL(img.previewUrl));
    setNewPropImages([]);
    setRemovedPropImageIds([]);
    setExistingPropImages([]);
    resetProp();
    setShowEditDialog(false);
  };

  const activePropImages = existingPropImages.filter(
    (img) => !removedPropImageIds.includes(img.id),
  );
  const totalPropImageCount = activePropImages.length + newPropImages.length;
  const markedPropForRemoval = existingPropImages.filter((img) =>
    removedPropImageIds.includes(img.id),
  );

  const handleAddPropImages = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    const available = MAX_IMAGES - totalPropImageCount;
    if (available <= 0) {
      toast.error(`Maximum ${MAX_IMAGES} images allowed`);
      e.target.value = "";
      return;
    }
    const filesToAdd = Array.from(files).slice(0, available);
    if (filesToAdd.some((f) => f.size > 2 * 1024 * 1024)) {
      toast.error("Each image must be less than 2MB");
      e.target.value = "";
      return;
    }
    setNewPropImages((prev) => [
      ...prev,
      ...filesToAdd.map((file) => ({
        file,
        previewUrl: URL.createObjectURL(file),
      })),
    ]);
    e.target.value = "";
  };

  const onEditPropSubmit: SubmitHandler<EditPropertyValues> = (data) => {
    updatePropMutation.mutate(data);
  };

  // ─── Helpers ──────────────────────────────────────────
  const formatCurrency = (val: string | number) =>
    new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(Number(val));

  const markedRoomForRemoval = existingRoomImages.filter((img) =>
    removedRoomImageIds.includes(img.id),
  );

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
          onClick={openEditDialog}
        >
          <Pencil className="h-4 w-4" />
          Edit Property
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
              Manage rooms for this property. Click on a room to manage
              availability and rates.
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
                    {room.images && room.images.length > 0 && (
                      <div className="aspect-video overflow-hidden rounded-t-lg">
                        <img
                          src={room.images[0].imageUrl}
                          alt={room.name}
                          className="object-cover w-full h-full"
                        />
                      </div>
                    )}
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
                        <div className="flex items-center gap-1.5 text-muted-foreground">
                          <DoorOpen className="h-3.5 w-3.5" />
                          <span>{room.qty || 1} units</span>
                        </div>
                        <div className="flex items-center gap-1.5 font-semibold text-emerald-600">
                          <span>{formatCurrency(room.basePrice)}</span>
                        </div>
                      </div>
                      {room.images && room.images.length > 1 && (
                        <p className="text-xs text-muted-foreground">
                          {room.images.length} images
                        </p>
                      )}
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

      {/* ═══════════════════ ROOM CREATE/EDIT DIALOG ═══════════════════ */}
      <Dialog
        open={showRoomDialog}
        onOpenChange={(open) => {
          if (!open) {
            setShowRoomDialog(false);
            setEditingRoom(null);
            resetRoom();
            resetRoomImageState();
          }
        }}
      >
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
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
          <form
            onSubmit={handleSubmitRoom(onRoomSubmit)}
            className="space-y-4"
          >
            <div className="space-y-2">
              <Label htmlFor="room-name">Room Name</Label>
              <Input
                id="room-name"
                placeholder="e.g. Deluxe Suite, Standard Room"
                {...registerRoom("name")}
              />
              {roomErrors.name && (
                <p className="text-xs text-destructive">
                  {roomErrors.name.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="room-description">Description</Label>
              <Textarea
                id="room-description"
                placeholder="Describe the room..."
                {...registerRoom("description")}
              />
              {roomErrors.description && (
                <p className="text-xs text-destructive">
                  {roomErrors.description.message}
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
                  {...registerRoom("capacity")}
                />
                {roomErrors.capacity && (
                  <p className="text-xs text-destructive">
                    {roomErrors.capacity.message}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="room-qty">Total Rooms (Units)</Label>
                <Input
                  id="room-qty"
                  type="number"
                  min={1}
                  {...registerRoom("qty")}
                />
                {roomErrors.qty && (
                  <p className="text-xs text-destructive">
                    {roomErrors.qty.message}
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <div className="space-y-2">
                <Label htmlFor="room-price">Base Price (IDR / Night)</Label>
                <div className="relative">
                  <Input
                    id="room-price"
                    type="number"
                    min={0}
                    className="pl-12"
                    {...registerRoom("basePrice")}
                  />
                  <span className="absolute left-3 top-2.5 text-sm font-semibold text-muted-foreground">
                    Rp
                  </span>
                </div>
                {roomErrors.basePrice && (
                  <p className="text-xs text-destructive">
                    {roomErrors.basePrice.message}
                  </p>
                )}
              </div>
            </div>

            {/* Room Images */}
            <div className="space-y-2">
              <Label className="flex items-center gap-1.5">
                <ImageIcon className="h-4 w-4" />
                Room Images
              </Label>
              <div className="grid grid-cols-3 gap-2">
                {activeExistingRoomImages.map((img) => (
                  <div
                    key={img.id}
                    className="relative group aspect-[4/3] rounded-md border overflow-hidden bg-muted"
                  >
                    <img
                      src={img.imageUrl}
                      alt="Room"
                      className="object-cover w-full h-full"
                    />
                    <button
                      type="button"
                      className="absolute top-1 right-1 h-5 w-5 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center opacity-100 transition-opacity"
                      onClick={() =>
                        setRemovedRoomImageIds((prev) => [...prev, img.id])
                      }
                    >
                      <X className="h-3 w-3" />
                    </button>
                    <div className="absolute bottom-0.5 left-0.5">
                      <Badge
                        variant="secondary"
                        className="text-[9px] px-1 py-0"
                      >
                        Saved
                      </Badge>
                    </div>
                  </div>
                ))}
                {newRoomImages.map((img, index) => (
                  <div
                    key={`new-${index}`}
                    className="relative group aspect-[4/3] rounded-md border-2 border-dashed border-primary/30 overflow-hidden bg-muted"
                  >
                    <img
                      src={img.previewUrl}
                      alt="New upload"
                      className="object-cover w-full h-full"
                    />
                    <button
                      type="button"
                      className="absolute top-1 right-1 h-5 w-5 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center opacity-100 transition-opacity"
                      onClick={() => {
                        setNewRoomImages((prev) => {
                          const updated = [...prev];
                          URL.revokeObjectURL(updated[index].previewUrl);
                          updated.splice(index, 1);
                          return updated;
                        });
                      }}
                    >
                      <X className="h-3 w-3" />
                    </button>
                    <div className="absolute bottom-0.5 left-0.5">
                      <Badge className="text-[9px] px-1 py-0 bg-primary/80">
                        New
                      </Badge>
                    </div>
                  </div>
                ))}
                {totalRoomImageCount < MAX_ROOM_IMAGES && (
                  <button
                    type="button"
                    className="aspect-[4/3] rounded-md border-2 border-dashed border-muted-foreground/25 hover:border-primary/50 hover:bg-muted/50 flex flex-col items-center justify-center gap-1 transition-colors cursor-pointer"
                    onClick={() => roomFileInputRef.current?.click()}
                  >
                    <Plus className="h-5 w-5 text-muted-foreground" />
                    <span className="text-[10px] text-muted-foreground">
                      Add
                    </span>
                  </button>
                )}
              </div>
              {markedRoomForRemoval.length > 0 && (
                <div className="space-y-1">
                  <p className="text-[10px] text-muted-foreground font-medium">
                    Removed (click to restore):
                  </p>
                  <div className="flex gap-1.5 flex-wrap">
                    {markedRoomForRemoval.map((img) => (
                      <button
                        key={img.id}
                        type="button"
                        className="relative h-10 w-14 rounded border overflow-hidden opacity-40 hover:opacity-70 transition-opacity"
                        onClick={() =>
                          setRemovedRoomImageIds((prev) =>
                            prev.filter((rid) => rid !== img.id),
                          )
                        }
                      >
                        <img
                          src={img.imageUrl}
                          alt="Removed"
                          className="object-cover w-full h-full"
                        />
                        <div className="absolute inset-0 bg-destructive/20" />
                      </button>
                    ))}
                  </div>
                </div>
              )}
              <p className="text-[10px] text-muted-foreground">
                {totalRoomImageCount}/{MAX_ROOM_IMAGES} images • JPG, PNG, max
                2MB
              </p>
              <input
                ref={roomFileInputRef}
                type="file"
                multiple
                accept="image/jpeg,image/png,image/webp"
                className="hidden"
                onChange={handleAddRoomImages}
              />
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowRoomDialog(false);
                  setEditingRoom(null);
                  resetRoom();
                  resetRoomImageState();
                }}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={
                  createRoomMutation.isPending || updateRoomMutation.isPending
                }
              >
                {(createRoomMutation.isPending ||
                  updateRoomMutation.isPending) && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                {editingRoom ? "Save Changes" : "Create Room"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* ═══════════════════ DELETE ROOM DIALOG ═══════════════════ */}
      <Dialog
        open={!!deleteTarget}
        onOpenChange={() => setDeleteTarget(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Room</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete{" "}
              <strong>{deleteTarget?.name}</strong>? This will remove all
              availability and peak rate data for this room.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteTarget(null)}
              disabled={deleteRoomMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() =>
                deleteTarget && deleteRoomMutation.mutate(deleteTarget.id)
              }
              disabled={deleteRoomMutation.isPending}
            >
              {deleteRoomMutation.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ═══════════════════ EDIT PROPERTY DIALOG ═══════════════════ */}
      <Dialog
        open={showEditDialog}
        onOpenChange={(open) => {
          if (!open) closeEditDialog();
        }}
      >
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Pencil className="h-5 w-5" />
              Edit Property
            </DialogTitle>
            <DialogDescription>
              Update your property details.
            </DialogDescription>
          </DialogHeader>
          <form
            onSubmit={handleSubmitProp(onEditPropSubmit)}
            className="space-y-5"
          >
            {/* Name */}
            <div className="space-y-2">
              <Label htmlFor="edit-name">Property Name</Label>
              <Input id="edit-name" {...registerProp("name")} />
              {propErrors.name && (
                <p className="text-xs text-destructive">
                  {propErrors.name.message}
                </p>
              )}
            </div>

            {/* Category */}
            <div className="space-y-2">
              <Label htmlFor="edit-category">Category</Label>
              <Select
                value={watchProp("categoryId")}
                onValueChange={(val) =>
                  setValueProp("categoryId", val, { shouldValidate: true })
                }
                key={watchProp("categoryId")}
              >
                <input type="hidden" {...registerProp("categoryId")} />
                <SelectTrigger id="edit-category">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categoriesToRender.map((cat: any) => (
                    <SelectItem key={cat.id} value={cat.id}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {propErrors.categoryId && (
                <p className="text-xs text-destructive">
                  {propErrors.categoryId.message}
                </p>
              )}
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="edit-description">Description</Label>
              <Textarea
                id="edit-description"
                className="min-h-[100px]"
                {...registerProp("description")}
              />
              {propErrors.description && (
                <p className="text-xs text-destructive">
                  {propErrors.description.message}
                </p>
              )}
            </div>

            {/* Location */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-city">City</Label>
                <div className="relative">
                  <Input
                    id="edit-city"
                    className="pl-10"
                    {...registerProp("city")}
                  />
                  <MapPin className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                </div>
                {propErrors.city && (
                  <p className="text-xs text-destructive">
                    {propErrors.city.message}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-address">Full Address</Label>
                <div className="relative">
                  <Input
                    id="edit-address"
                    className="pl-10"
                    {...registerProp("address")}
                  />
                  <Building2 className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                </div>
                {propErrors.address && (
                  <p className="text-xs text-destructive">
                    {propErrors.address.message}
                  </p>
                )}
              </div>
            </div>

            {/* Images */}
            <div className="space-y-2">
              <Label className="flex items-center gap-1.5">
                <ImageIcon className="h-4 w-4" />
                Property Images
              </Label>
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                {activePropImages.map((img) => (
                  <div
                    key={img.id}
                    className="relative group aspect-4/3 rounded-md border overflow-hidden bg-muted"
                  >
                    <img
                      src={img.imageUrl}
                      alt="Property"
                      className="object-cover w-full h-full"
                    />
                    <button
                      type="button"
                      className="absolute top-1 right-1 h-5 w-5 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center opacity-100 transition-opacity"
                      onClick={() =>
                        setRemovedPropImageIds((prev) => [...prev, img.id])
                      }
                    >
                      <X className="h-3 w-3" />
                    </button>
                    <div className="absolute bottom-0.5 left-0.5">
                      <Badge
                        variant="secondary"
                        className="text-[9px] px-1 py-0"
                      >
                        Saved
                      </Badge>
                    </div>
                  </div>
                ))}
                {newPropImages.map((img, index) => (
                  <div
                    key={`new-${index}`}
                    className="relative group aspect-4/3 rounded-md border-2 border-dashed border-primary/30 overflow-hidden bg-muted"
                  >
                    <img
                      src={img.previewUrl}
                      alt="New upload"
                      className="object-cover w-full h-full"
                    />
                    <button
                      type="button"
                      className="absolute top-1 right-1 h-5 w-5 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center opacity-100 transition-opacity"
                      onClick={() => {
                        setNewPropImages((prev) => {
                          const updated = [...prev];
                          URL.revokeObjectURL(updated[index].previewUrl);
                          updated.splice(index, 1);
                          return updated;
                        });
                      }}
                    >
                      <X className="h-3 w-3" />
                    </button>
                    <div className="absolute bottom-0.5 left-0.5">
                      <Badge className="text-[9px] px-1 py-0 bg-primary/80">
                        New
                      </Badge>
                    </div>
                  </div>
                ))}
                {totalPropImageCount < MAX_IMAGES && (
                  <button
                    type="button"
                    className="aspect-4/3 rounded-md border-2 border-dashed border-muted-foreground/25 hover:border-primary/50 hover:bg-muted/50 flex flex-col items-center justify-center gap-1 transition-colors cursor-pointer"
                    onClick={() => propFileInputRef.current?.click()}
                  >
                    <Plus className="h-5 w-5 text-muted-foreground" />
                    <span className="text-[10px] text-muted-foreground">
                      Add
                    </span>
                  </button>
                )}
              </div>
              {markedPropForRemoval.length > 0 && (
                <div className="space-y-1">
                  <p className="text-[10px] text-muted-foreground font-medium">
                    Removed (click to restore):
                  </p>
                  <div className="flex gap-1.5 flex-wrap">
                    {markedPropForRemoval.map((img) => (
                      <button
                        key={img.id}
                        type="button"
                        className="relative h-10 w-14 rounded border overflow-hidden opacity-40 hover:opacity-70 transition-opacity"
                        onClick={() =>
                          setRemovedPropImageIds((prev) =>
                            prev.filter((rid) => rid !== img.id),
                          )
                        }
                      >
                        <img
                          src={img.imageUrl}
                          alt="Removed"
                          className="object-cover w-full h-full"
                        />
                        <div className="absolute inset-0 bg-destructive/20" />
                      </button>
                    ))}
                  </div>
                </div>
              )}
              <p className="text-[10px] text-muted-foreground">
                {totalPropImageCount}/{MAX_IMAGES} images • JPG, PNG, max 2MB
              </p>
              <input
                ref={propFileInputRef}
                type="file"
                multiple
                accept="image/jpeg,image/png,image/webp"
                className="hidden"
                onChange={handleAddPropImages}
              />
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={closeEditDialog}
                disabled={updatePropMutation.isPending}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={updatePropMutation.isPending}
              >
                {updatePropMutation.isPending && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Save Changes
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
