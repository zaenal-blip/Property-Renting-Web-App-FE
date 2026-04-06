import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Eye,
  EyeOff,
  Home,
  Loader2,
  CheckCircle,
  ShieldCheck,
  AlertTriangle,
} from "lucide-react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { toast } from "sonner";
import {
  verifyEmailSchema,
  type VerifyEmailSchema,
} from "~/modules/auth/auth.schema";
import { useMutation } from "@tanstack/react-query";
import { authService } from "~/modules/auth/auth.service";

export default function VerifyEmailPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [verified, setVerified] = useState(false);

  // Check token expiration on load
  const checkTokenExpiration = (t: string | null) => {
    if (!t) return { status: "missing", email: null };
    try {
      const parts = t.split(".");
      if (parts.length === 3) {
        const base64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
        const payload = JSON.parse(atob(base64));
        if (payload.exp && payload.exp * 1000 < Date.now()) {
          return { status: "expired", email: payload.email || null };
        }
        return { status: "valid", email: payload.email || null };
      }
    } catch {
      // Ignore parse errors, let backend handle fallback validation
    }
    return { status: "invalid", email: null };
  };

  const { status: tokenStatus, email: registeredEmail } = checkTokenExpiration(token);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<VerifyEmailSchema>({
    resolver: zodResolver(verifyEmailSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });

  const { mutate, isPending } = useMutation({
    mutationFn: (data: VerifyEmailSchema) =>
      authService.verifyEmail(token!, data.password),
    onSuccess: () => {
      setVerified(true);
      toast.success("Email verified successfully!");
    },
    onError: (error: any) => {
      toast.error(
        error?.response?.data?.message ||
          "Verification failed. The link may be expired or invalid.",
      );
    },
  });

  const { mutate: resendEmail, isPending: isResending } = useMutation({
    mutationFn: (email: string) => authService.resendVerification(email),
    onSuccess: () => {
      toast.success("Email verifikasi baru telah terkirim! Silakan cek inbox Anda.");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Gagal mengirim ulang email.");
    },
  });

  const onSubmit = (data: VerifyEmailSchema) => {
    mutate(data);
  };

  // Invalid or missing token UX
  if (tokenStatus !== "valid") {
    return (
      <div className="min-h-screen flex items-center justify-center p-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md text-center"
        >
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-red-100">
            <AlertTriangle className="h-10 w-10 text-red-600" />
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-3">
            {tokenStatus === "expired" ? "Link Expired" : "Invalid Verification Link"}
          </h1>
          <p className="text-muted-foreground mb-8">
            {tokenStatus === "expired" 
             ? "This verification link has expired. Please request a new one below."
             : "The verification link is missing or invalid. Please check the link in your email and try again."}
          </p>
          
          {tokenStatus === "expired" && registeredEmail ? (
            <div className="space-y-3">
              <Button
                onClick={() => resendEmail(registeredEmail)}
                disabled={isResending}
                className="w-full btn-gradient"
                size="lg"
              >
                {isResending ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
                Kirim Ulang Email Verifikasi
              </Button>
              <Button
                onClick={() => navigate("/login")}
                variant="ghost"
                className="w-full"
              >
                Kembali ke Login
              </Button>
            </div>
          ) : (
            <Button
              onClick={() => navigate("/login")}
              className="btn-gradient w-full"
              size="lg"
            >
              Go to Login
            </Button>
          )}
        </motion.div>
      </div>
    );
  }

  // Successfully verified
  if (verified) {
    return (
      <div className="min-h-screen flex items-center justify-center p-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md text-center"
        >
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-green-100">
            <CheckCircle className="h-10 w-10 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-3">
            Email Verified!
          </h1>
          <p className="text-muted-foreground mb-8">
            Your account has been verified and your password has been set. You
            can now sign in to your account.
          </p>
          <Button
            onClick={() => navigate("/login")}
            className="w-full btn-gradient"
            size="lg"
          >
            Sign In Now
          </Button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 mb-8">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
            <Home className="h-6 w-6 text-primary-foreground" />
          </div>
          <span className="text-2xl font-bold text-foreground">Rentivo</span>
        </Link>

        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
          <ShieldCheck className="h-8 w-8 text-primary" />
        </div>

        <h1 className="text-3xl font-bold text-foreground mb-2 text-center">
          Set Your Password
        </h1>
        <p className="text-muted-foreground mb-8 text-center">
          Your email is being verified. Please create a secure password for your
          account.
        </p>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div>
            <Label htmlFor="password">Password</Label>
            <div className="relative mt-1.5">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Create a password (min. 8 characters)"
                className="pr-10 input-focus"
                autoFocus
                {...register("password")}
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
            {errors.password && (
              <p className="text-sm text-destructive mt-1">
                {errors.password.message}
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="confirmPassword">Confirm Password</Label>
            <div className="relative mt-1.5">
              <Input
                id="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Confirm your password"
                className="pr-10 input-focus"
                {...register("confirmPassword")}
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
            {errors.confirmPassword && (
              <p className="text-sm text-destructive mt-1">
                {errors.confirmPassword.message}
              </p>
            )}
          </div>

          <Button
            type="submit"
            className="w-full btn-gradient"
            size="lg"
            disabled={isPending}
          >
            {isPending ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Verifying...
              </>
            ) : (
              "Verify & Set Password"
            )}
          </Button>
        </form>

        <div className="mt-8 pt-6 border-t border-border text-center">
          <Link
            to="/login"
            className="text-sm text-muted-foreground hover:text-primary transition-colors"
          >
            ← Back to Login
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
