"use client";

import { useQuery } from "@tanstack/react-query";
import { KpiCard } from "@/components/dashboard/kpi-card";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Building2, Users2, CalendarDays, DollarSign, AlertTriangle, TrendingUp, Clock } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { formatDistanceToNow, format } from "date-fns";
import { PlanBadge, StatusBadge } from "@/components/super-admin/status-badges";
import Link from "next/link";

export default function SuperAdminDashboard() {
  const { data, isLoading } = useQuery({
    queryKey: ["sa-dashboard"],
    queryFn: () => fetch("/api/super-admin/dashboard").then((r) => r.json()),
    refetchInterval: 30_000,
  });

  if (isLoading || !data) {
    return (
      <div className="space-y-6">
        <div>
          <Skeleton className="h-7 w-48" />
          <Skeleton className="h-4 w-64 mt-2" />
        </div>
        <div className="grid grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-32 rounded-xl" />)}
        </div>
        <div className="grid grid-cols-3 gap-4">
          <Skeleton className="col-span-2 h-72 rounded-xl" />
          <Skeleton className="h-72 rounded-xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Platform Overview</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Live metrics across all tenant organizations</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard title="Total Tenants" value={String(data.totalTenants)} icon={Building2} color="purple" change="All organizations" changeType="neutral" />
        <KpiCard title="Active Tenants" value={String(data.activeTenants)} icon={Users2} color="blue"
          change={`${Math.round((data.activeTenants / Math.max(data.totalTenants, 1)) * 100)}% of total`} changeType="positive" />
        <KpiCard title="Bookings Today" value={String(data.totalBookingsToday)} icon={CalendarDays} color="indigo" change="Across all orgs" changeType="neutral" />
        <KpiCard title="Platform MRR" value={`$${data.platformMRR.toLocaleString()}`} icon={DollarSign} color="green" change="This month" changeType="positive" />
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-primary" /> New Tenant Signups — Last 6 Months
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={data.signupsByMonth} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 12 }} axisLine={false} tickLine={false} allowDecimals={false} />
                <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid hsl(var(--border))", background: "hsl(var(--card))" }} cursor={{ fill: "hsl(var(--muted))" }} />
                <Bar dataKey="count" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} name="New signups" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold">Recent Signups</CardTitle>
            <p className="text-xs text-muted-foreground">Last 7 days</p>
          </CardHeader>
          <CardContent className="space-y-3">
            {data.recentSignups.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4 text-center">No signups this week</p>
            ) : data.recentSignups.map((t: { id: string; name: string; plan: string; createdAt: string }) => (
              <div key={t.id} className="flex items-center justify-between gap-2">
                <div className="min-w-0">
                  <p className="text-sm font-medium truncate">{t.name}</p>
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {formatDistanceToNow(new Date(t.createdAt), { addSuffix: true })}
                  </p>
                </div>
                <PlanBadge plan={t.plan} />
              </div>
            ))}
            {data.recentSignups.length > 0 && (
              <Link href="/super-admin/tenants" className="block text-center text-xs text-primary hover:underline pt-1">View all tenants →</Link>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Bottom row */}
      <div className="grid grid-cols-2 gap-4">
        {/* Top tenants */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold">Top 10 Active Tenants</CardTitle>
            <p className="text-xs text-muted-foreground">By bookings this month</p>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y">
              {data.topTenants.length === 0 && (
                <p className="text-sm text-muted-foreground px-6 py-4">No booking data yet</p>
              )}
              {data.topTenants.map((t: { id: string; name: string; plan: string; status: string; bookingsThisMonth: number }, i: number) => (
                <div key={t.id} className="flex items-center gap-3 px-6 py-2.5 hover:bg-muted/50 transition-colors">
                  <span className="text-xs font-bold text-muted-foreground w-5 text-right flex-shrink-0">{i + 1}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{t.name}</p>
                  </div>
                  <PlanBadge plan={t.plan} />
                  <span className="text-sm font-bold tabular-nums text-primary min-w-[2rem] text-right">{t.bookingsThisMonth}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Churn risk */}
        <Card className="border-amber-200 dark:border-amber-800/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-amber-500" /> Churn Risk
            </CardTitle>
            <p className="text-xs text-muted-foreground">No login in 14+ days (paid plans)</p>
          </CardHeader>
          <CardContent className="p-0">
            {data.churnRisk.length === 0 ? (
              <div className="px-6 py-6 text-center">
                <div className="text-2xl mb-1">✓</div>
                <p className="text-sm text-muted-foreground">No churn risk detected</p>
              </div>
            ) : (
              <div className="divide-y">
                {data.churnRisk.map((t: { id: string; name: string; plan: string; reason: string; lastLoginAt: string | null }) => (
                  <div key={t.id} className="flex items-center gap-3 px-6 py-2.5">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{t.name}</p>
                      <p className="text-xs text-amber-600 dark:text-amber-400">
                        {t.lastLoginAt ? `Last seen ${formatDistanceToNow(new Date(t.lastLoginAt), { addSuffix: true })}` : t.reason}
                      </p>
                    </div>
                    <PlanBadge plan={t.plan} />
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
