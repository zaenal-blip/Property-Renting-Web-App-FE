import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Calendar, Eye, EyeOff, Loader2 } from "lucide-react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { RadioGroup, RadioGroupItem } from "~/components/ui/radio-group";
import { toast } from "sonner";
import { registerSchema, RegisterSchema } from "~/modules/auth/auth.schema";
import { useAuthStore } from "~/modules/auth/auth.store";
import { useMutation } from "@tanstack/react-query";
import { authService } from "~/modules/auth/auth.service";

export default function RegisterPage() {
  const navigate = useNavigate();
  const { register: registerUser } = useAuthStore();
  const [showPassword, setShowPassword] = useState(false);

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
      password: "",
      confirmPassword: "",
      role: "CUSTOMER",
      referralCode: "",
    },
  });

  const selectedRole = watch("role");

  const { mutate, isPending } = useMutation({
    mutationFn: (data: RegisterSchema) => authService.register(data),
    onSuccess: () => {
      toast.success("Account created successfully!");
      navigate("/login"); // ⬅️ redirect ke login
    },
    onError: (error: any) => {
      toast.error(
        error?.response?.data?.message ||
          "Registration failed. Please try again.",
      );
    },
  });

  const onSubmit = (data: RegisterSchema) => {
    mutate(data);
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Image */}
      <div className="hidden lg:block lg:w-1/2 relative overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1000&h=1200&fit=crop"
          alt="Event"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-linear-to-t from-primary/90 to-primary/40" />
        <div className="absolute bottom-0 left-0 right-0 p-12">
          <h2 className="text-3xl font-bold text-primary-foreground mb-4">
            Start Your Event Journey
          </h2>
          <p className="text-lg text-primary-foreground/80">
            Join thousands of event lovers and organizers. Create unforgettable
            experiences together.
          </p>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="flex-1 flex items-center justify-center p-8 overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 mb-8">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
              <Calendar className="h-6 w-6 text-primary-foreground" />
            </div>
            <span className="text-2xl font-bold text-foreground">Eventku</span>
          </Link>

          <h1 className="text-3xl font-bold text-foreground mb-2">
            Create an account
          </h1>
          <p className="text-muted-foreground mb-8">
            Get started with Eventku today
          </p>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {/* Role Selection */}
            <div>
              <Label className="mb-3 block">I want to</Label>
              <RadioGroup
                value={selectedRole}
                onValueChange={(value) =>
                  setValue("role", value as "CUSTOMER" | "ORGANIZER")
                }
                className="grid grid-cols-2 gap-4"
              >
                <Label
                  htmlFor="CUSTOMER"
                  className={`flex flex-col items-center justify-center p-4 rounded-lg border-2 cursor-pointer transition-colors ${
                    selectedRole === "CUSTOMER"
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-primary/50"
                  }`}
                >
                  <RadioGroupItem
                    value="CUSTOMER"
                    id="CUSTOMER"
                    className="sr-only"
                  />
                  <span className="text-2xl mb-2">🎫</span>
                  <span className="font-medium">Attend Events</span>
                  <span className="text-xs text-muted-foreground">
                    Find & book events
                  </span>
                </Label>
                <Label
                  htmlFor="ORGANIZER"
                  className={`flex flex-col items-center justify-center p-4 rounded-lg border-2 cursor-pointer transition-colors ${
                    selectedRole === "ORGANIZER"
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-primary/50"
                  }`}
                >
                  <RadioGroupItem
                    value="ORGANIZER"
                    id="ORGANIZER"
                    className="sr-only"
                  />
                  <span className="text-2xl mb-2">🎪</span>
                  <span className="font-medium">Organize Events</span>
                  <span className="text-xs text-muted-foreground">
                    Create & manage events
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

            <div>
              <Label htmlFor="password">Password</Label>
              <div className="relative mt-1.5">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Create a password"
                  className="pr-10 input-focus"
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
              <Input
                id="confirmPassword"
                type="password"
                placeholder="Confirm your password"
                className="mt-1.5 input-focus"
                {...register("confirmPassword")}
              />
              {errors.confirmPassword && (
                <p className="text-sm text-destructive mt-1">
                  {errors.confirmPassword.message}
                </p>
              )}
            </div>

            {selectedRole === "CUSTOMER" && (
              <div>
                <Label htmlFor="referralCode">Referral Code (Optional)</Label>
                <Input
                  id="referralCode"
                  placeholder="Enter referral code"
                  className="mt-1.5 input-focus"
                  {...register("referralCode")}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Get 10,000 points when you sign up with a referral code!
                </p>
              </div>
            )}

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
