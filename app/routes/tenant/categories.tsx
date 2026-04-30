import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useDebounce } from "~/hooks/use-debounce";

import { motion, AnimatePresence } from "framer-motion";
import {
  FolderOpen,
  Plus,
  Pencil,
  Trash2,
  Loader2,
  Search,
  Building2,
  AlertCircle,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { Skeleton } from "~/components/ui/skeleton";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";

import {
  fetchTenantCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  type Category,
} from "~/lib/tenant-api";
import { fetchCategories } from "~/lib/property.api";
import { useAuthStore } from "~/modules/auth/auth.store";

export default function CategoriesPage() {
  const { user } = useAuthStore();
  const queryClient = useQueryClient();

  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 500);

  const [showDialog, setShowDialog] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Category | null>(null);
  const [name, setName] = useState("");
  const [categoryId, setCategoryId] = useState("");

  // Fetch master categories
  const { data: masterCategories = [] } = useQuery({
    queryKey: ["master-categories"],
    queryFn: fetchCategories,
  });

  // Fetch categories
  const {
    data: categoriesData,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["tenant-categories", user?.id, debouncedSearch],
    queryFn: () =>
      fetchTenantCategories({
        tenantId: user?.id,
        search: debouncedSearch || undefined,
      }),
    enabled: !!user?.id,
  });

  const categories = categoriesData?.data ?? [];

  // Check for duplicate category names (case-insensitive)
  const isDuplicate = useMemo(() => {
    if (!name.trim()) return false;
    const trimmedInput = name.trim().toLowerCase();
    return categories.some(
      (c) =>
        c.id !== editingCategory?.id &&
        c.name.toLowerCase() === trimmedInput
    );
  }, [name, categories, editingCategory]);

  // Create mutation
  const createMutation = useMutation({
    mutationFn: () => createCategory({ name, categoryId }),
    onSuccess: () => {
      toast.success("Category created successfully");
      queryClient.invalidateQueries({ queryKey: ["tenant-categories"] });
      setShowDialog(false);
      setName("");
    },
    onError: (error: any) =>
      toast.error(
        error.response?.data?.message || "Failed to create category",
      ),
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: () => updateCategory(editingCategory!.id, { name, categoryId }),
    onSuccess: () => {
      toast.success("Category updated successfully");
      queryClient.invalidateQueries({ queryKey: ["tenant-categories"] });
      setShowDialog(false);
      setEditingCategory(null);
      setName("");
    },
    onError: (error: any) =>
      toast.error(
        error.response?.data?.message || "Failed to update category",
      ),
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteCategory(id),
    onSuccess: () => {
      toast.success("Category deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["tenant-categories"] });
      setDeleteTarget(null);
    },
    onError: (error: any) =>
      toast.error(
        error.response?.data?.message || "Failed to delete category",
      ),
  });

  const openNew = () => {
    setEditingCategory(null);
    setName("");
    setCategoryId("");
    setShowDialog(true);
  };

  const openEdit = (category: Category) => {
    setEditingCategory(category);
    setName(category.name);
    setCategoryId(category.categoryId || "");
    setShowDialog(true);
  };

  const handleSave = () => {
    if (!name.trim()) {
      toast.error("Category name is required");
      return;
    }
    if (!categoryId) {
      toast.error("Master category is required");
      return;
    }
    if (isDuplicate) {
      toast.error("Category name already exists");
      return;
    }
    if (editingCategory) {
      updateMutation.mutate();
    } else {
      createMutation.mutate();
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Property Categories
          </h1>
          <p className="text-muted-foreground mt-1">
            Organize your properties into categories.
          </p>
        </div>
        <Button className="gap-2" onClick={openNew}>
          <Plus className="h-4 w-4" />
          Add Category
        </Button>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search categories..."
          className="pl-10"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Content */}
      {isLoading ? (
        <Card>
          <CardContent className="py-6 space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </CardContent>
        </Card>
      ) : isError ? (
        <Card>
          <CardContent className="py-16">
            <div className="flex flex-col items-center text-center">
              <AlertCircle className="h-12 w-12 text-destructive/50 mb-4" />
              <h3 className="font-semibold">Failed to load categories</h3>
            </div>
          </CardContent>
        </Card>
      ) : categories.length === 0 ? (
        <Card>
          <CardContent className="py-16">
            <div className="flex flex-col items-center text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 mb-4">
                <FolderOpen className="h-8 w-8 text-primary/60" />
              </div>
              <h3 className="text-lg font-semibold mb-1">
                {search ? "No matching categories" : "No Categories Yet"}
              </h3>
              <p className="text-muted-foreground text-sm max-w-sm">
                {search
                  ? "Try a different search term."
                  : "Create categories to organize your properties (e.g. Hotel, Villa, Apartment)."}
              </p>
              {!search && (
                <Button className="mt-6 gap-2" onClick={openNew}>
                  <Plus className="h-4 w-4" />
                  Create First Category
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Properties</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <AnimatePresence mode="popLayout">
                  {categories.map((cat, i) => (
                    <motion.tr
                      key={cat.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ delay: i * 0.03 }}
                      className="border-b last:border-0"
                    >
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
                            <FolderOpen className="h-4 w-4 text-primary" />
                          </div>
                          <div className="flex flex-col">
                            <span className="font-medium">{cat.name}</span>
                            <span className="text-xs text-muted-foreground">
                              Linked to: {cat.category?.name || "Unknown"}
                            </span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="text-xs">
                          {cat._count.properties} properties
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {new Date(cat.createdAt).toLocaleDateString("id-ID")}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => openEdit(cat)}
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive hover:text-destructive"
                            onClick={() => setDeleteTarget(cat)}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </TableCell>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Create/Edit Dialog */}
      <Dialog
        open={showDialog}
        onOpenChange={(open) => {
          if (!open) {
            setShowDialog(false);
            setEditingCategory(null);
            setName("");
          }
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingCategory ? "Edit Category" : "New Category"}
            </DialogTitle>
            <DialogDescription>
              {editingCategory
                ? "Update the category name."
                : "Give your category a descriptive name."}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="cat-name">Category Name</Label>
              <Input
                id="cat-name"
                placeholder="e.g. Hotel, Villa, Apartment"
                value={name}
                onChange={(e) => {
                  const val = e.target.value;
                  if (val) {
                    setName(val.charAt(0).toUpperCase() + val.slice(1).toLowerCase());
                  } else {
                    setName(val);
                  }
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !isDuplicate) {
                    e.preventDefault();
                    handleSave();
                  }
                }}
              />
              {isDuplicate && (
                <p className="text-xs font-medium text-destructive flex items-center gap-1.5 mt-1">
                  <AlertCircle className="h-3.5 w-3.5" />
                  Category name already used
                </p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="master-category">Master Category</Label>
              <Select value={categoryId} onValueChange={setCategoryId}>
                <SelectTrigger id="master-category">
                  <SelectValue placeholder="Select master category" />
                </SelectTrigger>
                <SelectContent>
                  {masterCategories.map((master) => (
                    <SelectItem key={master.id} value={master.id}>
                      {master.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Link this category to a global master category for search visibility.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowDialog(false);
                setEditingCategory(null);
                setName("");
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={
                createMutation.isPending || updateMutation.isPending || isDuplicate || !name.trim() || !categoryId
              }
            >
              {(createMutation.isPending || updateMutation.isPending) && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              {editingCategory ? "Save" : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog
        open={!!deleteTarget}
        onOpenChange={() => setDeleteTarget(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Category</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete{" "}
              <strong>{deleteTarget?.name}</strong>?
              {deleteTarget?._count?.properties
                ? ` This category has ${deleteTarget._count.properties} properties. You must remove or reassign them first.`
                : " This action cannot be undone."}
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
