import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Calendar, Loader2, ArrowLeft, Mail, CheckCircle } from "lucide-react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { toast } from "sonner";
import {
  forgotPasswordSchema,
  type ForgotPasswordSchema,
} from "~/modules/auth/auth.schema";
import { useMutation } from "@tanstack/react-query";
import { authService } from "~/modules/auth/auth.service";

export default function ForgotPasswordPage() {
  const navigate = useNavigate();
  const [emailSent, setEmailSent] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<ForgotPasswordSchema>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: "",
    },
  });

  const email = watch("email");

  const { mutate: forgotPassword, isPending } = useMutation({
    mutationFn: async (data: ForgotPasswordSchema) => {
      return await authService.forgotPassword(data.email);
    },
    onSuccess: () => {
      toast.success("Reset link has been sent to your email!");
      setEmailSent(true);
    },
    onError: (error: any) => {
      // Generic message for security - don't reveal if email exists
      toast.success(
        "If your email is registered, you will receive a reset link.",
      );
      setEmailSent(true);
    },
  });

  const onSubmit = (data: ForgotPasswordSchema) => {
    forgotPassword(data);
  };

  if (emailSent) {
    return (
      <div className="min-h-screen flex">
        <div className="flex-1 flex items-center justify-center p-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-md text-center"
          >
            {/* Logo */}
            <Link
              to="/"
              className="flex items-center gap-2 mb-8 justify-center"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
                <Calendar className="h-6 w-6 text-primary-foreground" />
              </div>
              <span className="text-2xl font-bold text-foreground">
                Eventku
              </span>
            </Link>

            <div className="mb-6">
              <div className="mx-auto w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mb-4">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
              <h1 className="text-2xl font-bold text-foreground mb-2">
                Check your email
              </h1>
              <p className="text-muted-foreground">
                If <span className="font-medium text-foreground">{email}</span>{" "}
                is registered, you will receive a password reset link shortly.
              </p>
            </div>

            <div className="space-y-4">
              <Button
                variant="outline"
                className="w-full"
                onClick={() => setEmailSent(false)}
              >
                <Mail className="h-4 w-4 mr-2" />
                Try another email
              </Button>

              <Link
                to="/login"
                className="text-sm text-primary font-medium hover:underline inline-flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to login
              </Link>
            </div>

            <p className="text-xs text-muted-foreground mt-8">
              Didn't receive the email? Check your spam folder or wait a few
              minutes before requesting again.
            </p>
          </motion.div>
        </div>

        {/* Right Side - Image */}
        <div className="hidden lg:block lg:w-1/2 relative overflow-hidden">
          <img
            src="https://images.unsplash.com/photo-1557683316-973673baf926?w=1000&h=1200&fit=crop"
            alt="Security"
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-linear-to-t from-primary/90 to-primary/40" />
          <div className="absolute bottom-0 left-0 right-0 p-12">
            <blockquote className="text-primary-foreground">
              <p className="text-2xl font-semibold mb-4">
                "Security is not a product, but a process."
              </p>
              <footer className="text-primary-foreground/80">
                — Bruce Schneier
              </footer>
            </blockquote>
          </div>
        </div>
      </div>
    );
  }

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
              <Calendar className="h-6 w-6 text-primary-foreground" />
            </div>
            <span className="text-2xl font-bold text-foreground">Eventku</span>
          </Link>

          <h1 className="text-3xl font-bold text-foreground mb-2">
            Forgot password?
          </h1>
          <p className="text-muted-foreground mb-8">
            No worries, we'll send you reset instructions.
          </p>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
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

            <Button
              type="submit"
              className="w-full btn-gradient"
              size="lg"
              disabled={isPending}
            >
              {isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Sending...
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
      </div>

      {/* Right Side - Image */}
      <div className="hidden lg:block lg:w-1/2 relative overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1557683316-973673baf926?w=1000&h=1200&fit=crop"
          alt="Security"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-linear-to-t from-primary/90 to-primary/40" />
        <div className="absolute bottom-0 left-0 right-0 p-12">
          <blockquote className="text-primary-foreground">
            <p className="text-2xl font-semibold mb-4">
              "The only truly secure system is one that is powered off, cast in
              a block of concrete and sealed in a lead-lined room."
            </p>
            <footer className="text-primary-foreground/80">
              — Gene Spafford
            </footer>
          </blockquote>
        </div>
      </div>
    </div>
  );
}
