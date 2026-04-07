import { useMutation } from "@tanstack/react-query";
import { authService } from "~/modules/auth/auth.service";
import { useAuthStore } from "~/modules/auth/auth.store";
import { toast } from "sonner";
import { useNavigate } from "react-router";

export function useLogin() {
  const navigate = useNavigate();
  const { setUser } = useAuthStore();

  return useMutation({
    mutationFn: authService.login,

    onSuccess: (data) => {
      setUser({
        id: data.id,
        name: data.name,
        email: data.email,
        profilePicture: data.profilePicture,
        role: data.role,
        provider: data.provider,
        phone: data.phone,
        businessName: data.businessName,
        isVerified: data.isVerified,
        createdAt: data.createdAt,
        updatedAt: data.updatedAt,
      });

      toast.success("Welcome back!");
      navigate("/");
    },

    onError: (error: any) => {
      const message = error.response?.data?.message;
      if (
        message?.includes("belum diverifikasi") ||
        message?.includes("telah kedaluwarsa")
      ) {
        // Suppress toast, handled in UI
        return;
      }
      toast.error(message || "Login failed. Please try again.");
    },
  });
}
