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
  Building2,
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
        "relative flex h-screen flex-col border-r border-border bg-card transition-all duration-300",
        collapsed ? "w-[60px]" : "w-[220px]"
      )}
    >
      {/* Logo */}
      <div className={cn("flex h-16 items-center border-b border-border", collapsed ? "justify-center px-3" : "gap-2.5 px-4")}>
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground flex-shrink-0 shadow-sm shadow-primary/25">
          <Building2 className="h-4 w-4" />
        </div>
        {!collapsed && (
          <div className="flex flex-col min-w-0">
            <span className="font-bold text-sm tracking-tight leading-tight">RMS</span>
            <span className="text-[9px] text-muted-foreground leading-tight font-semibold tracking-widest uppercase">Rental System</span>
          </div>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-0.5">
        {navItems.map(({ href, label, icon: Icon, locked }) => {
          const active = pathname === href || (href !== "/dashboard" && pathname.startsWith(href));
          if (locked) {
            return (
              <button
                key={href}
                type="button"
                onClick={() => setUpgradeOpen(true)}
                className={cn(
                  "w-full flex items-center rounded-lg px-2.5 py-2 text-sm font-medium transition-all duration-150 cursor-pointer text-muted-foreground/50 hover:bg-accent/40 hover:text-muted-foreground",
                  collapsed ? "justify-center gap-0" : "gap-3"
                )}
              >
                <Icon className="h-4 w-4 flex-shrink-0 opacity-50" />
                {!collapsed && <span className="flex-1 text-left">{label}</span>}
                {!collapsed && <Lock className="h-3 w-3 opacity-40" />}
              </button>
            );
          }
          return (
            <Link key={href} href={href}>
              <span
                className={cn(
                  "flex items-center rounded-lg px-2.5 py-2 text-sm font-medium transition-all duration-150 cursor-pointer",
                  collapsed ? "justify-center gap-0" : "gap-3",
                  active
                    ? "bg-primary text-primary-foreground shadow-sm shadow-primary/20"
                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                )}
              >
                <Icon className="h-4 w-4 flex-shrink-0" />
                {!collapsed && <span>{label}</span>}
              </span>
            </Link>
          );
        })}
      </nav>

      <UpgradeDialog open={upgradeOpen} onOpenChange={setUpgradeOpen} currentPlan={plan} />

      {/* Plan badge */}
      <div className={cn("border-t border-border py-3 px-2", collapsed && "flex justify-center")}>
        {!collapsed ? (
          <button
            type="button"
            onClick={() => plan === "trial" && setUpgradeOpen(true)}
            className={cn(
              "w-full flex items-center gap-2 px-2.5 py-2 rounded-lg transition-colors text-left",
              plan === "trial" ? "cursor-pointer hover:bg-accent" : "cursor-default"
            )}
          >
            {plan === "pro" ? (
              <div className="h-5 w-5 rounded-md bg-primary/15 flex items-center justify-center flex-shrink-0">
                <Zap className="h-3 w-3 text-primary" />
              </div>
            ) : (
              <div className={cn(
                "h-2 w-2 rounded-full flex-shrink-0 mt-px",
                plan === "starter" ? "bg-blue-500" : "bg-amber-500"
              )} />
            )}
            <span className="text-xs font-semibold capitalize text-muted-foreground">{plan}</span>
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
