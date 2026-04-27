import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router";
import { motion, AnimatePresence } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Home, Loader2, CheckCircle, Mail, Building2, Phone } from "lucide-react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { RadioGroup, RadioGroupItem } from "~/components/ui/radio-group";
import { toast } from "sonner";
import { registerSchema, type RegisterSchema } from "~/modules/auth/auth.schema";
import { useMutation } from "@tanstack/react-query";
import { authService } from "~/modules/auth/auth.service";

export default function RegisterPage() {
  const navigate = useNavigate();
  const [registrationSuccess, setRegistrationSuccess] = useState(false);
  const [countdown, setCountdown] = useState(0);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<RegisterSchema>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      email: "",
      role: "USER",
    },
  });

  const selectedRole = watch("role");

  const { mutate, isPending } = useMutation({
    mutationFn: (data: RegisterSchema) => authService.register(data),
    onSuccess: () => {
      setRegistrationSuccess(true);
      setCountdown(60);
    },
    onError: (error: any) => {
      toast.error(
        error?.response?.data?.message ||
          "Registration failed. Please try again.",
      );
    },
  });

  const { mutate: resendMutate, isPending: isResending } = useMutation({
    mutationFn: (email: string) => authService.resendVerification(email),
    onSuccess: () => {
      toast.success("Verification link has been resent to your email.");
      setCountdown(60);
    },
    onError: (error: any) => {
      toast.error(
        error?.response?.data?.message ||
          "Failed to resend verification link.",
      );
    },
  });

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (countdown > 0) {
      timer = setInterval(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [countdown]);

  const onSubmit = (data: RegisterSchema) => {
    mutate(data);
  };

  // Success state - show email verification message
  if (registrationSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center p-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md text-center"
        >
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-green-100">
            <Mail className="h-10 w-10 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-3">
            Check Your Email
          </h1>
          <p className="text-muted-foreground mb-6">
            We've sent a verification link to your email address. Please check
            your inbox and click the link to verify your account and set your
            password.
          </p>
          <p className="text-sm text-muted-foreground mb-8">
            The verification link will expire in{" "}
            <span className="font-semibold text-foreground">1 hour</span>.
          </p>
          <div className="space-y-3">
            <Button
              onClick={() => navigate("/login")}
              className="w-full btn-gradient"
              size="lg"
            >
              Go to Login
            </Button>
            <Button
              variant="outline"
              onClick={() => resendMutate(watch("email"))}
              disabled={countdown > 0 || isResending}
              className="w-full"
            >
              {isResending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Sending...
                </>
              ) : countdown > 0 ? (
                `Resend Email in ${countdown}s`
              ) : (
                "Resend Email"
              )}
            </Button>
            <Button
              variant="ghost"
              onClick={() => setRegistrationSuccess(false)}
              className="w-full text-muted-foreground"
            >
              ← Back to Register
            </Button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Image */}
      <div className="hidden lg:block lg:w-1/2 relative overflow-hidden">
        <img
          src="https://marriott.cdn.tambourine.com/_blue-diamond-resorts/media/hero_9874-6939a5c4b1447.jpg"
          alt="Event"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-linear-to-t from-primary/90 to-primary/40" />
        <div className="absolute bottom-0 left-0 right-0 p-12">
          <h2 className="text-3xl font-bold text-primary-foreground mb-4">
            Start Your Trip Journey
          </h2>
          <p className="text-lg text-primary-foreground/80">
            Join thousands of travelers and hosts. Create unforgettable
            experiences together.
          </p>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="flex-1 overflow-y-auto p-8 flex">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md m-auto"
        >
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 mb-8">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
              <Home className="h-6 w-6 text-primary-foreground" />
            </div>
            <span className="text-2xl font-bold text-foreground">Rentivo</span>
          </Link>

          <h1 className="text-3xl font-bold text-foreground mb-2">
            Create an account
          </h1>
          <p className="text-muted-foreground mb-8">
            Get started with Rentivo today
          </p>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {/* Role Selection */}
            <div>
              <Label className="mb-3 block">I want to</Label>
              <RadioGroup
                value={selectedRole}
                onValueChange={(value) =>
                  setValue("role", value as "USER" | "TENANT")
                }
                className="grid grid-cols-2 gap-4"
              >
                <Label
                  htmlFor="USER"
                  className={`flex flex-col items-center justify-center p-4 rounded-lg border-2 cursor-pointer transition-colors ${
                    selectedRole === "USER"
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-primary/50"
                  }`}
                >
                  <RadioGroupItem value="USER" id="USER" className="sr-only" />
                  <span className="text-2xl mb-2">🛏️</span>
                  <span className="font-medium">Book Stays</span>
                  <span className="text-xs text-center text-muted-foreground">
                    Find & rent properties
                  </span>
                </Label>
                <Label
                  htmlFor="TENANT"
                  className={`flex flex-col items-center justify-center p-4 rounded-lg border-2 cursor-pointer transition-colors ${
                    selectedRole === "TENANT"
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-primary/50"
                  }`}
                >
                  <RadioGroupItem
                    value="TENANT"
                    id="TENANT"
                    className="sr-only"
                  />
                  <span className="text-2xl mb-2">🏢</span>
                  <span className="font-medium">Host Stays</span>
                  <span className="text-xs text-center text-muted-foreground">
                    List & manage properties
                  </span>
                </Label>
              </RadioGroup>
            </div>

            <div>
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                placeholder="Enter your full name"
                className="mt-1.5 input-focus"
                {...register("name")}
              />
              {errors.name && (
                <p className="text-sm text-destructive mt-1">
                  {errors.name.message}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                className="mt-1.5 input-focus"
                {...register("email")}
              />
              {errors.email && (
                <p className="text-sm text-destructive mt-1">
                  {errors.email.message}
                </p>
              )}
            </div>

            <AnimatePresence>
              {selectedRole === "TENANT" && (
                <motion.div
                  initial={{ opacity: 0, height: 0, marginTop: 0 }}
                  animate={{ opacity: 1, height: "auto", marginTop: 20 }}
                  exit={{ opacity: 0, height: 0, marginTop: 0 }}
                  className="space-y-5 overflow-hidden"
                >
                  <div className="p-4 rounded-lg bg-amber-50 border border-amber-200 dark:bg-amber-950/30 dark:border-amber-800">
                    <div className="flex items-center gap-2">
                      <Building2 className="h-5 w-5 text-amber-600 shrink-0" />
                      <p className="text-sm font-medium text-amber-700 dark:text-amber-300">
                        Host Account — Tell us about your business
                      </p>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="businessName">Business Name</Label>
                    <Input
                      id="businessName"
                      placeholder="e.g. Sunshine Villas"
                      className="mt-1.5 input-focus"
                      {...register("businessName")}
                    />
                    {errors.businessName && (
                      <p className="text-sm text-destructive mt-1">
                        {errors.businessName.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="phone">Phone Number</Label>
                    <div className="relative mt-1.5">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="phone"
                        type="tel"
                        placeholder="e.g. +62 812 3456 7890"
                        className="pl-10 input-focus"
                        {...register("phone")}
                      />
                    </div>
                    {errors.phone && (
                      <p className="text-sm text-destructive mt-1">
                        {errors.phone.message}
                      </p>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="p-3 rounded-lg bg-blue-50 border border-blue-200 dark:bg-blue-950/30 dark:border-blue-800">
              <div className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-blue-600 mt-0.5 shrink-0" />
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  After registration, we'll send a verification link to your
                  email where you can set your password.
                </p>
              </div>
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
                  Creating account...
                </>
              ) : (
                "Create Account"
              )}
            </Button>
          </form>

          <p className="text-center text-sm text-muted-foreground mt-8">
            Already have an account?{" "}
            <Link
              to="/login"
              className="text-primary font-medium hover:underline"
            >
              Sign in
            </Link>
          </p>

          <p className="text-center text-xs text-muted-foreground mt-4">
            By creating an account, you agree to our{" "}
            <Link to="/terms" className="text-primary hover:underline">
              Terms of Service
            </Link>{" "}
            and{" "}
            <Link to="/privacy" className="text-primary hover:underline">
              Privacy Policy
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
