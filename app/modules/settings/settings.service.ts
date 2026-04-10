import { axiosInstance } from "~/lib/axios";
import type {
  AvatarSchema,
  ChangePasswordSchema,
} from "./settings.schema";

export interface UpdateProfilePayload {
  name: string;
  email: string;
  phone?: string;
  businessName?: string;
  profilePicture?: string;
}

export const settingsService = {
  async uploadAvatar(payload: AvatarSchema) {
    const formData = new FormData();
    formData.append("file", payload.avatar);
    const response = await axiosInstance.post<{ url: string; message: string }>(
      `/media/upload`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      },
    );
    return { fileURL: response.data.url };
  },

  async updateProfile(userId: string, payload: UpdateProfilePayload) {
    const { data } = await axiosInstance.patch(
      `/users/${userId}/profile`,
      payload,
    );
    return data;
  },

  async changePassword(userId: string, payload: ChangePasswordSchema) {
    const { data } = await axiosInstance.patch(`/users/${userId}/password`, {
      oldPassword: payload.oldPassword,
      newPassword: payload.newPassword,
    });
    return data;
  },

  async getMyReservations(page: number = 1, take: number = 10) {
    const { data } = await axiosInstance.get(`/reservations/my`, {
      params: { page, take },
    });
    return data;
  },
};
