import { axiosInstance } from "~/lib/axios";
import type { LoginSchema, RegisterSchema } from "./auth.schema";

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
      password: payload.password,
      role: payload.role,
      referralCode: payload.referralCode,
    });
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
};
