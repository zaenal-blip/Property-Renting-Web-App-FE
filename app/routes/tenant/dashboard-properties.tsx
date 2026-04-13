import { useState, useRef } from "react";
import { Link } from "react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm, type SubmitHandler, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { motion, AnimatePresence } from "framer-motion";
import {
  Building2,
  Plus,
  Search,
  MoreHorizontal,
  Pencil,
  Trash2,
  Eye,
  MapPin,
  DoorOpen,
  Star,
  Loader2,
  AlertCircle,
  SlidersHorizontal,
  X,
  ImageIcon,
  Upload,
  Info,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Textarea } from "~/components/ui/textarea";
import { Card, CardContent } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { Skeleton } from "~/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";

import {
  fetchTenantProperties,
  fetchTenantCategories,
  createProperty,
  deleteProperty,
  type TenantProperty,
} from "~/lib/tenant-api";
import { useAuthStore } from "~/modules/auth/auth.store";

// ─── Schema ──────────────────────────────────────────
const createPropertySchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters"),
  description: z
    .string()
    .min(20, "Description must be at least 20 characters"),
  categoryId: z.string().min(1, "Category is required"),
  city: z.string().min(1, "City is required"),
  address: z.string().min(5, "Address must be at least 5 characters"),
});

type CreatePropertyValues = z.infer<typeof createPropertySchema>;

interface ImageEntry {
  file: File;
  previewUrl: string;
}

const MAX_IMAGES = 5;

export default function DashboardPropertiesPage() {
  const { user } = useAuthStore();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [page, setPage] = useState(1);
  const [deleteTarget, setDeleteTarget] = useState<TenantProperty | null>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [imageFiles, setImageFiles] = useState<ImageEntry[]>([]);
  const take = 9;

  // ─── Form ──────────────────────────────────────────
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<CreatePropertyValues>({
    resolver: zodResolver(
      createPropertySchema,
    ) as Resolver<CreatePropertyValues>,
    defaultValues: {
      name: "",
      description: "",
      categoryId: "",
      city: "",
      address: "",
    },
  });

  // ─── Queries ──────────────────────────────────────────
  const { data: categoriesData } = useQuery({
    queryKey: ["tenant-categories", user?.id],
    queryFn: () => fetchTenantCategories({ tenantId: user?.id }),
    enabled: !!user?.id,
  });

  const {
    data: propertiesData,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["tenant-properties", search, categoryFilter, page],
    queryFn: () =>
      fetchTenantProperties({
        search: search || undefined,
        categoryId: categoryFilter === "all" ? undefined : categoryFilter,
        page,
        take,
      }),
    enabled: !!user?.id,
  });

  const properties = propertiesData?.data ?? [];
  const meta = propertiesData?.meta;
  const categories = categoriesData?.data ?? [];

  // ─── Mutations ──────────────────────────────────────────
  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteProperty(id),
    onSuccess: () => {
      toast.success("Property deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["tenant-properties"] });
      setDeleteTarget(null);
    },
    onError: (error: any) => {
      toast.error(
        error.response?.data?.message || "Failed to delete property",
      );
    },
  });

  const createMutation = useMutation({
    mutationFn: (data: CreatePropertyValues) => {
      const formData = new FormData();
      formData.append("name", data.name);
      formData.append("description", data.description);
      formData.append("categoryId", data.categoryId);
      formData.append("city", data.city);
      formData.append("address", data.address);

      for (const img of imageFiles) {
        formData.append("images", img.file);
      }

      return createProperty(formData);
    },
    onSuccess: () => {
      toast.success("Property created successfully!");
      queryClient.invalidateQueries({ queryKey: ["tenant-properties"] });
      closeCreateDialog();
    },
    onError: (error: any) => {
      toast.error(
        error.response?.data?.message || "Failed to create property",
      );
    },
  });

  // ─── Image Handlers ──────────────────────────────────────────
  const handleAddImages = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const available = MAX_IMAGES - imageFiles.length;
    if (available <= 0) {
      toast.error(`Maximum ${MAX_IMAGES} images allowed`);
      e.target.value = "";
      return;
    }

    const filesToAdd = Array.from(files).slice(0, available);
    const oversized = filesToAdd.filter((f) => f.size > 2 * 1024 * 1024);
    if (oversized.length > 0) {
      toast.error("Each image must be less than 2MB");
      e.target.value = "";
      return;
    }

    const newEntries: ImageEntry[] = filesToAdd.map((file) => ({
      file,
      previewUrl: URL.createObjectURL(file),
    }));

    setImageFiles((prev) => [...prev, ...newEntries]);
    e.target.value = "";
  };

  const handleRemoveImage = (index: number) => {
    setImageFiles((prev) => {
      const updated = [...prev];
      URL.revokeObjectURL(updated[index].previewUrl);
      updated.splice(index, 1);
      return updated;
    });
  };

  const openCreateDialog = () => {
    reset({
      name: "",
      description: "",
      categoryId: "",
      city: "",
      address: "",
    });
    setImageFiles([]);
    setShowCreateDialog(true);
  };

  const closeCreateDialog = () => {
    imageFiles.forEach((img) => URL.revokeObjectURL(img.previewUrl));
    setImageFiles([]);
    reset();
    setShowCreateDialog(false);
  };

  const onCreateSubmit: SubmitHandler<CreatePropertyValues> = (data) => {
    createMutation.mutate(data);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">My Properties</h1>
          <p className="text-muted-foreground mt-1">
            Manage your listed properties and rooms.
          </p>
        </div>
        <Button className="gap-2" onClick={openCreateDialog}>
          <Plus className="h-4 w-4" />
          Add Property
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search properties..."
            className="pl-10"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
          />
        </div>
        <Select
          value={categoryFilter}
          onValueChange={(val) => {
            setCategoryFilter(val);
            setPage(1);
          }}
        >
          <SelectTrigger className="w-48">
            <SlidersHorizontal className="h-4 w-4 mr-2" />
            <SelectValue placeholder="All Categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {categories.map((cat) => (
              <SelectItem key={cat.id} value={cat.id}>
                {cat.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-0">
                <Skeleton className="h-40 rounded-t-lg" />
                <div className="p-4 space-y-3">
                  <Skeleton className="h-5 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                  <Skeleton className="h-4 w-full" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : isError ? (
        <Card>
          <CardContent className="py-16">
            <div className="flex flex-col items-center justify-center text-center">
              <AlertCircle className="h-12 w-12 text-destructive/50 mb-4" />
              <h3 className="text-lg font-semibold mb-1">
                Failed to load properties
              </h3>
              <p className="text-muted-foreground text-sm">
                Please try again later.
              </p>
            </div>
          </CardContent>
        </Card>
      ) : properties.length === 0 ? (
        <Card>
          <CardContent className="py-16">
            <div className="flex flex-col items-center justify-center text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 mb-4">
                <Building2 className="h-8 w-8 text-primary/60" />
              </div>
              <h3 className="text-lg font-semibold mb-1">
                {search || categoryFilter !== "all"
                  ? "No properties match your filters"
                  : "No Properties Yet"}
              </h3>
              <p className="text-muted-foreground text-sm max-w-sm">
                {search || categoryFilter !== "all"
                  ? "Try adjusting your search or filter criteria."
                  : "Start listing your properties on Rentivo. Add your first property to begin receiving bookings."}
              </p>
              {!search && categoryFilter === "all" && (
                <Button
                  className="mt-6 gap-2"
                  onClick={openCreateDialog}
                >
                  <Plus className="h-4 w-4" />
                  Add Your First Property
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <AnimatePresence mode="popLayout">
              {properties.map((property, i) => (
                <motion.div
                  key={property.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <PropertyCard
                    property={property}
                    onDelete={() => setDeleteTarget(property)}
                  />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* Pagination */}
          {meta && meta.totalPages > 1 && (
            <div className="flex items-center justify-between pt-4">
              <p className="text-sm text-muted-foreground">
                Showing {(page - 1) * take + 1}–
                {Math.min(page * take, meta.total)} of {meta.total}
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => p - 1)}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page >= meta.totalPages}
                  onClick={() => setPage((p) => p + 1)}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </>
      )}

      {/* ─── Create Property Dialog ─── */}
      <Dialog
        open={showCreateDialog}
        onOpenChange={(open) => {
          if (!open) closeCreateDialog();
        }}
      >
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Create New Property
            </DialogTitle>
            <DialogDescription>
              Fill in the details to list your property on Rentivo.
            </DialogDescription>
          </DialogHeader>
          <form
            onSubmit={handleSubmit(onCreateSubmit)}
            className="space-y-5"
          >
            {/* Name */}
            <div className="space-y-2">
              <Label htmlFor="create-name">Property Name</Label>
              <Input
                id="create-name"
                placeholder="e.g. Sunset Beach Villa"
                {...register("name")}
              />
              {errors.name && (
                <p className="text-xs text-destructive">
                  {errors.name.message}
                </p>
              )}
            </div>

            {/* Category */}
            <div className="space-y-2">
              <Label htmlFor="create-category">Category</Label>
              <Select
                value={watch("categoryId")}
                onValueChange={(val) =>
                  setValue("categoryId", val, { shouldValidate: true })
                }
              >
                <input type="hidden" {...register("categoryId")} />
                <SelectTrigger id="create-category">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.length === 0 ? (
                    <div className="px-3 py-6 text-center text-sm text-muted-foreground">
                      No categories yet. Create one in{" "}
                      <a
                        href="/tenant/dashboard/categories"
                        className="text-primary underline"
                      >
                        Categories
                      </a>
                      .
                    </div>
                  ) : (
                    categories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>
                        {cat.name}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
              {errors.categoryId && (
                <p className="text-xs text-destructive">
                  {errors.categoryId.message}
                </p>
              )}
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="create-description">Description</Label>
              <Textarea
                id="create-description"
                placeholder="Describe your property in detail..."
                className="min-h-[100px]"
                {...register("description")}
              />
              {errors.description && (
                <p className="text-xs text-destructive">
                  {errors.description.message}
                </p>
              )}
            </div>

            {/* Location */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="create-city">City</Label>
                <div className="relative">
                  <Input
                    id="create-city"
                    placeholder="e.g. Bali, Jakarta"
                    className="pl-10"
                    {...register("city")}
                  />
                  <MapPin className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                </div>
                {errors.city && (
                  <p className="text-xs text-destructive">
                    {errors.city.message}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="create-address">Full Address</Label>
                <div className="relative">
                  <Input
                    id="create-address"
                    placeholder="e.g. Jl. Pantai Kuta No. 1"
                    className="pl-10"
                    {...register("address")}
                  />
                  <Building2 className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                </div>
                {errors.address && (
                  <p className="text-xs text-destructive">
                    {errors.address.message}
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
                {imageFiles.map((img, index) => (
                  <div
                    key={index}
                    className="relative group aspect-4/3 rounded-md border-2 border-dashed border-primary/30 overflow-hidden bg-muted"
                  >
                    <img
                      src={img.previewUrl}
                      alt={`Upload ${index + 1}`}
                      className="object-cover w-full h-full"
                    />
                    <button
                      type="button"
                      className="absolute top-1 right-1 h-5 w-5 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center opacity-100 transition-opacity"
                      onClick={() => handleRemoveImage(index)}
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
                {imageFiles.length < MAX_IMAGES && (
                  <button
                    type="button"
                    className="aspect-4/3 rounded-md border-2 border-dashed border-muted-foreground/25 hover:border-primary/50 hover:bg-muted/50 flex flex-col items-center justify-center gap-1 transition-colors cursor-pointer"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Plus className="h-5 w-5 text-muted-foreground" />
                    <span className="text-[10px] text-muted-foreground">
                      Add
                    </span>
                  </button>
                )}
              </div>
              <p className="text-[10px] text-muted-foreground">
                {imageFiles.length}/{MAX_IMAGES} images • JPG, PNG, max 2MB
              </p>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/jpeg,image/png,image/webp"
                className="hidden"
                onChange={handleAddImages}
              />
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={closeCreateDialog}
                disabled={createMutation.isPending}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={createMutation.isPending}>
                {createMutation.isPending && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Create Property
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* ─── Delete Confirmation Dialog ─── */}
      <Dialog
        open={!!deleteTarget}
        onOpenChange={() => setDeleteTarget(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Property</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete{" "}
              <strong>{deleteTarget?.name}</strong>? This action cannot be
              undone. All rooms, availability, and peak rates will be removed.
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

// ─── Property Card ──────────────────────────────────────────
function PropertyCard({
  property,
  onDelete,
}: {
  property: TenantProperty;
  onDelete: () => void;
}) {
  const mainImage = property.images?.[0]?.imageUrl;

  return (
    <Card className="overflow-hidden group hover:shadow-lg transition-all duration-300 border-border/50">
      <CardContent className="p-0">
        {/* Image */}
        <div className="relative h-40 bg-muted overflow-hidden">
          {mainImage ? (
            <img
              src={mainImage}
              alt={property.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Building2 className="h-12 w-12 text-muted-foreground/30" />
            </div>
          )}
          <Badge className="absolute top-3 left-3 bg-background/90 text-foreground backdrop-blur-sm text-xs">
            {property.category?.name || "Uncategorized"}
          </Badge>
          {/* Actions dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-2 right-2 h-8 w-8 bg-background/80 backdrop-blur-sm hover:bg-background opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem asChild>
                <Link
                  to={`/tenant/dashboard/properties/${property.id}`}
                  className="gap-2"
                >
                  <Eye className="h-4 w-4" />
                  View Details
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={onDelete}
                className="text-destructive focus:text-destructive gap-2"
              >
                <Trash2 className="h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Info */}
        <div className="p-4 space-y-2">
          <h3 className="font-semibold text-base truncate">{property.name}</h3>
          <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <MapPin className="h-3.5 w-3.5 shrink-0" />
            <span className="truncate">
              {property.city}
            </span>
          </div>

          <div className="flex items-center gap-4 text-xs text-muted-foreground pt-1">
            <div className="flex items-center gap-1">
              <DoorOpen className="h-3.5 w-3.5" />
              <span>{property._count.rooms} rooms</span>
            </div>
            <div className="flex items-center gap-1">
              <Star className="h-3.5 w-3.5" />
              <span>{property._count.reviews} reviews</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
