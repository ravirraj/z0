"use client";

import { Eye, EyeOff } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { authClient } from "@/lib/auth-client";

interface AuthFormProps {
  type: "signin" | "signup";
}

export function AuthForm({ type }: AuthFormProps) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);
  const [isGooglePending, setIsGooglePending] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleEmailSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setIsPending(true);

    const formData = new FormData(event.currentTarget);
    const email = String(formData.get("email") || "").trim();
    const password = String(formData.get("password") || "");
    const name =
      type === "signup"
        ? email.split("@")[0] || email
        : undefined;

    try {
      if (type === "signin") {
        const { error: signInError } = await authClient.signIn.email({
          email,
          password,
        });

        if (signInError) {
          throw new Error(signInError.message || "Invalid credentials.");
        }
      } else {
        const { error: signUpError } = await authClient.signUp.email({
          email,
          password,
          name: name ?? email,
        });

        if (signUpError) {
          throw new Error(signUpError.message || "Could not create account.");
        }
      }

      router.push("/");
      router.refresh();
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Something went wrong. Please try again.",
      );
    } finally {
      setIsPending(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError(null);
    setIsGooglePending(true);

    try {
      const { error: socialError } = await authClient.signIn.social({
        provider: "google",
        callbackURL: "/",
      });

      if (socialError) {
        throw new Error(socialError.message || "Google sign-in failed.");
      }
    } catch (socialSubmitError) {
      setError(
        socialSubmitError instanceof Error
          ? socialSubmitError.message
          : "Google sign-in failed. Please try again.",
      );
      setIsGooglePending(false);
    }
  };

  return (
    <div className="space-y-5">
      <Button
        type="button"
        variant="outline"
        className="h-10 w-full"
        onClick={handleGoogleSignIn}
        disabled={isGooglePending || isPending}
      >
        <GoogleIcon />
        {isGooglePending ? "Redirecting..." : "Continue with Google"}
      </Button>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-card px-2 text-muted-foreground">
            Or continue with email
          </span>
        </div>
      </div>

      <form onSubmit={handleEmailSubmit} className="space-y-5">
        <div className="space-y-2">
          <label
            htmlFor="email"
            className="block font-medium text-foreground text-sm"
          >
            Email
          </label>
          <Input
            id="email"
            name="email"
            type="email"
            placeholder="name@example.com"
            required
            autoFocus
            autoComplete="email"
            className="h-10"
          />
        </div>

        <div className="space-y-2">
          <label
            htmlFor="password"
            className="block font-medium text-foreground text-sm"
          >
            Password
          </label>
          <div className="relative">
            <Input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              placeholder={type === "signup" ? "Min. 6 characters" : "••••••••"}
              required
              autoComplete={
                type === "signin" ? "current-password" : "new-password"
              }
              className="h-10 pr-10"
              minLength={type === "signup" ? 6 : 1}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute top-1/2 right-3 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          </div>
        </div>

        {error && (
          <div className="rounded-md bg-destructive/10 px-3 py-2.5 text-destructive text-sm">
            {error}
          </div>
        )}

        <Button
          type="submit"
          className="h-10 w-full"
          disabled={isPending || isGooglePending}
          size="lg"
        >
          {isPending
            ? type === "signin"
              ? "Signing in..."
              : "Creating account..."
            : type === "signin"
              ? "Sign In"
              : "Create Account"}
        </Button>

        <p className="text-center text-muted-foreground text-sm">
          {type === "signin" ? (
            <>
              Don&apos;t have an account?{" "}
              <Link
                href="/register"
                className="font-medium text-foreground transition-colors hover:text-primary"
              >
                Sign up
              </Link>
            </>
          ) : (
            <>
              Already have an account?{" "}
              <Link
                href="/login"
                className="font-medium text-foreground transition-colors hover:text-primary"
              >
                Sign in
              </Link>
            </>
          )}
        </p>
      </form>
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg
      className="mr-2 h-4 w-4"
      viewBox="0 0 24 24"
      aria-hidden="true"
      focusable="false"
    >
      <path
        fill="#4285F4"
        d="M23.49 12.27c0-.79-.07-1.54-.19-2.27H12v4.51h6.47c-.29 1.48-1.14 2.73-2.4 3.58v3h3.86c2.26-2.09 3.56-5.17 3.56-8.82z"
      />
      <path
        fill="#34A853"
        d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.86-3c-1.08.72-2.45 1.16-4.07 1.16-3.13 0-5.78-2.11-6.73-4.96H1.29v3.09C3.26 21.3 7.31 24 12 24z"
      />
      <path
        fill="#FBBC05"
        d="M5.27 14.29c-.25-.72-.38-1.49-.38-2.29s.14-1.57.38-2.29V6.62H1.29C.47 8.24 0 10.06 0 12s.47 3.76 1.29 5.38l3.98-3.09z"
      />
      <path
        fill="#EA4335"
        d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.26 2.7 1.29 6.62l3.98 3.09C6.22 6.86 8.87 4.75 12 4.75z"
      />
    </svg>
  );
}
