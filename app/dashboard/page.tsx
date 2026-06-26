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
        <Skeleton className="h-28 w-full rounded-2xl" />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-28 rounded-xl" />
          ))}
        </div>
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <Skeleton className="lg:col-span-2 h-80 rounded-xl" />
          <Skeleton className="h-80 rounded-xl" />
        </div>
        <Skeleton className="h-64 rounded-xl" />
      </div>
    );
  }

  const firstName = session?.name?.split(" ")[0] ?? "there";

  // Month-over-month revenue delta, derived from existing series (no extra API field).
  const series = stats.revenueByMonth;
  const last = series.at(-1)?.revenue ?? 0;
  const prev = series.at(-2)?.revenue ?? 0;
  const revPct = prev > 0 ? Math.round(((last - prev) / prev) * 100) : null;
  const revChange =
    revPct === null
      ? t.dashboard.title
      : `${revPct >= 0 ? "+" : ""}${revPct}% ${t.dashboard.revenueVsLastMonth.replace(/\s*\{n\}.*$/, "").trim() || "vs last month"}`;

  const today = new Date().toLocaleDateString(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="space-y-6 rms-stagger">
      {/* Greeting hero */}
      <div className="relative overflow-hidden rounded-2xl brand-gradient p-6 sm:p-7 text-white shadow-lg shadow-primary/20">
        <div aria-hidden className="pointer-events-none absolute inset-0 rms-grid text-white/[0.07]" />
        <div aria-hidden className="pointer-events-none absolute -right-10 -top-16 h-48 w-48 rounded-full bg-white/10 blur-3xl" />
        <div className="relative flex items-center gap-4">
          <div className="hidden sm:flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-sm text-xl font-extrabold ring-1 ring-white/30">
            {firstName.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight truncate">
              Welcome back, {firstName}
            </h1>
            <p className="text-sm text-white/80 mt-1 truncate">
              {today} · {session?.orgName ?? ""}
            </p>
          </div>
        </div>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4 rms-stagger">
        <KpiCard
          title={t.dashboard.totalAssets}
          value={stats.totalAssets.toString()}
          change={`${stats.assetsByCategory.length} ${t.dashboard.categoryChart.toLowerCase()}`}
          changeType="neutral"
          icon={Package}
          color="indigo"
        />
        <KpiCard
          title={t.dashboard.activeBookings}
          value={stats.activeBookings.toString()}
          change={stats.activeBookings > 0 ? t.dashboard.recentBookings : t.dashboard.title}
          changeType="neutral"
          icon={CalendarDays}
          color="blue"
        />
        <KpiCard
          title={t.dashboard.monthlyRevenue}
          value={formatCurrency(stats.monthlyRevenue)}
          change={revChange}
          changeType={revPct === null ? "neutral" : revPct >= 0 ? "positive" : "negative"}
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
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <RevenueChart data={stats.revenueByMonth} />
        </div>
        <CategoryChart data={stats.assetsByCategory} />
      </div>

      {/* Recent bookings */}
      <RecentBookings bookings={stats.recentBookings} />
    </div>
  );
}
