"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { TrendingUp } from "lucide-react";
import { useCurrency } from "@/contexts/currency-context";
import { useLanguage } from "@/contexts/language-context";

interface RevenueChartProps {
  data: { month: string; revenue: number }[];
}

export function RevenueChart({ data }: RevenueChartProps) {
  const { t } = useLanguage();
  const { formatCurrency, currencySymbol } = useCurrency();
  const hasData = data.length > 0 && data.some((d) => d.revenue > 0);

  return (
    <Card className="h-full overflow-hidden">
      <CardHeader className="flex flex-row items-center gap-3 space-y-0">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <TrendingUp className="h-[18px] w-[18px]" />
        </div>
        <CardTitle className="text-base font-semibold">{t.dashboard.revenueChart}</CardTitle>
      </CardHeader>
      <CardContent>
        {hasData ? (
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={data} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="revFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--color-primary)" stopOpacity={0.32} />
                  <stop offset="100%" stopColor="var(--color-primary)" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="revStroke" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="var(--brand-from)" />
                  <stop offset="100%" stopColor="var(--brand-to)" />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-border" />
              <XAxis
                dataKey="month"
                tick={{ fontSize: 12 }}
                tickLine={false}
                axisLine={false}
                className="text-muted-foreground"
              />
              <YAxis
                tick={{ fontSize: 12 }}
                tickLine={false}
                axisLine={false}
                width={48}
                tickFormatter={(v) => `${currencySymbol}${(v / 1000).toFixed(0)}k`}
                className="text-muted-foreground"
              />
              <Tooltip
                cursor={{ stroke: "var(--color-border)", strokeWidth: 1 }}
                formatter={(value) => [formatCurrency(Number(value)), t.dashboard.monthlyRevenue]}
                contentStyle={{
                  fontSize: 12,
                  borderRadius: 8,
                  border: "1px solid var(--color-border)",
                  background: "var(--color-popover)",
                  boxShadow: "0 4px 12px rgb(0 0 0 / 0.08)",
                }}
                labelStyle={{ fontWeight: 600, color: "var(--color-foreground)" }}
              />
              <Area
                type="monotone"
                dataKey="revenue"
                stroke="url(#revStroke)"
                strokeWidth={3}
                fill="url(#revFill)"
                dot={false}
                activeDot={{ r: 5, strokeWidth: 2, stroke: "var(--color-background)", fill: "var(--color-primary)" }}
              />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex h-[260px] flex-col items-center justify-center gap-2 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
              <TrendingUp className="h-5 w-5 text-muted-foreground" />
            </div>
            <p className="text-sm font-medium">{t.dashboard.revenueChart}</p>
            <p className="text-xs text-muted-foreground max-w-[200px]">
              {t.dashboard.revenueVsLastMonth.replace("{n}", "—")}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
