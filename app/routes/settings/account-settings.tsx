import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Camera, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Skeleton } from "~/components/ui/skeleton";
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
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { Separator } from "~/components/ui/separator";
import { Badge } from "~/components/ui/badge";
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
  profileUpdateSchema,
  type ProfileUpdateSchema,
} from "~/modules/settings/settings.schema";
import {
  settingsService,
  type UpdateProfilePayload,
} from "~/modules/settings/settings.service";
import { useMutation } from "@tanstack/react-query";

export default function AccountSettingsPage() {
  const { user, hasHydrated, updateUser } = useAuthStore();
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [isAvatarError, setIsAvatarError] = useState(false);
  const [formData, setFormData] = useState<ProfileUpdateSchema | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm<ProfileUpdateSchema>({
    resolver: zodResolver(profileUpdateSchema),
    defaultValues: {
      name: user?.name ?? "",
      email: user?.email ?? "",
      phone: user?.phone ?? "",
      profilePicture: undefined,
    },
  });

  useEffect(() => {
    if (user && hasHydrated) {
      reset({
        name: user.name,
        email: user.email,
        phone: user.phone ?? "",
      });
    }
  }, [user, hasHydrated, reset]);

  const { mutateAsync: updateProfile, isPending } = useMutation({
    mutationFn: async (data: ProfileUpdateSchema) => {
      let pictureUrl: string | undefined | null = user?.profilePicture;

      if (avatarFile) {
        const response = await settingsService.uploadAvatar({
          avatar: avatarFile,
        });
        pictureUrl = response.fileURL;
      }

      const payload: UpdateProfilePayload = {
        name: data.name,
        email: data.email,
        phone: data.phone,
        profilePicture: pictureUrl ?? undefined,
      };

      return await settingsService.updateProfile(user!.id, payload);
    },
    onSuccess: (data) => {
      if (user) {
        updateUser(data);
      }
      setAvatarFile(null);
      setAvatarPreview(null);
      setIsAvatarError(false);
      setFormData(null);
      setConfirmDialogOpen(false);
      toast.success("Profile updated successfully!");
    },
    onError: (error: any) => {
      console.error("Update profile error:", error);
      const message =
        error.response?.data?.message ||
        "Failed to update profile. Please try again.";
      toast.error(message);
    },
  });

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatarFile(file);
      setIsAvatarError(false);
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const onSubmit = (data: ProfileUpdateSchema) => {
    setFormData(data);
    setConfirmDialogOpen(true);
  };

  const handleConfirmSave = async () => {
    if (formData) {
      await updateProfile(formData);
    }
  };

  if (!hasHydrated) {
    return (
      <div className="space-y-6">
        <div>
          <Skeleton className="h-7 w-48 mb-2" />
          <Skeleton className="h-4 w-96" />
        </div>
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-32 mb-1.5" />
            <Skeleton className="h-4 w-64" />
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center gap-6">
              <Skeleton className="h-24 w-24 rounded-full" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-48" />
              </div>
            </div>
            <Separator />
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-10 w-full" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-10 w-full" />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-10 w-full" />
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Skeleton className="h-10 w-32" />
          </CardFooter>
        </Card>
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-40 mb-1.5" />
            <Skeleton className="h-4 w-72" />
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-6 w-24 rounded-full" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-5 w-32" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold tracking-tight">
          Account Settings
        </h2>
        <p className="text-sm text-muted-foreground">
          Manage your profile information and account details.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Edit Profile Card */}
        <Card>
          <CardHeader>
            <CardTitle>Edit Profile</CardTitle>
            <CardDescription>Update your personal information.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Avatar Upload */}
            <div className="flex items-center gap-6">
              <div className="relative">
                <Avatar className="h-24 w-24">
                  <AvatarImage
                    src={avatarPreview ?? user?.profilePicture ?? undefined}
                    onLoadingStatusChange={(status) => {
                      setIsAvatarError(status === "error");
                    }}
                  />
                  <AvatarFallback className="text-2xl">
                    {!(avatarPreview ?? user?.profilePicture) || isAvatarError
                      ? (user?.name?.charAt(0) ?? "U")
                      : null}
                  </AvatarFallback>
                </Avatar>
                <label
                  htmlFor="avatar-upload"
                  className="absolute bottom-0 right-0 flex h-8 w-8 cursor-pointer items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg hover:bg-primary/90 transition-colors"
                >
                  <Camera className="h-4 w-4" />
                  <input
                    id="avatar-upload"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleAvatarChange}
                  />
                </label>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium">Profile Picture</p>
                <p className="text-xs text-muted-foreground">
                  JPG, PNG or GIF. Max 2MB.
                </p>
              </div>
            </div>

            <Separator />

            {/* Form Fields */}
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  {...register("name")}
                  placeholder="Enter your name"
                />
                {errors.name && (
                  <p className="text-sm text-destructive">
                    {errors.name.message}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  {...register("email")}
                  placeholder="Enter your email"
                />
                {errors.email && (
                  <p className="text-sm text-destructive">
                    {errors.email.message}
                  </p>
                )}
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="phone">Phone Number (Optional)</Label>
                <Input id="phone" {...register("phone")} placeholder="+62..." />
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit" disabled={!isDirty && !avatarPreview}>
              Save Changes
            </Button>
          </CardFooter>
        </Card>
      </form>

      {/* Account Info Card */}
      <Card>
        <CardHeader>
          <CardTitle>Account Information</CardTitle>
          <CardDescription>Your account details and status.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {/* Role */}
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Role</p>
              <Badge variant="outline" className="capitalize">
                {user?.role?.toLowerCase() ?? "user"}
              </Badge>
            </div>

            {/* Member Since */}
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Member Since</p>
              <p className="text-sm font-medium">
                {user?.createdAt
                  ? new Date(user.createdAt).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })
                  : "—"}
              </p>
            </div>

            {/* Provider */}
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Login Method</p>
              <Badge variant="secondary" className="capitalize">
                {user?.provider ?? "email"}
              </Badge>
            </div>

            {/* Verification */}
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">
                Verification Status
              </p>
              <Badge
                variant={user?.isVerified ? "default" : "destructive"}
                className="capitalize"
              >
                {user?.isVerified ? "Verified" : "Unverified"}
              </Badge>
            </div>
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
            <DialogTitle>Save Changes?</DialogTitle>
            <DialogDescription>
              Are you sure you want to update your profile information?
              {avatarFile && " A new profile picture will also be uploaded."}
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
