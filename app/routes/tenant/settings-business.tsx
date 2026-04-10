import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Building2, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Separator } from "~/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import { useAuthStore } from "~/modules/auth/auth.store";
import {
  tenantProfileSchema,
  type TenantProfileSchema,
} from "~/modules/settings/settings.schema";
import {
  settingsService,
  type UpdateProfilePayload,
} from "~/modules/settings/settings.service";
import { useMutation } from "@tanstack/react-query";

export default function TenantBusinessSettingsPage() {
  const { user, hasHydrated, updateUser } = useAuthStore();
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [formData, setFormData] = useState<TenantProfileSchema | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm<TenantProfileSchema>({
    resolver: zodResolver(tenantProfileSchema),
    defaultValues: {
      businessName: user?.businessName ?? "",
      contactInfo: user?.phone ?? "",
      notificationEmail: user?.email ?? "",
    },
  });

  useEffect(() => {
    if (user && hasHydrated) {
      reset({
        businessName: user.businessName ?? "",
        contactInfo: user.phone ?? "",
        notificationEmail: user.email ?? "",
      });
    }
  }, [user, hasHydrated, reset]);

  const { mutateAsync: updateBusiness, isPending } = useMutation({
    mutationFn: async (data: TenantProfileSchema) => {
      const payload: UpdateProfilePayload = {
        name: user!.name,
        email: user!.email,
        businessName: data.businessName,
        phone: data.contactInfo,
      };
      return await settingsService.updateProfile(user!.id, payload);
    },
    onSuccess: (data) => {
      if (user) updateUser(data);
      setFormData(null);
      setConfirmDialogOpen(false);
      toast.success("Business settings updated successfully!");
    },
    onError: (error: any) => {
      toast.error(
        error.response?.data?.message || "Failed to update business settings.",
      );
    },
  });

  const onSubmit = (data: TenantProfileSchema) => {
    setFormData(data);
    setConfirmDialogOpen(true);
  };

  const handleConfirmSave = async () => {
    if (formData) await updateBusiness(formData);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold tracking-tight">
          Business Settings
        </h2>
        <p className="text-sm text-muted-foreground">
          Manage your business information and preferences.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Business Profile Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5 text-primary" />
              Business Profile
            </CardTitle>
            <CardDescription>
              Configure your public business information visible to guests.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="businessName">Business Name</Label>
                <Input
                  id="businessName"
                  {...register("businessName")}
                  placeholder="Your business or property name"
                />
                {errors.businessName && (
                  <p className="text-sm text-destructive">
                    {errors.businessName.message}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="contactInfo">
                  Contact Information (Optional)
                </Label>
                <Input
                  id="contactInfo"
                  {...register("contactInfo")}
                  placeholder="Phone or WhatsApp number"
                />
              </div>
            </div>

            <Separator />

            <div className="space-y-2">
              <Label htmlFor="notificationEmail">
                Notification Email (Optional)
              </Label>
              <Input
                id="notificationEmail"
                type="email"
                {...register("notificationEmail")}
                placeholder="email@example.com"
              />
              <p className="text-xs text-muted-foreground">
                Receive booking and reservation updates at this email address.
              </p>
              {errors.notificationEmail && (
                <p className="text-sm text-destructive">
                  {errors.notificationEmail.message}
                </p>
              )}
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit" disabled={!isDirty || isPending}>
              Save Business Settings
            </Button>
          </CardFooter>
        </Card>
      </form>

      {/* Property Stats (informational) */}
      <Card>
        <CardHeader>
          <CardTitle>Property Overview</CardTitle>
          <CardDescription>
            Quick summary of your properties on Rentivo.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-8 text-center rounded-lg border-2 border-dashed border-muted-foreground/20">
            <Building2 className="h-12 w-12 text-muted-foreground/50 mb-4" />
            <p className="text-muted-foreground">
              Property statistics will be available in the Dashboard.
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              Visit the Dashboard for detailed analytics and management.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Confirmation Dialog */}
      <Dialog
        open={confirmDialogOpen}
        onOpenChange={(open) => !isPending && setConfirmDialogOpen(open)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Save Business Settings?</DialogTitle>
            <DialogDescription>
              Are you sure you want to update your business information?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setConfirmDialogOpen(false)}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button onClick={handleConfirmSave} disabled={isPending}>
              {isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Confirm"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
