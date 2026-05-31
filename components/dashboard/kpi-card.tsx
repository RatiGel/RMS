import { Card, CardContent } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface KpiCardProps {
  title: string;
  value: string;
  change?: string;
  changeType?: "positive" | "negative" | "neutral";
  icon: LucideIcon;
  iconColor?: string;
}

export function KpiCard({ title, value, change, changeType = "neutral", icon: Icon, iconColor }: KpiCardProps) {
  return (
    <Card className="overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-200">
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="space-y-1.5 min-w-0">
            <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">{title}</p>
            <p className="text-2xl font-bold tracking-tight">{value}</p>
            {change && (
              <p className={cn("text-xs font-medium", {
                "text-emerald-600 dark:text-emerald-400": changeType === "positive",
                "text-red-500 dark:text-red-400": changeType === "negative",
                "text-muted-foreground": changeType === "neutral",
              })}>
                {change}
              </p>
            )}
          </div>
          <div className={cn("flex h-11 w-11 items-center justify-center rounded-xl flex-shrink-0", iconColor || "bg-primary/10")}>
            <Icon className={cn("h-5 w-5", iconColor ? "text-white" : "text-primary")} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
