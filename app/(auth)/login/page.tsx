"use client";

import { Suspense, useActionState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { login } from "@/app/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const OAUTH_ERRORS: Record<string, string> = {
  oauth_cancelled: "Google sign-in was cancelled.",
  oauth_state_mismatch: "Security check failed. Please try again.",
  oauth_token_exchange: "Failed to complete Google sign-in. Please try again.",
  oauth_userinfo: "Could not retrieve your Google account info.",
};

function OAuthError() {
  const searchParams = useSearchParams();
  const oauthError = searchParams.get("error");
  if (!oauthError) return null;
  return (
    <p className="text-sm text-destructive bg-destructive/10 rounded-lg px-3 py-2 border border-destructive/20">
      {OAUTH_ERRORS[oauthError] ?? "An error occurred. Please try again."}
    </p>
  );
}

export default function LoginPage() {
  const [state, action, pending] = useActionState(login, undefined);

  return (
    <div className="space-y-6">
      <div className="space-y-1.5">
        <h1 className="text-2xl font-bold tracking-tight">Sign in</h1>
        <p className="text-sm text-muted-foreground">Enter your email and password to access RMS</p>
      </div>

      <Suspense>
        <OAuthError />
      </Suspense>

      {/* Google OAuth */}
      <a href="/api/auth/google" className="block">
        <Button type="button" variant="outline" className="w-full gap-2.5 h-10">
          <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden="true">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" />
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
          </svg>
          Continue with Google
        </Button>
      </a>

      <div className="flex items-center gap-3">
        <div className="flex-1 h-px bg-border" />
        <span className="text-xs text-muted-foreground font-medium">or</span>
        <div className="flex-1 h-px bg-border" />
      </div>

      <form action={action} className="space-y-4">
        {state?.message && (
          <p className="text-sm text-destructive bg-destructive/10 rounded-lg px-3 py-2 border border-destructive/20">
            {state.message}
          </p>
        )}

        <div className="space-y-1.5">
          <Label htmlFor="email" className="text-sm font-medium">Email</Label>
          <Input id="email" name="email" type="email" placeholder="you@company.com" required className="h-10" />
          {state?.errors?.email && (
            <p className="text-xs text-destructive">{state.errors.email[0]}</p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="password" className="text-sm font-medium">Password</Label>
          <Input id="password" name="password" type="password" placeholder="••••••••" required className="h-10" />
          {state?.errors?.password && (
            <p className="text-xs text-destructive">{state.errors.password[0]}</p>
          )}
        </div>

        <Button type="submit" className="w-full h-10 font-semibold" disabled={pending}>
          {pending ? "Signing in…" : "Sign in"}
        </Button>
      </form>

      <p className="text-sm text-muted-foreground text-center">
        No account?{" "}
        <Link href="/register" className="text-primary hover:underline font-semibold">
          Create one
        </Link>
        {" · "}
        <Link href="/join" className="text-primary hover:underline font-semibold">
          Join org
        </Link>
      </p>
    </div>
  );
}
