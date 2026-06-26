"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  CalendarDays,
  Users,
  FileText,
  ChevronLeft,
  Lock,
  Zap,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useLanguage } from "@/contexts/language-context";
import { useSubscription } from "@/contexts/subscription-context";
import { UpgradeDialog } from "@/components/subscription/upgrade-dialog";

export function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [upgradeOpen, setUpgradeOpen] = useState(false);
  const { t } = useLanguage();
  const { plan, canAccessInvoices, trialDaysLeft } = useSubscription();

  const navItems = [
    { href: "/dashboard", label: t.nav.dashboard, icon: LayoutDashboard, locked: false },
    { href: "/dashboard/inventory", label: t.nav.inventory, icon: Package, locked: false },
    { href: "/dashboard/bookings", label: t.nav.bookings, icon: CalendarDays, locked: false },
    { href: "/dashboard/customers", label: t.nav.customers, icon: Users, locked: false },
    { href: "/dashboard/invoices", label: t.nav.invoices, icon: FileText, locked: !canAccessInvoices },
  ];

  return (
    <aside
      className={cn(
        "relative flex h-screen flex-col border-r border-border bg-card/80 backdrop-blur-xl transition-all duration-300",
        collapsed ? "w-[60px]" : "w-[228px]"
      )}
    >
      {/* Logo */}
      <div className={cn("flex h-16 items-center border-b border-border", collapsed ? "justify-center px-3" : "px-4")}>
        {collapsed ? (
          <span className="font-extrabold text-xl tracking-tight brand-text">Q</span>
        ) : (
          <span className="font-extrabold text-xl tracking-tight brand-text">Qiravo</span>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-4 px-2.5 space-y-1">
        {!collapsed && (
          <p className="px-2.5 pb-1.5 pt-1 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">
            {t.nav.dashboard}
          </p>
        )}
        {navItems.map(({ href, label, icon: Icon, locked }) => {
          const active = pathname === href || (href !== "/dashboard" && pathname.startsWith(href));
          if (locked) {
            return (
              <button
                key={href}
                type="button"
                onClick={() => setUpgradeOpen(true)}
                className={cn(
                  "group w-full flex items-center rounded-xl px-2.5 py-2.5 text-sm font-medium transition-all duration-150 cursor-pointer text-muted-foreground/50 hover:bg-accent/40 hover:text-muted-foreground",
                  collapsed ? "justify-center gap-0" : "gap-3"
                )}
                title={collapsed ? label : undefined}
              >
                <Icon className="h-[18px] w-[18px] flex-shrink-0 opacity-50" />
                {!collapsed && <span className="flex-1 text-left">{label}</span>}
                {!collapsed && <Lock className="h-3 w-3 opacity-40" />}
              </button>
            );
          }
          return (
            <Link key={href} href={href} title={collapsed ? label : undefined}>
              <span
                className={cn(
                  "group relative flex items-center rounded-xl px-2.5 py-2.5 text-sm font-medium transition-all duration-200 cursor-pointer",
                  collapsed ? "justify-center gap-0" : "gap-3",
                  active
                    ? "brand-gradient text-white shadow-lg shadow-primary/25"
                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground hover:translate-x-0.5"
                )}
              >
                {active && !collapsed && (
                  <span className="absolute -left-2.5 top-1/2 h-5 w-1 -translate-y-1/2 rounded-r-full bg-white/80" />
                )}
                <Icon className={cn("h-[18px] w-[18px] flex-shrink-0 transition-transform duration-200", !active && "group-hover:scale-110")} />
                {!collapsed && <span>{label}</span>}
              </span>
            </Link>
          );
        })}
      </nav>

      <UpgradeDialog open={upgradeOpen} onOpenChange={setUpgradeOpen} currentPlan={plan} />

      {/* Plan badge */}
      <div className={cn("border-t border-border py-3 px-2.5", collapsed && "flex justify-center")}>
        {!collapsed ? (
          <button
            type="button"
            onClick={() => plan === "trial" && setUpgradeOpen(true)}
            className={cn(
              "w-full flex items-center gap-2 px-2.5 py-2 rounded-xl transition-all text-left",
              plan === "pro"
                ? "brand-gradient text-white shadow-md shadow-primary/20 cursor-default"
                : plan === "trial"
                ? "cursor-pointer hover:bg-accent border border-amber-500/30 bg-amber-500/5"
                : "cursor-default hover:bg-accent"
            )}
          >
            {plan === "pro" ? (
              <div className="h-5 w-5 rounded-md bg-white/20 flex items-center justify-center flex-shrink-0">
                <Zap className="h-3 w-3 text-white" />
              </div>
            ) : (
              <div className={cn(
                "h-2 w-2 rounded-full flex-shrink-0 mt-px",
                plan === "starter" ? "bg-blue-500" : "bg-amber-500"
              )} />
            )}
            <span className={cn("text-xs font-semibold capitalize", plan === "pro" ? "text-white" : "text-muted-foreground")}>{plan}</span>
            {plan === "trial" && trialDaysLeft !== null && (
              <span className="ml-auto text-[10px] text-amber-600 dark:text-amber-400 font-bold tabular-nums">
                {trialDaysLeft}d
              </span>
            )}
          </button>
        ) : (
          <div className={cn(
            "h-2.5 w-2.5 rounded-full",
            plan === "pro" ? "bg-primary" : plan === "starter" ? "bg-blue-500" : "bg-amber-500"
          )} />
        )}
      </div>

      {/* Collapse toggle */}
      <Button
        variant="ghost"
        size="icon"
        className="absolute -right-3 top-20 h-6 w-6 rounded-full border bg-background shadow-sm cursor-pointer hover:shadow-md transition-shadow"
        onClick={() => setCollapsed(!collapsed)}
      >
        <ChevronLeft className={cn("h-3 w-3 transition-transform duration-300", collapsed && "rotate-180")} />
      </Button>
    </aside>
  );
}
