import { axiosInstance } from "~/lib/axios";
import type {
  LoginSchema,
  RegisterSchema,
  OnboardingSchema,
} from "./auth.schema";

export const authService = {
  async login(payload: LoginSchema) {
    const { data } = await axiosInstance.post("/auth/login", {
      email: payload.email,
      password: payload.password,
    });
    return data;
  },

  async register(payload: RegisterSchema) {
    const { data } = await axiosInstance.post("/auth/register", {
      name: payload.name,
      email: payload.email,
      role: payload.role,
      phone: payload.phone,
      businessName: payload.businessName,
    });
    return data;
  },

  async googleLogin(accessToken: string) {
    const { data } = await axiosInstance.post("/auth/google", {
      accessToken,
    });
    return data;
  },

  async verifyEmail(token: string, password: string) {
    const { data } = await axiosInstance.post("/auth/verify-email", {
      token,
      password,
    });
    return data;
  },

  async resendVerification(email: string) {
    const { data } = await axiosInstance.post("/auth/resend-verification", {
      email,
    });
    return data;
  },

  async checkVerificationToken(token: string) {
    const { data } = await axiosInstance.post("/auth/check-verification-token", {
      token,
    });
    return data;
  },

  async checkResetToken(token: string) {
    const { data } = await axiosInstance.post("/auth/check-reset-token", {
      token,
    });
    return data;
  },

  async onboarding(payload: OnboardingSchema) {
    const { data } = await axiosInstance.post("/auth/onboarding", payload);
    return data;
  },

  async forgotPassword(email: string) {
    const { data } = await axiosInstance.post("/auth/forgot-password", {
      email,
    });
    return data;
  },

  async resetPassword(token: string, newPassword: string) {
    const { data } = await axiosInstance.post("/auth/reset-password", {
      token,
      newPassword,
    });
    return data;
  },

  async logout() {
    const { data } = await axiosInstance.post("/auth/logout");
    return data;
  },

  async getProfile() {
    const { data } = await axiosInstance.get("/auth/profile");
    return data;
  },
};
