import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("Email Invalid"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  remember: z.boolean().optional(),
});

export const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(50),
  email: z.string().email("Please enter a valid email"),
  role: z.enum(["USER", "TENANT"]),
  phone: z.string().optional(),
  businessName: z.string().optional(),
})
  .refine(
    (data) => {
      if (data.role === "TENANT") {
        return !!data.phone && data.phone.length > 0;
      }
      return true;
    },
    {
      message: "Phone is required for Tenant",
      path: ["phone"],
    },
  )
  .refine(
    (data) => {
      if (data.role === "TENANT") {
        return !!data.businessName && data.businessName.length > 0;
      }
      return true;
    },
    {
      message: "Business name is required for Tenant",
      path: ["businessName"],
    },
  );

export const forgotPasswordSchema = z.object({
  email: z.string().email("Please enter a valid email"),
});

export const resetPasswordSchema = z
  .object({
    newPassword: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

export const verifyEmailSchema = z
  .object({
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

export const onboardingSchema = z
  .object({
    role: z.enum(["USER", "TENANT"]),
    phone: z.string().optional(),
    businessName: z.string().optional(),
  })
  .refine(
    (data) => {
      if (data.role === "TENANT") {
        return !!data.phone && data.phone.length > 0;
      }
      return true;
    },
    {
      message: "Phone is required for Tenant",
      path: ["phone"],
    },
  )
  .refine(
    (data) => {
      if (data.role === "TENANT") {
        return !!data.businessName && data.businessName.length > 0;
      }
      return true;
    },
    {
      message: "Business name is required for Tenant",
      path: ["businessName"],
    },
  );

export type LoginSchema = z.infer<typeof loginSchema>;
export type RegisterSchema = z.infer<typeof registerSchema>;
export type ForgotPasswordSchema = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordSchema = z.infer<typeof resetPasswordSchema>;
export type VerifyEmailSchema = z.infer<typeof verifyEmailSchema>;
export type OnboardingSchema = z.infer<typeof onboardingSchema>;
