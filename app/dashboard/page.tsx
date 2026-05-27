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
import type { DashboardStats } from "@/types";

export default function DashboardPage() {
  const { t } = useLanguage();
  const { formatCurrency } = useCurrency();

  const { data: stats, isLoading } = useQuery<DashboardStats>({
    queryKey: ["dashboard"],
    queryFn: () => fetch("/api/dashboard").then((r) => r.json()),
  });

  if (isLoading || !stats) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{t.dashboard.title}</h1>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-32 rounded-xl" />
          ))}
        </div>
        <Skeleton className="h-64 rounded-xl" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{t.dashboard.title}</h1>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard
          title={t.dashboard.totalAssets}
          value={stats.totalAssets.toString()}
          change={t.dashboard.assetsAddedThisMonth.replace("{n}", "—")}
          changeType="positive"
          icon={Package}
          iconColor="bg-indigo-500"
        />
        <KpiCard
          title={t.dashboard.activeBookings}
          value={stats.activeBookings.toString()}
          change={t.dashboard.bookingsEndingThisWeek.replace("{n}", "—")}
          changeType="neutral"
          icon={CalendarDays}
          iconColor="bg-blue-500"
        />
        <KpiCard
          title={t.dashboard.monthlyRevenue}
          value={formatCurrency(stats.monthlyRevenue)}
          change={t.dashboard.revenueVsLastMonth.replace("{n}", "—")}
          changeType="positive"
          icon={DollarSign}
          iconColor="bg-green-500"
        />
        <KpiCard
          title={t.dashboard.overdueInvoices}
          value={stats.overdueInvoices.toString()}
          change={t.dashboard.requiresAction.replace("{n}", stats.overdueInvoices.toString())}
          changeType={stats.overdueInvoices > 0 ? "negative" : "positive"}
          icon={AlertTriangle}
          iconColor="bg-red-500"
        />
      </div>

      <div className="grid grid-cols-3 gap-4">
        <RevenueChart data={stats.revenueByMonth} />
        <CategoryChart data={stats.assetsByCategory} />
      </div>

      <div className="grid grid-cols-3 gap-4">
        <RecentBookings bookings={stats.recentBookings} />
      </div>
    </div>
  );
}
