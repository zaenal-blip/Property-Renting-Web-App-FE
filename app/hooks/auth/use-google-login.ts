import { useCallback, useState } from "react";
import { useAuthStore } from "~/modules/auth/auth.store";
import { useNavigate } from "react-router";
import { toast } from "sonner";

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;

export function useGoogleLogin() {
  const navigate = useNavigate();
  const { googleLogin } = useAuthStore();
  const [isPending, setIsPending] = useState(false);

  const handleGoogleLogin = useCallback(() => {
    if (!GOOGLE_CLIENT_ID) {
      toast.error("Google Client ID is not configured");
      return;
    }

    setIsPending(true);

    // Use Google Identity Services to get access token
    const client = google.accounts.oauth2.initTokenClient({
      client_id: GOOGLE_CLIENT_ID,
      scope: "email profile openid",
      callback: async (response: google.accounts.oauth2.TokenResponse) => {
        if (response.error) {
          setIsPending(false);
          toast.error("Google login failed. Please try again.");
          return;
        }

        try {
          const { needsOnboarding } = await googleLogin(response.access_token);

          if (needsOnboarding) {
            toast.info("Please complete your profile setup");
            navigate("/onboarding");
          } else {
            toast.success("Welcome back!");
            navigate("/");
          }
        } catch (error: any) {
          toast.error(
            error?.response?.data?.message ||
              "Google login failed. Please try again.",
          );
        } finally {
          setIsPending(false);
        }
      },
    });

    client.requestAccessToken();
  }, [googleLogin, navigate]);

  return { handleGoogleLogin, isPending };
}
