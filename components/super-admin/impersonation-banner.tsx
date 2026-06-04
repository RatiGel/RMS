"use client";

import { ShieldCheck, AlertTriangle } from "lucide-react";
import { exitImpersonation } from "@/app/actions/super-admin-auth";

interface ImpersonationBannerProps {
  orgName: string;
  isSelf?: boolean;
}

export function ImpersonationBanner({ orgName, isSelf = false }: ImpersonationBannerProps) {
  if (isSelf) {
    return (
      <div className="flex items-center justify-between bg-primary text-primary-foreground px-4 py-2 text-sm font-medium">
        <div className="flex items-center gap-2">
          <ShieldCheck className="h-4 w-4 flex-shrink-0" />
          <span>Viewing as tenant: <strong>{orgName}</strong></span>
        </div>
        <form action={exitImpersonation}>
          <button
            type="submit"
            className="rounded-md bg-primary-foreground/20 px-3 py-1 text-xs font-semibold hover:bg-primary-foreground/30 transition-colors"
          >
            ← Back to Super Admin
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between bg-amber-500 text-amber-950 px-4 py-2 text-sm font-medium">
      <div className="flex items-center gap-2">
        <AlertTriangle className="h-4 w-4 flex-shrink-0" />
        <span>Impersonating <strong>{orgName}</strong> — Super Admin session active</span>
      </div>
      <form action={exitImpersonation}>
        <button
          type="submit"
          className="rounded-md bg-amber-950/20 px-3 py-1 text-xs font-semibold hover:bg-amber-950/30 transition-colors"
        >
          Exit Impersonation
        </button>
      </form>
    </div>
  );
}
