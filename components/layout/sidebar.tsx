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
  const { plan, canAccessInvoices } = useSubscription();

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
        "relative flex h-screen flex-col border-r bg-card shadow-sm transition-all duration-300",
        collapsed ? "w-16" : "w-60"
      )}
    >
      <div className="flex h-16 items-center gap-2.5 px-4 border-b">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground flex-shrink-0 shadow-sm">
          <Building2 className="h-4 w-4" />
        </div>
        {!collapsed && (
          <div className="flex flex-col">
            <span className="font-bold text-base tracking-tight leading-tight">RMS</span>
            <span className="text-[10px] text-muted-foreground leading-tight font-medium tracking-wide uppercase">Rental System</span>
          </div>
        )}
      </div>

      <nav className="flex-1 overflow-y-auto py-4 px-2 space-y-0.5">
        {navItems.map(({ href, label, icon: Icon, locked }) => {
          const active = pathname === href || (href !== "/dashboard" && pathname.startsWith(href));
          if (locked) {
            return (
              <span
                key={href}
                onClick={() => setUpgradeOpen(true)}
                className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-150 cursor-pointer text-muted-foreground/50 hover:bg-accent/50"
              >
                <Icon className="h-4 w-4 flex-shrink-0 opacity-50" />
                {!collapsed && <span className="flex-1">{label}</span>}
                {!collapsed && <Lock className="h-3 w-3 opacity-60" />}
              </span>
            );
          }
          return (
            <Link key={href} href={href}>
              <span
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-150 cursor-pointer",
                  active
                    ? "bg-primary text-primary-foreground shadow-sm"
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

      <Button
        variant="ghost"
        size="icon"
        className="absolute -right-3 top-20 h-6 w-6 rounded-full border bg-background shadow-sm cursor-pointer"
        onClick={() => setCollapsed(!collapsed)}
      >
        <ChevronLeft className={cn("h-3 w-3 transition-transform", collapsed && "rotate-180")} />
      </Button>
    </aside>
  );
}
