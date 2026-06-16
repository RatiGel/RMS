"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { Plus, X } from "lucide-react";
import { signup } from "@/app/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function RegisterPage() {
  const [state, action, pending] = useActionState(signup, undefined);
  const [categories, setCategories] = useState<string[]>([""]);

  const addCategory = () => setCategories((prev) => [...prev, ""]);
  const removeCategory = (i: number) => setCategories((prev) => prev.filter((_, idx) => idx !== i));
  const updateCategory = (i: number, val: string) =>
    setCategories((prev) => prev.map((c, idx) => (idx === i ? val : c)));

  const validCategories = categories.filter((c) => c.trim().length > 0);

  return (
    <div className="space-y-6">
      <div className="space-y-1.5">
        <h1 className="text-2xl font-bold tracking-tight">Create account</h1>
        <p className="text-sm text-muted-foreground">Set up your organization and get started with RMS</p>
      </div>

      <form action={action} className="space-y-5">
        <input type="hidden" name="categories" value={JSON.stringify(validCategories)} />

        {state?.message && (
          <p className="text-sm text-destructive bg-destructive/10 rounded-lg px-3 py-2 border border-destructive/20">
            {state.message}
          </p>
        )}

        {/* Organization */}
        <div className="space-y-1.5">
          <Label htmlFor="orgName" className="text-sm font-medium">Organization name</Label>
          <Input id="orgName" name="orgName" placeholder="Acme Rentals" required className="h-10" />
          {state?.errors?.orgName && (
            <p className="text-xs text-destructive">{state.errors.orgName[0]}</p>
          )}
        </div>

        <div className="h-px bg-border" />

        {/* User info */}
        <div className="space-y-1.5">
          <Label htmlFor="name" className="text-sm font-medium">Your name</Label>
          <Input id="name" name="name" placeholder="John Doe" required className="h-10" />
          {state?.errors?.name && (
            <p className="text-xs text-destructive">{state.errors.name[0]}</p>
          )}
        </div>

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
            <ul className="text-xs text-destructive space-y-0.5">
              {state.errors.password.map((e) => (
                <li key={e}>— {e}</li>
              ))}
            </ul>
          )}
        </div>

        <div className="h-px bg-border" />

        {/* Categories */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label className="text-sm font-medium">Asset Categories</Label>
            <span className="text-xs text-muted-foreground">Optional</span>
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Organize your inventory by category (e.g. Excavators, Trucks, Tools)
          </p>
          <div className="space-y-2">
            {categories.map((cat, i) => (
              <div key={i} className="flex gap-2">
                <Input
                  value={cat}
                  onChange={(e) => updateCategory(i, e.target.value)}
                  placeholder="e.g. Excavators"
                  className="h-9"
                />
                {categories.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removeCategory(i)}
                    className="shrink-0 h-9 w-9 cursor-pointer"
                  >
                    <X className="h-3.5 w-3.5" />
                  </Button>
                )}
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addCategory}
              className="w-full h-9 text-xs cursor-pointer"
            >
              <Plus className="h-3.5 w-3.5 mr-1.5" />
              Add another category
            </Button>
          </div>
        </div>

        <Button type="submit" className="w-full h-10 font-semibold" disabled={pending}>
          {pending ? "Creating account…" : "Create account"}
        </Button>
      </form>

      <div className="space-y-3">
        <div className="flex items-center gap-3">
          <div className="flex-1 h-px bg-border" />
          <span className="text-xs text-muted-foreground font-medium">or</span>
          <div className="flex-1 h-px bg-border" />
        </div>
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
      </div>

      <div className="text-sm text-muted-foreground text-center space-y-1.5">
        <p>
          Already have an account?{" "}
          <Link href="/login" className="text-primary hover:underline font-semibold">Sign in</Link>
        </p>
        <p>
          Have an invite code?{" "}
          <Link href="/join" className="text-primary hover:underline font-semibold">Join organization</Link>
        </p>
      </div>
    </div>
  );
}
