"use client";

import { useActionState } from "react";
import Link from "next/link";
import { signup } from "@/app/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

export default function RegisterPage() {
  const [state, action, pending] = useActionState(signup, undefined);

  return (
    <Card>
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold">Create account</CardTitle>
        <CardDescription>Set up your organization and get started with RMS</CardDescription>
      </CardHeader>
      <form action={action}>
        <CardContent className="space-y-4">
          {state?.message && (
            <p className="text-sm text-destructive bg-destructive/10 rounded-md px-3 py-2">
              {state.message}
            </p>
          )}

          <div className="space-y-2">
            <Label htmlFor="orgName">Organization name</Label>
            <Input id="orgName" name="orgName" placeholder="Acme Rentals" required />
            {state?.errors?.orgName && (
              <p className="text-xs text-destructive">{state.errors.orgName[0]}</p>
            )}
          </div>

          <Separator />

          <div className="space-y-2">
            <Label htmlFor="name">Your name</Label>
            <Input id="name" name="name" placeholder="John Doe" required />
            {state?.errors?.name && (
              <p className="text-xs text-destructive">{state.errors.name[0]}</p>
            )}
          </div>
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
              <ul className="text-xs text-destructive space-y-1">
                {state.errors.password.map((e) => (
                  <li key={e}>- {e}</li>
                ))}
              </ul>
            )}
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-4">
          <Button type="submit" className="w-full" disabled={pending}>
            {pending ? "Creating account…" : "Create account"}
          </Button>
          <p className="text-sm text-muted-foreground text-center">
            Already have an account?{" "}
            <Link href="/login" className="text-primary hover:underline font-medium">
              Sign in
            </Link>
          </p>
        </CardFooter>
      </form>
    </Card>
  );
}
