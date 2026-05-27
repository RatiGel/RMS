"use client";

import { Package, CalendarDays, DollarSign, AlertTriangle } from "lucide-react";
import { KpiCard } from "@/components/dashboard/kpi-card";
import { RevenueChart } from "@/components/dashboard/revenue-chart";
import { CategoryChart } from "@/components/dashboard/category-chart";
import { RecentBookings } from "@/components/dashboard/recent-bookings";
import { mockDashboardStats } from "@/lib/mock/dashboard";
import { useCurrency } from "@/contexts/currency-context";
import { useLanguage } from "@/contexts/language-context";

export default function DashboardPage() {
  const { t } = useLanguage();
  const { formatCurrency } = useCurrency();
  const stats = mockDashboardStats;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{t.dashboard.title}</h1>
        <p className="text-muted-foreground text-sm mt-1">AcmeCorp Rentals — May 2025</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard
          title={t.dashboard.totalAssets}
          value={stats.totalAssets.toString()}
          change={t.dashboard.assetsAddedThisMonth.replace("{n}", "4")}
          changeType="positive"
          icon={Package}
          iconColor="bg-indigo-500"
        />
        <KpiCard
          title={t.dashboard.activeBookings}
          value={stats.activeBookings.toString()}
          change={t.dashboard.bookingsEndingThisWeek.replace("{n}", "3")}
          changeType="neutral"
          icon={CalendarDays}
          iconColor="bg-blue-500"
        />
        <KpiCard
          title={t.dashboard.monthlyRevenue}
          value={formatCurrency(stats.monthlyRevenue)}
          change={t.dashboard.revenueVsLastMonth.replace("{n}", "12")}
          changeType="positive"
          icon={DollarSign}
          iconColor="bg-green-500"
        />
        <KpiCard
          title={t.dashboard.overdueInvoices}
          value={stats.overdueInvoices.toString()}
          change={t.dashboard.requiresAction.replace("{n}", "1")}
          changeType="negative"
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
