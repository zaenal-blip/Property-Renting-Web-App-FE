import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { motion, AnimatePresence } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, Home, Loader2, ArrowLeft, Mail } from "lucide-react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Checkbox } from "~/components/ui/checkbox";
import { loginSchema, type LoginSchema } from "~/modules/auth/auth.schema";
import { useAuthStore } from "~/modules/auth/auth.store";
import { useLogin } from "~/hooks/auth/use-login";
import { useGoogleLogin } from "~/hooks/auth/use-google-login";
import { useMutation } from "@tanstack/react-query";
import { authService } from "~/modules/auth/auth.service";
import { toast } from "sonner";

// Google SVG Icon
function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none">
      <path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
        fill="#4285F4"
      />
      <path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        fill="#34A853"
      />
      <path
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18A10.96 10.96 0 0 0 1 12c0 1.77.42 3.45 1.18 4.93l3.66-2.84z"
        fill="#FBBC05"
      />
      <path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        fill="#EA4335"
      />
    </svg>
  );
}

export default function LoginPage() {
  const navigate = useNavigate();
  const { setUser } = useAuthStore();
  const [showPassword, setShowPassword] = useState(false);
  const [step, setStep] = useState<1 | 2>(1);

  const {
    register,
    handleSubmit,
    trigger,
    getValues,
    formState: { errors },
  } = useForm<LoginSchema>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
      remember: false,
    },
  });

  const { mutate: login, isPending, error: loginError } = useLogin() as any;
  const { handleGoogleLogin, isPending: isGooglePending } = useGoogleLogin();

  const { mutate: resendEmail, isPending: isResending } = useMutation({
    mutationFn: (email: string) => authService.resendVerification(email),
    onSuccess: () => {
      toast.success("Email terkirim! Silakan cek inbox Anda.");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Gagal mengirim ulang email.");
    },
  });

  const handleResend = () => {
    resendEmail(getValues("email"));
  };

  const onSubmit = (data: LoginSchema) => {
    login(data);
  };

  const handleContinue = async () => {
    const isEmailValid = await trigger("email");
    if (isEmailValid) {
      setStep(2);
    }
  };

  const handleBackToEmail = () => {
    setStep(1);
  };

  // Animation variants
  const slideVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 40 : -40,
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (direction: number) => ({
      x: direction < 0 ? 40 : -40,
      opacity: 0,
    }),
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Form */}
      <div className="flex-1 flex items-center justify-center p-8">
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

          <h1 className="text-3xl font-bold text-foreground mb-2">
            Welcome back
          </h1>
          <p className="text-muted-foreground mb-8">
            Sign in to your account to continue
          </p>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <AnimatePresence mode="wait" custom={step === 1 ? -1 : 1}>
              {step === 1 ? (
                <motion.div
                  key="step-1"
                  custom={-1}
                  variants={slideVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{ duration: 0.25, ease: "easeInOut" }}
                  className="space-y-5"
                >
                  {/* Email Input */}
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="Enter your email"
                      className="mt-1.5 input-focus"
                      {...register("email")}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          handleContinue();
                        }
                      }}
                    />
                    {errors.email && (
                      <p className="text-sm text-destructive mt-1">
                        {errors.email.message}
                      </p>
                    )}
                  </div>

                  {/* Continue Button */}
                  <Button
                    type="button"
                    className="w-full btn-gradient"
                    size="lg"
                    onClick={handleContinue}
                  >
                    <Mail className="h-4 w-4 mr-2" />
                    Continue with Email
                  </Button>

                  {/* Divider */}
                  <div className="relative my">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t border-border" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-background px-3 text-muted-foreground">
                        or continue with
                      </span>
                    </div>
                  </div>

                  {/* Google Login Button */}
                  <div className="grid grid-cols-1 gap-3">
                    <Button
                      type="button"
                      variant="outline"
                      size="lg"
                      className="w-full gap-2 hover:bg-muted/50 hover:text-primary transition-colors"
                      disabled={isGooglePending}
                      onClick={handleGoogleLogin}
                    >
                      {isGooglePending ? (
                        <Loader2 className="h-5 w-5 animate-spin" />
                      ) : (
                        <GoogleIcon className="h-5 w-5" />
                      )}
                      <span className="text-sm font-medium">
                        {isGooglePending ? "Signing in..." : "Google"}
                      </span>
                    </Button>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="step-2"
                  custom={1}
                  variants={slideVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{ duration: 0.25, ease: "easeInOut" }}
                  className="space-y-5"
                >
                  {/* UNVERIFIED ALERT BANNER */}
                  {loginError?.response?.data?.message?.includes("belum diverifikasi") && (
                    <div className="p-3 rounded-lg bg-orange-50 border border-orange-200 dark:bg-orange-950/30 dark:border-orange-800">
                      <p className="text-sm text-orange-700 dark:text-orange-300">
                        {loginError.response.data.message}
                      </p>
                    </div>
                  )}

                  {loginError?.response?.data?.message?.includes("telah kedaluwarsa") && (
                    <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20">
                      <p className="text-sm text-destructive font-medium mb-2">
                        {loginError.response.data.message}
                      </p>
                      <Button 
                        type="button" 
                        variant="destructive" 
                        size="sm" 
                        className="w-full"
                        onClick={handleResend}
                        disabled={isResending}
                      >
                        {isResending ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Mail className="h-4 w-4 mr-2" />}
                        Kirim Ulang Email Verifikasi
                      </Button>
                    </div>
                  )}

                  {/* Email display (read-only) */}
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 border border-border">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 shrink-0">
                      <Mail className="h-4 w-4 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-muted-foreground">
                        Signing in as
                      </p>
                      <p className="text-sm font-medium text-foreground truncate">
                        {getValues("email")}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={handleBackToEmail}
                      className="text-sm text-primary hover:underline font-medium shrink-0"
                    >
                      Edit
                    </button>
                  </div>

                  {/* Password Input */}
                  <div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="password">Password</Label>
                      <Link
                        to="/forgot-password"
                        className="text-sm text-primary hover:underline"
                      >
                        Forgot password?
                      </Link>
                    </div>
                    <div className="relative mt-1.5">
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Enter your password"
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

                  {/* Remember me */}
                  <div className="flex items-center gap-2">
                    <Checkbox id="remember" {...register("remember")} />
                    <Label
                      htmlFor="remember"
                      className="text-sm font-normal cursor-pointer"
                    >
                      Remember me for 30 days
                    </Label>
                  </div>

                  {/* Sign In Button */}
                  <Button
                    type="submit"
                    className="w-full btn-gradient"
                    size="lg"
                    disabled={isPending}
                  >
                    {isPending ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Signing in...
                      </>
                    ) : (
                      "Sign In"
                    )}
                  </Button>

                  {/* Back button */}
                  <Button
                    type="button"
                    variant="ghost"
                    className="w-full text-muted-foreground hover:text-foreground"
                    onClick={handleBackToEmail}
                  >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to login options
                  </Button>
                </motion.div>
              )}
            </AnimatePresence>
          </form>

          <p className="text-center text-sm text-muted-foreground mt-8">
            Don't have an account?{" "}
            <Link
              to="/register"
              className="text-primary font-medium hover:underline"
            >
              Sign up
            </Link>
          </p>

          <div className="mt-8 pt-6 border-t border-border">
            <Link
              to="/"
              className="text-sm text-muted-foreground hover:text-primary transition-colors"
            >
              ← Back to Homepage
            </Link>
          </div>
        </motion.div>
      </div>

      {/* Right Side - Image */}
      <div className="hidden lg:block lg:w-1/2 relative overflow-hidden">
        <img
          src="https://assets.hiltonstatic.com/hilton-asset-cache/image/upload/c_fill%2Cw_1920%2Ch_1080%2Cq_70%2Cf_auto%2Cg_center/g_auto/Imagery/Property%20Photography/Hilton%20International/N/NANHIHI/HERO___Family_Fun_Main_Pool_Drone_2.jpg"
          alt="Event"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-linear-to-t from-primary/90 to-primary/40" />
        <div className="absolute bottom-0 left-0 right-0 p-12">
          <blockquote className="text-primary-foreground">
            <p className="text-2xl font-semibold mb-4">
              "With Rentivo, I can easily compare accommodation prices across
              different dates and find the best deal. Booking a stay has never
              been this simple!"
            </p>
            <footer className="text-primary-foreground/80">
              — Michael Lee, Frequent Traveler
            </footer>
          </blockquote>
        </div>
      </div>
    </div>
  );
}
