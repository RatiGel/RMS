"use client";

import { useActionState } from "react";
import Link from "next/link";
import { login } from "@/app/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

export default function LoginPage() {
  const [state, action, pending] = useActionState(login, undefined);

  return (
    <Card>
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold">Sign in</CardTitle>
        <CardDescription>Enter your email and password to access RMS</CardDescription>
      </CardHeader>
      <form action={action}>
        <CardContent className="space-y-4">
          {state?.message && (
            <p className="text-sm text-destructive bg-destructive/10 rounded-md px-3 py-2">
              {state.message}
            </p>
          )}
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" name="email" type="email" placeholder="you@company.com" required />
            {state?.errors?.email && (
              <p className="text-xs text-destructive">{state.errors.email[0]}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input id="password" name="password" type="password" placeholder="••••••••" required />
            {state?.errors?.password && (
              <p className="text-xs text-destructive">{state.errors.password[0]}</p>
            )}
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-4">
          <Button type="submit" className="w-full" disabled={pending}>
            {pending ? "Signing in…" : "Sign in"}
          </Button>
          <p className="text-sm text-muted-foreground text-center">
            No account?{" "}
            <Link href="/register" className="text-primary hover:underline font-medium">
              Create one
            </Link>
          </p>
        </CardFooter>
      </form>
    </Card>
  );
}
