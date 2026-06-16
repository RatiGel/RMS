"use client";

import { Package, CalendarDays, DollarSign, AlertTriangle } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { KpiCard } from "@/components/dashboard/kpi-card";
import { RevenueChart } from "@/components/dashboard/revenue-chart";
import { CategoryChart } from "@/components/dashboard/category-chart";
import { RecentBookings } from "@/components/dashboard/recent-bookings";
import { Skeleton } from "@/components/ui/skeleton";
import { useCurrency } from "@/contexts/currency-context";
import { useLanguage } from "@/contexts/language-context";
import { useSession } from "@/contexts/session-context";
import type { DashboardStats } from "@/types";

export default function DashboardPage() {
  const { t } = useLanguage();
  const { formatCurrency } = useCurrency();
  const session = useSession();

  const { data: stats, isLoading } = useQuery<DashboardStats>({
    queryKey: ["dashboard"],
    queryFn: () => fetch("/api/dashboard").then((r) => r.json()),
  });

  if (isLoading || !stats) {
    return (
      <div className="space-y-6">
        <div>
          <Skeleton className="h-7 w-48 rounded-lg mb-2" />
          <Skeleton className="h-4 w-64 rounded-lg" />
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-28 rounded-xl" />
          ))}
        </div>
        <div className="grid grid-cols-3 gap-4">
          <Skeleton className="col-span-2 h-72 rounded-xl" />
          <Skeleton className="h-72 rounded-xl" />
        </div>
        <Skeleton className="h-64 rounded-xl" />
      </div>
    );
  }

  const firstName = session?.name?.split(" ")[0] ?? "there";

  return (
    <div className="space-y-6">
      {/* Greeting */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Welcome back, {firstName}
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {t.dashboard.title} — {session?.orgName ?? ""}
          </p>
        </div>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard
          title={t.dashboard.totalAssets}
          value={stats.totalAssets.toString()}
          change={t.dashboard.assetsAddedThisMonth.replace("{n}", "—")}
          changeType="positive"
          icon={Package}
          color="indigo"
        />
        <KpiCard
          title={t.dashboard.activeBookings}
          value={stats.activeBookings.toString()}
          change={t.dashboard.bookingsEndingThisWeek.replace("{n}", "—")}
          changeType="neutral"
          icon={CalendarDays}
          color="blue"
        />
        <KpiCard
          title={t.dashboard.monthlyRevenue}
          value={formatCurrency(stats.monthlyRevenue)}
          change={t.dashboard.revenueVsLastMonth.replace("{n}", "—")}
          changeType="positive"
          icon={DollarSign}
          color="green"
        />
        <KpiCard
          title={t.dashboard.overdueInvoices}
          value={stats.overdueInvoices.toString()}
          change={t.dashboard.requiresAction.replace("{n}", stats.overdueInvoices.toString())}
          changeType={stats.overdueInvoices > 0 ? "negative" : "positive"}
          icon={AlertTriangle}
          color="red"
        />
      </div>

      {/* Charts — bento grid */}
      <div className="grid grid-cols-3 gap-4">
        <div className="col-span-2">
          <RevenueChart data={stats.revenueByMonth} />
        </div>
        <CategoryChart data={stats.assetsByCategory} />
      </div>

      {/* Recent bookings */}
      <div className="grid grid-cols-3 gap-4">
        <div className="col-span-3">
          <RecentBookings bookings={stats.recentBookings} />
        </div>
      </div>
    </div>
  );
}
