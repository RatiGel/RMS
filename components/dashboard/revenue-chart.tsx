"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { useCurrency } from "@/contexts/currency-context";
import { useLanguage } from "@/contexts/language-context";

interface RevenueChartProps {
  data: { month: string; revenue: number }[];
}

export function RevenueChart({ data }: RevenueChartProps) {
  const { t } = useLanguage();
  const { formatCurrency, currencySymbol } = useCurrency();
  return (
    <Card className="col-span-2">
      <CardHeader>
        <CardTitle className="text-base font-semibold">{t.dashboard.revenueChart}</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={240}>
          <LineChart data={data} margin={{ top: 4, right: 16, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
            <XAxis dataKey="month" tick={{ fontSize: 12 }} className="text-muted-foreground" />
            <YAxis
              tick={{ fontSize: 12 }}
              tickFormatter={(v) => `${currencySymbol}${(v / 1000).toFixed(0)}k`}
              className="text-muted-foreground"
            />
            <Tooltip
              formatter={(value) => [formatCurrency(Number(value)), "Revenue"]}
              contentStyle={{ fontSize: 12, borderRadius: 6 }}
            />
            <Line
              type="monotone"
              dataKey="revenue"
              stroke="var(--color-primary)"
              strokeWidth={2}
              dot={{ r: 4, fill: "var(--color-primary)" }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
