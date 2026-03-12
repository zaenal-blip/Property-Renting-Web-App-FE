import { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Calendar,
  Loader2,
  ArrowLeft,
  Eye,
  EyeOff,
  CheckCircle,
  XCircle,
  Home,
} from "lucide-react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { toast } from "sonner";
import {
  resetPasswordSchema,
  type ResetPasswordSchema,
} from "~/modules/auth/auth.schema";
import { useMutation } from "@tanstack/react-query";
import { authService } from "~/modules/auth/auth.service";

export default function ResetPasswordPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isInvalidToken, setIsInvalidToken] = useState(false);

  useEffect(() => {
    if (!token) {
      setIsInvalidToken(true);
    }
  }, [token]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordSchema>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      newPassword: "",
      confirmPassword: "",
    },
  });

  const { mutate: resetPassword, isPending } = useMutation({
    mutationFn: async (data: ResetPasswordSchema) => {
      return await authService.resetPassword(token!, data.newPassword);
    },
    onSuccess: () => {
      setIsSuccess(true);
      toast.success("Password reset successfully!");
    },
    onError: (error: any) => {
      if (error.response?.status === 400) {
        setIsInvalidToken(true);
        toast.error("Invalid or expired reset link. Please request a new one.");
      } else {
        toast.error(
          error.response?.data?.message ||
            "Failed to reset password. Please try again.",
        );
      }
    },
  });

  const onSubmit = (data: ResetPasswordSchema) => {
    if (!token) {
      toast.error("Invalid reset link");
      return;
    }
    resetPassword(data);
  };

  const renderContent = () => {
    // 1. Invalid Token State
    if (isInvalidToken) {
      return (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md text-center"
        >
          <Link to="/" className="flex items-center gap-2 mb-8 justify-center">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
              <Home className="h-6 w-6 text-primary-foreground" />
            </div>
            <span className="text-2xl font-bold text-foreground">Rentivo</span>
          </Link>

          <div className="mb-6">
            <div className="mx-auto w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mb-4">
              <XCircle className="h-8 w-8 text-red-600" />
            </div>
            <h1 className="text-2xl font-bold text-foreground mb-2">
              Invalid or Expired Link
            </h1>
            <p className="text-muted-foreground">
              This password reset link is invalid or has expired. Please request
              a new password reset link.
            </p>
          </div>

          <div className="space-y-4">
            <Button asChild className="w-full btn-gradient">
              <Link to="/forgot-password">Request New Link</Link>
            </Button>

            <Link
              to="/login"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors inline-flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to login
            </Link>
          </div>
        </motion.div>
      );
    }

    // 2. Success State
    if (isSuccess) {
      return (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md text-center"
        >
          <Link to="/" className="flex items-center gap-2 mb-8 justify-center">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
              <Home className="h-6 w-6 text-primary-foreground" />
            </div>
            <span className="text-2xl font-bold text-foreground">Rentivo</span>
          </Link>

          <div className="mb-6">
            <div className="mx-auto w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mb-4">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <h1 className="text-2xl font-bold text-foreground mb-2">
              Password Reset Successfully!
            </h1>
            <p className="text-muted-foreground">
              Your password has been reset. You can now sign in with your new
              password.
            </p>
          </div>

          <Button asChild className="w-full btn-gradient" size="lg">
            <Link to="/login">Sign In</Link>
          </Button>
        </motion.div>
      );
    }

    // 3. Default Form State
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <Link to="/" className="flex items-center gap-2 mb-8">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
            <Home className="h-6 w-6 text-primary-foreground" />
          </div>
          <span className="text-2xl font-bold text-foreground">Rentivo</span>
        </Link>

        <h1 className="text-3xl font-bold text-foreground mb-2">
          Reset your password
        </h1>
        <p className="text-muted-foreground mb-8">
          Enter your new password below.
        </p>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div>
            <Label htmlFor="newPassword">New Password</Label>
            <div className="relative mt-1.5">
              <Input
                id="newPassword"
                type={showPassword ? "text" : "password"}
                placeholder="Enter new password"
                className="pr-10 input-focus"
                {...register("newPassword")}
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
            {errors.newPassword && (
              <p className="text-sm text-destructive mt-1">
                {errors.newPassword.message}
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="confirmPassword">Confirm Password</Label>
            <div className="relative mt-1.5">
              <Input
                id="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Confirm new password"
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
                Resetting...
              </>
            ) : (
              "Reset Password"
            )}
          </Button>
        </form>

        <Link
          to="/login"
          className="text-sm text-muted-foreground hover:text-foreground transition-colors mt-8 inline-flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to login
        </Link>
      </motion.div>
    );
  };

  const isFormState = !isInvalidToken && !isSuccess;

  const rightSideImage = isFormState
    ? "https://evermoreresort.com/sites/default/files/styles/rectangle_large/public/2025-01/Evermore_bay_hero.jpg.webp?itok=ycPTliJ9"
    : "https://media.vrbo.com/lodging/96000000/95520000/95511900/95511892/54c07ab7.jpg?impolicy=resizecrop&ra=fill&rh=575&rw=575";

  const sideQuote = isFormState
    ? "Your security is our priority. Protect your account to keep your bookings safe."
    : "Your security is our priority. Relax and enjoy your stay.";

  const sideAuthor = isFormState
    ? "Rentivo Security Team"
    : "Rentivo Concierge";

  return (
    <div className="min-h-screen flex">
      {/* Left Side */}
      <div className="flex-1 flex items-center justify-center p-8">
        {renderContent()}
      </div>

      {/* Right Side - Image & Quote */}
      <div className="hidden lg:block lg:w-1/2 relative overflow-hidden">
        <img
          src={rightSideImage}
          alt="Security"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-linear-to-t from-primary/90 to-primary/40" />
        <div className="absolute bottom-0 left-0 right-0 p-12">
          <blockquote className="text-primary-foreground">
            <p className="text-2xl font-semibold mb-4">"{sideQuote}"</p>
            <footer className="text-primary-foreground/80">
              — {sideAuthor}
            </footer>
          </blockquote>
        </div>
      </div>
    </div>
  );
}
