"use client";

import { useActionState } from "react";
import { adminLogin } from "@/app/actions/admin-auth";
import { Loader2, ShieldAlert } from "lucide-react";

export default function AdminLoginPage() {
  const [state, action, isPending] = useActionState(adminLogin, null);

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center space-y-2">
          <ShieldAlert className="mx-auto h-10 w-10 text-red-500" />
          <h1 className="text-xl font-bold tracking-tight">Admin Access</h1>
          <p className="text-sm text-zinc-400">Restricted area. Site owner only.</p>
        </div>

        <form action={action} className="space-y-4">
          <div className="space-y-1.5">
            <label htmlFor="password" className="text-sm font-medium text-zinc-300">
              Admin Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              autoFocus
              className="w-full rounded-md border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-red-500"
              placeholder="Enter admin password"
            />
          </div>

          {state?.error && (
            <p className="text-sm text-red-400">{state.error}</p>
          )}

          <button
            type="submit"
            disabled={isPending}
            className="w-full flex items-center justify-center gap-2 rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50 cursor-pointer transition-colors"
          >
            {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
            {isPending ? "Verifying…" : "Enter Admin Panel"}
          </button>
        </form>
      </div>
    </div>
  );
}
