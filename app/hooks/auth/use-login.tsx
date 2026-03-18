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
        isVerified: data.isVerified,
        createdAt: data.createdAt,
        updatedAt: data.updatedAt,
      });

      toast.success("Welcome back!");
      navigate("/");
    },

    onError: (error: any) => {
      toast.error(
        error.response?.data?.message || "Login failed. Please try again.",
      );
    },
  });
}
