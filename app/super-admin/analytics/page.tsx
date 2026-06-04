"use client";

import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, BarChart, Bar, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DollarSign, TrendingUp, CalendarDays, BarChart3 } from "lucide-react";
import { PlanBadge } from "@/components/super-admin/status-badges";
import { KpiCard } from "@/components/dashboard/kpi-card";

export default function AnalyticsPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["sa-analytics"],
    queryFn: () => fetch("/api/super-admin/analytics").then((r) => r.json()),
  });

  if (isLoading || !data) return (
    <div className="space-y-6">
      <Skeleton className="h-8 w-48" />
      <div className="grid grid-cols-2 gap-4">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-72 rounded-xl" />)}</div>
    </div>
  );

  const totalRevenue = data.mrrHistory?.reduce((s: number, m: { revenue: number }) => s + m.revenue, 0) ?? 0;
  const totalBookings = data.bookingsHistory?.reduce((s: number, m: { count: number }) => s + m.count, 0) ?? 0;
  const latestMonth = data.mrrHistory?.[data.mrrHistory.length - 1];
  const prevMonth = data.mrrHistory?.[data.mrrHistory.length - 2];
  const mrrGrowth = prevMonth?.revenue > 0 ? Math.round(((latestMonth?.revenue - prevMonth?.revenue) / prevMonth.revenue) * 100) : null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Platform Analytics</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Revenue, bookings, and growth metrics across all tenants</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-4 gap-4">
        <KpiCard title="Total Revenue (12mo)" value={`$${totalRevenue.toLocaleString()}`} icon={DollarSign} iconColor="bg-emerald-500"
          change={mrrGrowth !== null ? `${mrrGrowth > 0 ? "+" : ""}${mrrGrowth}% vs last month` : "No comparison"} changeType={mrrGrowth !== null && mrrGrowth >= 0 ? "positive" : "negative"} />
        <KpiCard title="Current MRR" value={`$${(latestMonth?.revenue ?? 0).toLocaleString()}`} icon={TrendingUp} iconColor="bg-blue-500" change="This month" changeType="neutral" />
        <KpiCard title="Total Bookings (12mo)" value={totalBookings.toLocaleString()} icon={CalendarDays} iconColor="bg-purple-500" change="All tenants" changeType="neutral" />
        <KpiCard title="Revenue Tenants" value={String(data.perTenant?.length ?? 0)} icon={BarChart3} iconColor="bg-amber-500" change="With paid invoices" changeType="neutral" />
      </div>

      <div className="grid grid-cols-2 gap-4">
        {/* MRR chart */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold">Monthly Recurring Revenue</CardTitle>
            <p className="text-xs text-muted-foreground">Last 12 months</p>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={data.mrrHistory} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="mrrGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
                <Tooltip formatter={(v) => [`$${Number(v).toLocaleString()}`, "Revenue"]} contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid hsl(var(--border))", background: "hsl(var(--card))" }} />
                <Area type="monotone" dataKey="revenue" stroke="hsl(var(--primary))" strokeWidth={2} fill="url(#mrrGrad)" dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Bookings chart */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold">Total Bookings</CardTitle>
            <p className="text-xs text-muted-foreground">Last 12 months</p>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={data.bookingsHistory} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid hsl(var(--border))", background: "hsl(var(--card))" }} />
                <Bar dataKey="count" fill="hsl(var(--primary))" radius={[3, 3, 0, 0]} name="Bookings" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Tenant growth */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-semibold">Tenant Growth</CardTitle>
          <p className="text-xs text-muted-foreground">Cumulative organizations + new per month</p>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={data.tenantGrowth} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid hsl(var(--border))", background: "hsl(var(--card))" }} />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Line type="monotone" dataKey="cumulative" stroke="hsl(var(--primary))" strokeWidth={2} dot={false} name="Total tenants" />
              <Line type="monotone" dataKey="count" stroke="hsl(142 76% 36%)" strokeWidth={2} dot={false} strokeDasharray="4 4" name="New this month" />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Per-tenant breakdown */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-semibold">Revenue by Tenant</CardTitle>
          <p className="text-xs text-muted-foreground">Top tenants by total paid revenue</p>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="pl-5">#</TableHead>
                <TableHead>Tenant</TableHead>
                <TableHead>Plan</TableHead>
                <TableHead className="text-right">Revenue</TableHead>
                <TableHead className="text-right">Invoices</TableHead>
                <TableHead className="text-right pr-5">Bookings</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.perTenant?.map((t: { id: string; name: string; plan: string; revenue: number; invoiceCount: number; bookingCount: number }, i: number) => (
                <TableRow key={t.id}>
                  <TableCell className="pl-5 text-xs text-muted-foreground">{i + 1}</TableCell>
                  <TableCell className="font-medium">{t.name}</TableCell>
                  <TableCell><PlanBadge plan={t.plan} /></TableCell>
                  <TableCell className="text-right tabular-nums font-semibold">${t.revenue.toLocaleString()}</TableCell>
                  <TableCell className="text-right tabular-nums text-muted-foreground">{t.invoiceCount}</TableCell>
                  <TableCell className="text-right tabular-nums text-muted-foreground pr-5">{t.bookingCount}</TableCell>
                </TableRow>
              ))}
              {data.perTenant?.length === 0 && (
                <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground py-8">No revenue data yet</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
