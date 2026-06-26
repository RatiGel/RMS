import { LucideIcon, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { cn } from "@/lib/utils";

type KpiColor = "indigo" | "blue" | "green" | "red" | "orange" | "purple";

const colorMap: Record<KpiColor, { glow: string; iconBg: string; iconText: string }> = {
  indigo:  { glow: "from-violet-500/15",  iconBg: "bg-violet-500/10 dark:bg-violet-500/15",  iconText: "text-violet-600 dark:text-violet-400" },
  blue:    { glow: "from-blue-500/15",    iconBg: "bg-blue-500/10 dark:bg-blue-500/15",    iconText: "text-blue-600 dark:text-blue-400" },
  green:   { glow: "from-emerald-500/15", iconBg: "bg-emerald-500/10 dark:bg-emerald-500/15", iconText: "text-emerald-600 dark:text-emerald-400" },
  red:     { glow: "from-red-500/15",     iconBg: "bg-red-500/10 dark:bg-red-500/15",     iconText: "text-red-600 dark:text-red-400" },
  orange:  { glow: "from-orange-500/15",  iconBg: "bg-orange-500/10 dark:bg-orange-500/15",  iconText: "text-orange-600 dark:text-orange-400" },
  purple:  { glow: "from-primary/15",     iconBg: "bg-primary/10",                         iconText: "text-primary" },
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
  const { glow, iconBg, iconText } = colorMap[color] ?? colorMap.purple;
  const Trend = changeType === "positive" ? ArrowUpRight : changeType === "negative" ? ArrowDownRight : null;
  return (
    <div className="group relative overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-primary/5 hover:border-primary/20 cursor-default">
      {/* corner glow */}
      <div className={cn("pointer-events-none absolute -right-8 -top-8 h-28 w-28 rounded-full bg-gradient-to-br to-transparent blur-2xl opacity-0 transition-opacity duration-300 group-hover:opacity-100", glow)} />
      <div className="relative p-5">
        <div className="flex items-start justify-between gap-3">
          <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider truncate">{title}</p>
          <div className={cn(
            "flex h-11 w-11 items-center justify-center rounded-xl flex-shrink-0 transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-3",
            iconBg
          )}>
            <Icon className={cn("h-[22px] w-[22px]", iconText)} />
          </div>
        </div>
        <p className="mt-3 text-3xl font-extrabold tracking-tight tabular-nums">{value}</p>
        {change && (
          <p className={cn("mt-1.5 flex items-center gap-1 text-xs font-semibold", {
            "text-emerald-600 dark:text-emerald-400": changeType === "positive",
            "text-red-500 dark:text-red-400": changeType === "negative",
            "text-muted-foreground": changeType === "neutral",
          })}>
            {Trend && <Trend className="h-3.5 w-3.5" />}
            {change}
          </p>
        )}
      </div>
    </div>
  );
}
