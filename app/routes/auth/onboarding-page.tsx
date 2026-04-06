import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { motion, AnimatePresence } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Home,
  Loader2,
  Building2,
  User,
  Phone,
  ArrowRight,
  ArrowLeft,
  Sparkles,
} from "lucide-react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { toast } from "sonner";
import {
  onboardingSchema,
  type OnboardingSchema,
} from "~/modules/auth/auth.schema";
import { useAuthStore } from "~/modules/auth/auth.store";
import { useMutation } from "@tanstack/react-query";

export default function OnboardingPage() {
  const navigate = useNavigate();
  const { user, onboarding } = useAuthStore();
  const [step, setStep] = useState<1 | 2>(1);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    trigger,
    formState: { errors },
  } = useForm<OnboardingSchema>({
    resolver: zodResolver(onboardingSchema),
    defaultValues: {
      role: undefined,
      phone: "",
      businessName: "",
    },
  });

  const selectedRole = watch("role");

  const { mutate, isPending } = useMutation({
    mutationFn: (data: OnboardingSchema) => onboarding(data),
    onSuccess: () => {
      toast.success("Profile setup complete! Welcome to Rentivo!");
      navigate("/");
    },
    onError: (error: any) => {
      toast.error(
        error?.response?.data?.message ||
          "Setup failed. Please try again.",
      );
    },
  });

  const handleRoleSelect = (role: "USER" | "TENANT") => {
    setValue("role", role);
    if (role === "USER") {
      // USER doesn't need extra info, submit directly
      mutate({ role, phone: undefined, businessName: undefined });
    } else {
      // TENANT needs extra info
      setStep(2);
    }
  };

  const onSubmit = (data: OnboardingSchema) => {
    mutate(data);
  };

  useEffect(() => {
    if (!user) {
      navigate("/login");
    } else if (user.role !== null) {
      navigate("/");
    }
  }, [user, navigate]);

  if (!user || user.role !== null) {
    return null;
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-8 bg-linear-to-br from-background via-background to-primary/5">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-lg"
      >
        {/* Logo */}
        <div className="flex items-center gap-2 mb-8 justify-center">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
            <Home className="h-6 w-6 text-primary-foreground" />
          </div>
          <span className="text-2xl font-bold text-foreground">Rentivo</span>
        </div>

        {/* Welcome Message */}
        <div className="text-center mb-8">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
            <Sparkles className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Welcome, {user.name}! 👋
          </h1>
          <p className="text-muted-foreground">
            Let's set up your profile. How would you like to use Rentivo?
          </p>
        </div>

        <AnimatePresence mode="wait">
          {step === 1 ? (
            <motion.div
              key="step-1"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.25 }}
              className="space-y-4"
            >
              {/* Role Cards */}
              <button
                type="button"
                onClick={() => handleRoleSelect("USER")}
                disabled={isPending}
                className="w-full group"
              >
                <div className="flex items-center gap-4 p-6 rounded-xl border-2 border-border hover:border-primary bg-card hover:bg-primary/5 transition-all duration-200 cursor-pointer">
                  <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-blue-100 dark:bg-blue-950 shrink-0">
                    <User className="h-7 w-7 text-blue-600" />
                  </div>
                  <div className="flex-1 text-left">
                    <h3 className="text-lg font-semibold text-foreground">
                      I want to Book Stays
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Find and rent amazing properties for your trips
                    </p>
                  </div>
                  <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors shrink-0" />
                </div>
              </button>

              <button
                type="button"
                onClick={() => handleRoleSelect("TENANT")}
                disabled={isPending}
                className="w-full group"
              >
                <div className="flex items-center gap-4 p-6 rounded-xl border-2 border-border hover:border-primary bg-card hover:bg-primary/5 transition-all duration-200 cursor-pointer">
                  <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-amber-100 dark:bg-amber-950 shrink-0">
                    <Building2 className="h-7 w-7 text-amber-600" />
                  </div>
                  <div className="flex-1 text-left">
                    <h3 className="text-lg font-semibold text-foreground">
                      I want to Host Stays
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      List and manage your properties for guests
                    </p>
                  </div>
                  <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors shrink-0" />
                </div>
              </button>

              {isPending && (
                <div className="flex items-center justify-center gap-2 text-muted-foreground pt-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span className="text-sm">Setting up your account...</span>
                </div>
              )}
            </motion.div>
          ) : (
            <motion.div
              key="step-2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.25 }}
            >
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                <div className="p-4 rounded-lg bg-amber-50 border border-amber-200 dark:bg-amber-950/30 dark:border-amber-800">
                  <div className="flex items-center gap-2">
                    <Building2 className="h-5 w-5 text-amber-600 shrink-0" />
                    <p className="text-sm font-medium text-amber-700 dark:text-amber-300">
                      Host Account — Tell us about your business
                    </p>
                  </div>
                </div>

                <input type="hidden" value="TENANT" {...register("role")} />

                <div>
                  <Label htmlFor="businessName">Business Name</Label>
                  <Input
                    id="businessName"
                    placeholder="e.g. Sunshine Villas"
                    className="mt-1.5 input-focus"
                    autoFocus
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

                <div className="flex gap-3 pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="lg"
                    className="flex-1"
                    onClick={() => {
                      setStep(1);
                      setValue("role", undefined as any);
                    }}
                  >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back
                  </Button>
                  <Button
                    type="submit"
                    className="flex-1 btn-gradient"
                    size="lg"
                    disabled={isPending}
                  >
                    {isPending ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Setting up...
                      </>
                    ) : (
                      <>
                        Complete Setup
                        <ArrowRight className="h-4 w-4 ml-2" />
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Step indicator */}
        <div className="flex items-center justify-center gap-2 mt-8">
          <div
            className={`h-2 rounded-full transition-all ${step === 1 ? "w-8 bg-primary" : "w-2 bg-muted"}`}
          />
          <div
            className={`h-2 rounded-full transition-all ${step === 2 ? "w-8 bg-primary" : "w-2 bg-muted"}`}
          />
        </div>
      </motion.div>
    </div>
  );
}
