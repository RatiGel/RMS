import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

type KpiColor = "indigo" | "blue" | "green" | "red" | "orange" | "purple";

const colorMap: Record<KpiColor, { accent: string; iconBg: string; iconText: string }> = {
  indigo:  { accent: "bg-violet-500",  iconBg: "bg-violet-500/10 dark:bg-violet-500/15",  iconText: "text-violet-600 dark:text-violet-400" },
  blue:    { accent: "bg-blue-500",    iconBg: "bg-blue-500/10 dark:bg-blue-500/15",    iconText: "text-blue-600 dark:text-blue-400" },
  green:   { accent: "bg-emerald-500", iconBg: "bg-emerald-500/10 dark:bg-emerald-500/15", iconText: "text-emerald-600 dark:text-emerald-400" },
  red:     { accent: "bg-red-500",     iconBg: "bg-red-500/10 dark:bg-red-500/15",     iconText: "text-red-600 dark:text-red-400" },
  orange:  { accent: "bg-orange-500",  iconBg: "bg-orange-500/10 dark:bg-orange-500/15",  iconText: "text-orange-600 dark:text-orange-400" },
  purple:  { accent: "bg-primary",     iconBg: "bg-primary/10",                         iconText: "text-primary" },
};

interface KpiCardProps {
  title: string;
  value: string;
  change?: string;
  changeType?: "positive" | "negative" | "neutral";
  icon: LucideIcon;
  color?: KpiColor;
}

export function KpiCard({ title, value, change, changeType = "neutral", icon: Icon, color = "purple" }: KpiCardProps) {
  const { accent, iconBg, iconText } = colorMap[color] ?? colorMap.purple;
  return (
    <div className="relative bg-card rounded-xl border border-border overflow-hidden shadow-sm hover:shadow-md transition-all duration-200 hover:-translate-y-0.5 group cursor-default">
      <div className={cn("absolute top-0 left-0 right-0 h-0.5", accent)} />
      <div className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-1.5 min-w-0">
            <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider truncate">{title}</p>
            <p className="text-2xl font-bold tracking-tight tabular-nums">{value}</p>
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
          <div className={cn(
            "flex h-10 w-10 items-center justify-center rounded-xl flex-shrink-0 transition-transform duration-200 group-hover:scale-110",
            iconBg
          )}>
            <Icon className={cn("h-5 w-5", iconText)} />
          </div>
        </div>
      </div>
    </div>
  );
}
