import { useState } from "react";
import { useForm, type SubmitHandler, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useNavigate } from "react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Info,
  MapPin,
  Upload,
  Loader2,
  CheckCircle2,
  Building2,
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { Textarea } from "~/components/ui/textarea";
import { Badge } from "~/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";

import {
  createProperty,
  fetchTenantCategories,
} from "~/lib/tenant-api";
import { useAuthStore } from "~/modules/auth/auth.store";

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

export default function PropertyNewPage() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const queryClient = useQueryClient();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [tempFormData, setTempFormData] =
    useState<CreatePropertyValues | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<CreatePropertyValues>({
    resolver: zodResolver(createPropertySchema) as Resolver<CreatePropertyValues>,
    defaultValues: {
      name: "",
      description: "",
      categoryId: "",
      city: "",
      address: "",
    },
  });

  // Fetch categories for dropdown
  const { data: categoriesData } = useQuery({
    queryKey: ["tenant-categories", user?.id],
    queryFn: () => fetchTenantCategories({ tenantId: user?.id }),
    enabled: !!user?.id,
  });

  const categories = categoriesData?.data ?? [];

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        toast.error("Image size must be less than 2MB");
        return;
      }
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const onSubmit: SubmitHandler<CreatePropertyValues> = (data) => {
    setTempFormData(data);
    setShowConfirmDialog(true);
  };

  const handleConfirmSubmit = async () => {
    if (!tempFormData) return;

    setIsSubmitting(true);
    setShowConfirmDialog(false);

    try {
      const formData = new FormData();
      formData.append("name", tempFormData.name);
      formData.append("description", tempFormData.description);
      formData.append("categoryId", tempFormData.categoryId);
      formData.append("city", tempFormData.city);
      formData.append("address", tempFormData.address);

      if (imageFile) {
        formData.append("image", imageFile);
      }

      await createProperty(formData);

      queryClient.invalidateQueries({ queryKey: ["tenant-properties"] });
      toast.success("Property created successfully!");
      navigate("/tenant/dashboard/properties");
    } catch (error: any) {
      console.error("Create property error:", error);
      toast.error(
        error.response?.data?.message || "Failed to create property",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-20">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Badge variant="outline">Tenant Dashboard</Badge>
        <span>/</span>
        <span className="text-foreground">Create Property</span>
      </div>

      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Create New Property
          </h1>
          <p className="text-muted-foreground">
            Fill in the details to list your property on Rentivo.
          </p>
        </div>
      </div>

      <form
        onSubmit={handleSubmit(onSubmit as any)}
        className="space-y-8"
      >
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Info className="h-5 w-5 text-primary" />
              <CardTitle>Basic Information</CardTitle>
            </div>
            <CardDescription>
              Give your property a name and describe it to attract guests.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Property Name</Label>
              <Input
                id="name"
                placeholder="e.g. Sunset Beach Villa"
                {...register("name")}
              />
              {errors.name && (
                <p className="text-xs text-destructive">
                  {errors.name.message}
                </p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="categoryId">Category</Label>
                <Select
                  value={watch("categoryId")}
                  onValueChange={(val) =>
                    setValue("categoryId", val, { shouldValidate: true })
                  }
                >
                  <input type="hidden" {...register("categoryId")} />
                  <SelectTrigger id="categoryId">
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

              <div className="space-y-2">
                <Label htmlFor="image">Property Image (Optional)</Label>
                <div className="flex items-center gap-4">
                  <div className="h-20 w-32 border-2 border-dashed rounded-md flex items-center justify-center bg-muted overflow-hidden relative group">
                    {imagePreview ? (
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <Upload className="h-6 w-6 text-muted-foreground" />
                    )}
                    <input
                      type="file"
                      id="image-upload"
                      className="absolute inset-0 opacity-0 cursor-pointer"
                      accept="image/*"
                      onChange={handleImageChange}
                    />
                  </div>
                  <div className="text-xs text-muted-foreground">
                    <p className="font-medium text-foreground">
                      Click to upload
                    </p>
                    <p>PNG, JPG up to 2MB</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Describe your property in detail..."
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
            <CardDescription>
              Let guests know where your property is located.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="city">City</Label>
                <div className="relative">
                  <Input
                    id="city"
                    placeholder="e.g. Bali, Jakarta, Yogyakarta"
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
                <Label htmlFor="address">Full Address</Label>
                <div className="relative">
                  <Input
                    id="address"
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
          </CardContent>
        </Card>

        {/* Submit Buttons */}
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
            {isSubmitting && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            Create Property
          </Button>
        </div>
      </form>

      {/* Confirmation Dialog */}
      <Dialog
        open={showConfirmDialog}
        onOpenChange={setShowConfirmDialog}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-emerald-500" />
              Ready to create your property?
            </DialogTitle>
            <DialogDescription>
              Your property will be created and visible on the platform. You can
              add rooms and manage availability afterwards.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-4">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Name</span>
              <span className="font-medium">{tempFormData?.name}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">City</span>
              <span className="font-medium">{tempFormData?.city}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Category</span>
              <span className="font-medium">
                {categories.find((c) => c.id === tempFormData?.categoryId)
                  ?.name || "—"}
              </span>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowConfirmDialog(false)}
              disabled={isSubmitting}
            >
              Review Again
            </Button>
            <Button onClick={handleConfirmSubmit} disabled={isSubmitting}>
              {isSubmitting && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Confirm & Create
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
