"use client";

import { useActionState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { login } from "@/app/actions/auth";
import { verifyMfa } from "@/app/actions/super-admin-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ShieldCheck, KeyRound, Eye, EyeOff } from "lucide-react";
import { useState } from "react";

function PasswordInput({ name, placeholder }: { name: string; placeholder?: string }) {
  const [show, setShow] = useState(false);
  return (
    <div className="relative">
      <Input type={show ? "text" : "password"} name={name} placeholder={placeholder ?? "••••••••"} required className="pr-10" />
      <button type="button" onClick={() => setShow((s) => !s)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
        {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
      </button>
    </div>
  );
}

function PasswordStep() {
  const [state, action, pending] = useActionState(login, undefined);
  return (
    <form action={action} className="space-y-4">
      {state?.message && (
        <div className="rounded-lg bg-destructive/10 border border-destructive/20 px-4 py-3 text-sm text-destructive">
          {state.message}
        </div>
      )}
      <div className="space-y-2">
        <Label htmlFor="email" className="text-sm font-medium">Email address</Label>
        <Input id="email" name="email" type="email" placeholder="admin@company.com" autoComplete="email" autoFocus required />
        {state?.errors?.email && <p className="text-xs text-destructive">{state.errors.email[0]}</p>}
      </div>
      <div className="space-y-2">
        <Label htmlFor="password" className="text-sm font-medium">Password</Label>
        <PasswordInput name="password" />
        {state?.errors?.password && <p className="text-xs text-destructive">{state.errors.password[0]}</p>}
      </div>
      <Button type="submit" className="w-full h-10 font-semibold" disabled={pending}>
        {pending ? (
          <span className="flex items-center gap-2">
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
            Verifying…
          </span>
        ) : "Continue →"}
      </Button>
    </form>
  );
}

function MfaStep() {
  const [state, action, pending] = useActionState(verifyMfa, undefined);
  return (
    <form action={action} className="space-y-6">
      {state?.message && (
        <div className="rounded-lg bg-destructive/10 border border-destructive/20 px-4 py-3 text-sm text-destructive">
          {state.message}
        </div>
      )}
      <div className="space-y-2">
        <Label htmlFor="code" className="text-sm font-medium">Authenticator code</Label>
        <Input
          id="code"
          name="code"
          type="text"
          inputMode="numeric"
          pattern="[0-9]{6}"
          maxLength={6}
          placeholder="000 000"
          className="text-center text-3xl tracking-[0.5em] font-mono h-14"
          autoFocus
          autoComplete="one-time-code"
          required
        />
        <p className="text-xs text-muted-foreground text-center">
          Enter the 6-digit code from your authenticator app
        </p>
      </div>
      <Button type="submit" className="w-full h-10 font-semibold" disabled={pending}>
        {pending ? (
          <span className="flex items-center gap-2">
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
            Verifying…
          </span>
        ) : "Sign in"}
      </Button>
      <p className="text-center text-xs text-muted-foreground">
        <a href="/super-admin/login" className="hover:text-foreground transition-colors">← Back to password</a>
      </p>
    </form>
  );
}

function LoginContent() {
  const searchParams = useSearchParams();
  const isMfa = searchParams.get("step") === "mfa";

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Top bar */}
      <div className="border-b px-6 py-3 flex items-center gap-2">
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary text-primary-foreground">
          <ShieldCheck className="h-4 w-4" />
        </div>
        <span className="text-sm font-semibold">RMS</span>
        <span className="text-muted-foreground text-sm">/ Super Admin</span>
      </div>

      {/* Center content */}
      <div className="flex flex-1 items-center justify-center p-6">
        <div className="w-full max-w-sm">
          {/* Icon */}
          <div className="mb-8 flex flex-col items-center gap-3">
            <div className={`flex h-14 w-14 items-center justify-center rounded-2xl shadow-lg ${isMfa ? "bg-blue-500" : "bg-primary"} text-white`}>
              {isMfa ? <KeyRound className="h-7 w-7" /> : <ShieldCheck className="h-7 w-7" />}
            </div>
            <div className="text-center">
              <h1 className="text-2xl font-bold tracking-tight">
                {isMfa ? "Verify identity" : "Admin sign in"}
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                {isMfa ? "Check your authenticator app for the code" : "Restricted to authorized administrators only"}
              </p>
            </div>
          </div>

          {/* Form card */}
          <div className="rounded-xl border bg-card p-6 shadow-sm">
            {isMfa ? <MfaStep /> : <PasswordStep />}
          </div>

          {/* Step indicator */}
          <div className="mt-6 flex items-center justify-center gap-2">
            <div className={`h-1.5 w-8 rounded-full transition-colors ${!isMfa ? "bg-primary" : "bg-border"}`} />
            <div className={`h-1.5 w-8 rounded-full transition-colors ${isMfa ? "bg-primary" : "bg-border"}`} />
          </div>
          <p className="text-center text-xs text-muted-foreground mt-3">
            Step {isMfa ? 2 : 1} of 2 — {isMfa ? "Multi-factor authentication" : "Password verification"}
          </p>
        </div>
      </div>
    </div>
  );
}

export default function SuperAdminLoginPage() {
  return (
    <Suspense>
      <LoginContent />
    </Suspense>
  );
}
