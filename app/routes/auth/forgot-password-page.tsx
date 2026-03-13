import { Link } from "react-router";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, ArrowLeft, Mail, CheckCircle } from "lucide-react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { AuthLayout } from "~/components/auth/auth-layout";
import { AuthLogo } from "~/components/auth/auth-logo";
import { useForgotPassword } from "~/hooks/auth/use-forgot-password";
import {
  forgotPasswordSchema,
  type ForgotPasswordSchema,
} from "~/modules/auth/auth.schema";

// ── Right-side panel content ──
const HERO_IMAGE =
  "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1000&h=1200&fit=crop";
const HERO_ALT = "Luxury resort pool at sunset";
const HERO_QUOTE =
  "Your account security keeps your dream vacation plans safe. We're here to help you get back on track.";
const HERO_AUTHOR = "Rentivo Security Team";

// ── Success state component ──
function EmailSentView({
  email,
  onRetry,
}: {
  email: string;
  onRetry: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-md text-center"
    >
      <AuthLogo className="justify-center" />

      <div className="mb-6">
        <div className="mx-auto w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mb-4">
          <CheckCircle className="h-8 w-8 text-green-600" />
        </div>
        <h1 className="text-2xl font-bold text-foreground mb-2">
          Check your email
        </h1>
        <p className="text-muted-foreground">
          If <span className="font-medium text-foreground">{email}</span> is
          registered, you will receive a password reset link shortly.
        </p>
      </div>

      <div className="space-y-4">
        <Button variant="outline" className="w-full" onClick={onRetry}>
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
        Didn't receive the email? Check your spam folder or wait a few minutes
        before requesting again.
      </p>
    </motion.div>
  );
}

// ── Form state component ──
function ForgotPasswordForm({
  onSubmit,
  isPending,
}: {
  onSubmit: (data: ForgotPasswordSchema) => void;
  isPending: boolean;
}) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordSchema>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: "" },
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-md"
    >
      <AuthLogo />

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
  );
}

// ── Page component ──
export default function ForgotPasswordPage() {
  const { forgotPassword, isPending, emailSent, resetEmailSent } =
    useForgotPassword();

  const {
    handleSubmit,
    watch,
    register,
    formState: { errors },
  } = useForm<ForgotPasswordSchema>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: "" },
  });

  const email = watch("email");

  const onSubmit = (data: ForgotPasswordSchema) => {
    forgotPassword(data);
  };

  return (
    <AuthLayout
      imageSrc={HERO_IMAGE}
      imageAlt={HERO_ALT}
      quote={HERO_QUOTE}
      quoteAuthor={HERO_AUTHOR}
    >
      {emailSent ? (
        <EmailSentView email={email} onRetry={resetEmailSent} />
      ) : (
        <ForgotPasswordForm onSubmit={onSubmit} isPending={isPending} />
      )}
    </AuthLayout>
  );
}
