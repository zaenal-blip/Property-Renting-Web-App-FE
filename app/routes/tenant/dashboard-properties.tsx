import { useState } from "react";
import { Link } from "react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
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
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
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
  deleteProperty,
  type TenantProperty,
} from "~/lib/tenant-api";
import { useAuthStore } from "~/modules/auth/auth.store";

export default function DashboardPropertiesPage() {
  const { user } = useAuthStore();
  const queryClient = useQueryClient();

  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [page, setPage] = useState(1);
  const [deleteTarget, setDeleteTarget] = useState<TenantProperty | null>(null);
  const take = 9;

  // Fetch categories for filter
  const { data: categoriesData } = useQuery({
    queryKey: ["tenant-categories", user?.id],
    queryFn: () => fetchTenantCategories({ tenantId: user?.id }),
    enabled: !!user?.id,
  });

  // Fetch properties
  const {
    data: propertiesData,
    isLoading,
    isError,
  } = useQuery({
    queryKey: [
      "tenant-properties",
      search,
      categoryFilter,
      page,
    ],
    queryFn: () =>
      fetchTenantProperties({
        search: search || undefined,
        categoryId: categoryFilter === "all" ? undefined : categoryFilter,
        page,
        take,
      }),
    enabled: !!user?.id,
  });

  // Delete mutation
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

  const properties = propertiesData?.data ?? [];
  const meta = propertiesData?.meta;
  const categories = categoriesData?.data ?? [];

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
        <Button asChild className="gap-2">
          <Link to="/tenant/dashboard/properties/new">
            <Plus className="h-4 w-4" />
            Add Property
          </Link>
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
                <Button asChild className="mt-6 gap-2">
                  <Link to="/tenant/dashboard/properties/new">
                    <Plus className="h-4 w-4" />
                    Add Your First Property
                  </Link>
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

      {/* Delete Confirmation Dialog */}
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
              <DropdownMenuItem asChild>
                <Link
                  to={`/tenant/dashboard/properties/${property.id}/edit`}
                  className="gap-2"
                >
                  <Pencil className="h-4 w-4" />
                  Edit
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
