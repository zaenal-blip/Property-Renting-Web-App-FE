import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { authService } from "~/modules/auth/auth.service";
import type { ForgotPasswordSchema } from "~/modules/auth/auth.schema";

export function useForgotPassword() {
  const [emailSent, setEmailSent] = useState(false);

  const mutation = useMutation({
    mutationFn: async (data: ForgotPasswordSchema) => {
      return await authService.forgotPassword(data.email);
    },
    onSuccess: () => {
      toast.success("Reset link has been sent to your email!");
      setEmailSent(true);
    },
    onError: () => {
      // Generic message for security — don't reveal whether an email exists
      toast.success(
        "If your email is registered, you will receive a reset link.",
      );
      setEmailSent(true);
    },
  });

  const resetEmailSent = () => setEmailSent(false);

  return {
    forgotPassword: mutation.mutate,
    isPending: mutation.isPending,
    emailSent,
    resetEmailSent,
  };
}
