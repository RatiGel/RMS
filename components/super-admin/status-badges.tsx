"use client";

export function PlanBadge({ plan }: { plan: string }) {
  const cfg: Record<string, string> = {
    pro: "bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300 border-purple-200 dark:border-purple-800",
    starter: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300 border-blue-200 dark:border-blue-800",
    trial: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300 border-amber-200 dark:border-amber-800",
  };
  return (
    <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-semibold capitalize ${cfg[plan] ?? "bg-muted text-muted-foreground"}`}>
      {plan}
    </span>
  );
}

export function StatusBadge({ status }: { status: string }) {
  const cfg: Record<string, string> = {
    active: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800",
    suspended: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300 border-red-200 dark:border-red-800",
    inactive: "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400 border-zinc-200 dark:border-zinc-700",
  };
  return (
    <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-semibold capitalize ${cfg[status] ?? "bg-muted text-muted-foreground"}`}>
      <span className={`mr-1.5 h-1.5 w-1.5 rounded-full ${status === "active" ? "bg-emerald-500" : status === "suspended" ? "bg-red-500" : "bg-zinc-400"}`} />
      {status}
    </span>
  );
}

export function RoleBadge({ role }: { role: string }) {
  return (
    <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-semibold capitalize ${
      role === "owner" ? "bg-primary/10 text-primary border-primary/20" : "bg-muted text-muted-foreground border-border"
    }`}>
      {role}
    </span>
  );
}
