"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { PieChart as PieIcon } from "lucide-react";
import { useLanguage } from "@/contexts/language-context";

const COLORS = [
  "var(--color-chart-1)",
  "var(--color-chart-2)",
  "var(--color-chart-3)",
  "var(--color-chart-4)",
  "var(--color-chart-5)",
];

interface CategoryChartProps {
  data: { name: string; count: number }[];
}

export function CategoryChart({ data }: CategoryChartProps) {
  const { t } = useLanguage();
  const hasData = data.length > 0;
  const total = data.reduce((s, d) => s + d.count, 0);

  return (
    <Card className="h-full">
      <CardHeader className="flex flex-row items-center gap-3 space-y-0">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet-500/10 text-violet-600 dark:text-violet-400">
          <PieIcon className="h-[18px] w-[18px]" />
        </div>
        <CardTitle className="text-base font-semibold">{t.dashboard.categoryChart}</CardTitle>
      </CardHeader>
      <CardContent>
        {hasData ? (
          <div className="relative">
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie
                  data={data}
                  dataKey="count"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={62}
                  outerRadius={88}
                  paddingAngle={3}
                  stroke="var(--color-card)"
                  strokeWidth={2}
                >
                  {data.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    fontSize: 12,
                    borderRadius: 8,
                    border: "1px solid var(--color-border)",
                    background: "var(--color-popover)",
                    boxShadow: "0 4px 12px rgb(0 0 0 / 0.08)",
                  }}
                />
                <Legend iconSize={9} iconType="circle" wrapperStyle={{ fontSize: 11, paddingTop: 8 }} />
              </PieChart>
            </ResponsiveContainer>
            {/* Center total — sits over the donut hole */}
            <div className="pointer-events-none absolute inset-x-0 top-[88px] -translate-y-1/2 flex flex-col items-center">
              <span className="text-2xl font-bold tracking-tight tabular-nums">{total}</span>
              <span className="text-[11px] text-muted-foreground font-medium uppercase tracking-wider">
                {t.dashboard.totalAssets}
              </span>
            </div>
          </div>
        ) : (
          <div className="flex h-[260px] flex-col items-center justify-center gap-2 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
              <PieIcon className="h-5 w-5 text-muted-foreground" />
            </div>
            <p className="text-sm font-medium">{t.dashboard.categoryChart}</p>
            <p className="text-xs text-muted-foreground">{t.dashboard.totalAssets}: 0</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
