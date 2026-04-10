import { useState, useEffect } from "react";
import { useForm, type SubmitHandler, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useNavigate, useParams } from "react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Info, MapPin, Loader2, Building2, Upload } from "lucide-react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { Textarea } from "~/components/ui/textarea";
import { Badge } from "~/components/ui/badge";
import { Skeleton } from "~/components/ui/skeleton";

import {
  updateProperty,
  fetchPropertyById,
  fetchTenantCategories,
} from "~/lib/tenant-api";
import { useAuthStore } from "~/modules/auth/auth.store";

const editPropertySchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters"),
  description: z.string().min(20, "Description must be at least 20 characters"),
  categoryId: z.string().min(1, "Category is required"),
  city: z.string().min(1, "City is required"),
  address: z.string().min(5, "Address must be at least 5 characters"),
});

type EditPropertyValues = z.infer<typeof editPropertySchema>;

export default function PropertyEditPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
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

  // Fetch current property data
  const { data: property, isLoading: isLoadingProperty } = useQuery({
    queryKey: ["property", id],
    queryFn: () => fetchPropertyById(id!),
    enabled: !!id,
  });

  // Fetch categories
  const { data: categoriesData, isLoading: isLoadingCategories } = useQuery({
    queryKey: ["tenant-categories", user?.id],
    queryFn: async () => {
      const result = await fetchTenantCategories({ tenantId: user?.id });
      console.log("fetchTenantCategories result:", result); // tambah ini
      return result;
    },
    enabled: !!user?.id,
  });

  const categories = categoriesData?.data ?? [];

  // Ensure the current property category is in the list
  const categoriesToRender = [...categories];
  if (
    property?.category &&
    !categoriesToRender.find((c) => c.id === property.category.id)
  ) {
    categoriesToRender.push(property.category as any);
  }

  console.log("=== DEBUG CATEGORIES ===");
  console.log("categoriesData raw:", categoriesData);
  console.log("categories array:", categories);
  console.log("user?.id:", user?.id);
  console.log("property?.categoryId:", property?.categoryId);
  console.log("property?.category:", property?.category);
  console.log("categoriesToRender:", categoriesToRender);
  console.log("========================");

  // Populate form when data loads
  useEffect(() => {
    if (property?.categoryId && categoriesToRender.length > 0) {
      reset({
        name: property.name,
        description: property.description,
        categoryId: property.categoryId,
        city: property.city,
        address: property.address,
      });
      if (property.images && property.images.length > 0) {
        setImagePreview(property.images[0].imageUrl);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [property?.categoryId, categoriesToRender.length]);

  const onSubmit: SubmitHandler<EditPropertyValues> = async (data) => {
    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("name", data.name);
      formData.append("description", data.description);
      formData.append("categoryId", data.categoryId);
      formData.append("city", data.city);
      formData.append("address", data.address);

      if (imageFile) {
        formData.append("image", imageFile);
      }

      await updateProperty(id!, formData);
      queryClient.invalidateQueries({ queryKey: ["tenant-properties"] });
      queryClient.invalidateQueries({ queryKey: ["property", id] });
      toast.success("Property updated successfully!");
      navigate("/tenant/dashboard/properties");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to update property");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoadingProperty || isLoadingCategories) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-4 w-48" />
        <Card>
          <CardContent className="space-y-4 py-8">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-32 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-20">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Badge variant="outline">Tenant Dashboard</Badge>
        <span>/</span>
        <span>Properties</span>
        <span>/</span>
        <span className="text-foreground">Edit</span>
      </div>

      <div>
        <h1 className="text-3xl font-bold tracking-tight">Edit Property</h1>
        <p className="text-muted-foreground">Update your property details.</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit as any)} className="space-y-8">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Info className="h-5 w-5 text-primary" />
              <CardTitle>Basic Information</CardTitle>
            </div>
            <CardDescription>
              Update your property name and description.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Property Name</Label>
              <Input id="name" {...register("name")} />
              {errors.name && (
                <p className="text-xs text-destructive">
                  {errors.name.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="categoryId">Category</Label>
              <Select
                value={watch("categoryId")}
                onValueChange={(val) =>
                  setValue("categoryId", val, { shouldValidate: true })
                }
                key={watch("categoryId")}
              >
                <input type="hidden" {...register("categoryId")} />
                <SelectTrigger>
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
              {errors.categoryId && (
                <p className="text-xs text-destructive">
                  {errors.categoryId.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                className="min-h-[150px]"
                {...register("description")}
              />
              {errors.description && (
                <p className="text-xs text-destructive">
                  {errors.description.message}
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Location */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-primary" />
              <CardTitle>Location</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="city">City</Label>
                <div className="relative">
                  <Input id="city" className="pl-10" {...register("city")} />
                  <MapPin className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                </div>
                {errors.city && (
                  <p className="text-xs text-destructive">
                    {errors.city.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">Full Address</Label>
                <div className="relative">
                  <Input
                    id="address"
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
          </CardContent>
        </Card>

        {/* Media */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Upload className="h-5 w-5 text-primary" />
              <CardTitle>Property Image</CardTitle>
            </div>
            <CardDescription>
              Update your property image. Allowed formats: JPG, PNG.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                {imagePreview ? (
                  <div className="relative h-40 w-full max-w-sm rounded-lg border overflow-hidden">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="object-cover w-full h-full"
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      className="absolute top-2 right-2"
                      onClick={() => {
                        setImageFile(null);
                        setImagePreview(null);
                      }}
                    >
                      Remove
                    </Button>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center w-full max-w-sm h-40 border-2 border-dashed rounded-lg bg-muted/50">
                    <Upload className="h-8 w-8 text-muted-foreground mb-2" />
                    <p className="text-sm text-muted-foreground text-center px-4">
                      No image currently selected. Choose a new one below.
                    </p>
                  </div>
                )}
              </div>
              <Input
                id="image"
                type="file"
                accept="image/jpeg, image/png, image/webp"
                className="max-w-sm"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    if (file.size > 2 * 1024 * 1024) {
                      toast.error("Image must be less than 2MB");
                      e.target.value = "";
                      return;
                    }
                    setImageFile(file);
                    setImagePreview(URL.createObjectURL(file));
                  }
                }}
              />
            </div>
          </CardContent>
        </Card>

        {/* Submit */}
        <div className="flex items-center justify-end gap-4 pt-4">
          <Button
            type="button"
            variant="ghost"
            size="lg"
            onClick={() => navigate("/tenant/dashboard/properties")}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            size="lg"
            className="px-8"
            disabled={isSubmitting}
          >
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save Changes
          </Button>
        </div>
      </form>
    </div>
  );
}
