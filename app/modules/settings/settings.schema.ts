import { z } from "zod";

// ============= Profile Settings =============
export const profileUpdateSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(50),
  email: z.string().email("Please enter a valid email"),
  phone: z.string().optional(),
  profilePicture: z
    .instanceof(File, { message: "Please upload an image" })
    .optional(),
});

export type ProfileUpdateSchema = z.infer<typeof profileUpdateSchema>;

export const AvatarSchema = z.object({
  avatar: z.instanceof(File, { message: "Please upload an image" }),
});

export type AvatarSchema = z.infer<typeof AvatarSchema>;

// ============= Password Settings =============
export const changePasswordSchema = z
  .object({
    oldPassword: z.string().min(1, "Current password is required"),
    newPassword: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  })
  .refine((data) => data.oldPassword !== data.newPassword, {
    message: "New password must be different from current password",
    path: ["newPassword"],
  });

export type ChangePasswordSchema = z.infer<typeof changePasswordSchema>;

// ============= Notification Settings =============
export const notificationSettingsSchema = z.object({
  emailOnReservationConfirmed: z.boolean().default(true),
  emailOnReservationCancelled: z.boolean().default(true),
  emailPaymentReminder: z.boolean().default(true),
  bookingReminder: z.boolean().default(true),
  emailNotifications: z.boolean().default(true),
  inAppNotifications: z.boolean().default(true),
});

export type NotificationSettingsSchema = z.infer<
  typeof notificationSettingsSchema
>;

// ============= Tenant Profile Settings =============
export const tenantProfileSchema = z.object({
  businessName: z
    .string()
    .min(2, "Business name must be at least 2 characters")
    .max(100),
  contactInfo: z.string().optional(),
  notificationEmail: z.string().email("Please enter a valid email").optional(),
});

export type TenantProfileSchema = z.infer<typeof tenantProfileSchema>;
