import { LucideIcon } from "lucide-react";

interface PageHeaderProps {
  icon?: LucideIcon;
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
}

/** Consistent modern page header used across dashboard inner pages. */
export function PageHeader({ icon: Icon, title, subtitle, action }: PageHeaderProps) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-4">
      <div className="flex items-center gap-3.5 min-w-0">
        {Icon && (
          <div className="hidden sm:flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-2xl brand-gradient text-white shadow-lg shadow-primary/20">
            <Icon className="h-[22px] w-[22px]" />
          </div>
        )}
        <div className="min-w-0">
          <h1 className="text-2xl font-extrabold tracking-tight truncate">{title}</h1>
          {subtitle && <p className="text-muted-foreground text-sm mt-0.5 truncate">{subtitle}</p>}
        </div>
      </div>
      {action && <div className="flex-shrink-0">{action}</div>}
    </div>
  );
}
