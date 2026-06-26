"use client";

import { useLanguage } from "@/contexts/language-context";
import { useCurrency, Currency } from "@/contexts/currency-context";
import { useSubscription } from "@/contexts/subscription-context";
import { Locale } from "@/lib/i18n/translations";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { UpgradeDialog } from "@/components/subscription/upgrade-dialog";
import { useTheme } from "next-themes";
import { Sun, Moon, Settings as SettingsIcon } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { useEffect, useState } from "react";

const LANGUAGES: Record<Locale, string> = {
  en: "English",
  ka: "ქართული",
  ru: "Русский",
};

const CURRENCIES: Record<Currency, string> = {
  USD: "USD ($)",
  GEL: "GEL (₾)",
};

const PLAN_COLORS: Record<string, string> = {
  trial: "bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300",
  starter: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  pro: "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400",
};

export default function SettingsPage() {
  const { locale, setLocale, t } = useLanguage();
  const { currency, setCurrency } = useCurrency();
  const { theme, setTheme } = useTheme();
  const { plan, trialDaysLeft, trialExpired, isLoading } = useSubscription();
  const [mounted, setMounted] = useState(false);
  const [upgradeOpen, setUpgradeOpen] = useState(false);
  useEffect(() => setMounted(true), []);

  const s = t.subscription;

  const THEMES = [
    { value: "light", label: t.settings.light, Icon: Sun },
    { value: "dark", label: t.settings.dark, Icon: Moon },
  ] as const;

  const planLabel = plan === "trial" ? s.trial : plan === "starter" ? s.starter : s.pro;
  const planDesc =
    plan === "trial"
      ? trialExpired
        ? s.trialExpired
        : s.trialBannerDays.replace("{n}", String(trialDaysLeft))
      : plan === "starter"
      ? s.assetLimit.replace("{n}", "20")
      : s.unlimitedAssets;

  return (
    <div className="max-w-2xl mx-auto space-y-6 rms-stagger">
      <PageHeader icon={SettingsIcon} title={t.settings.title} subtitle={t.settings.subtitle} />

      {/* Billing & Plan card */}
      <Card>
        <CardHeader>
          <CardTitle>{s.billing}</CardTitle>
          <CardDescription>{s.billingDesc}</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="h-10 bg-muted animate-pulse rounded-md" />
          ) : (
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${PLAN_COLORS[plan] ?? PLAN_COLORS.trial}`}>
                  {planLabel}
                </span>
                <span className="text-sm text-muted-foreground">{planDesc}</span>
              </div>
              {plan !== "pro" && (
                <Button
                  size="sm"
                  onClick={() => setUpgradeOpen(true)}
                  className="cursor-pointer shrink-0"
                >
                  {s.upgradeNow}
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <UpgradeDialog
        open={upgradeOpen}
        onOpenChange={setUpgradeOpen}
        currentPlan={plan}
      />

      <Card>
        <CardHeader>
          <CardTitle>{t.settings.appearance}</CardTitle>
          <CardDescription>{t.settings.appearanceDesc}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-2">
            {THEMES.map(({ value, label, Icon }) => (
              <button
                key={value}
                onClick={() => setTheme(value)}
                className={`flex items-center justify-center gap-2 rounded-lg border px-4 py-3 text-sm font-medium transition-colors cursor-pointer ${
                  mounted && theme === value
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border hover:bg-accent"
                }`}
              >
                <Icon className="h-4 w-4" />
                {label}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t.settings.language}</CardTitle>
          <CardDescription>{t.settings.languageDesc}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-2">
            {(Object.keys(LANGUAGES) as Locale[]).map((loc) => (
              <button
                key={loc}
                onClick={() => setLocale(loc)}
                className={`flex items-center justify-center rounded-lg border px-4 py-3 text-sm font-medium transition-colors cursor-pointer ${
                  locale === loc
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border hover:bg-accent"
                }`}
              >
                {LANGUAGES[loc]}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t.settings.currency}</CardTitle>
          <CardDescription>{t.settings.currencyDesc}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-2">
            {(Object.keys(CURRENCIES) as Currency[]).map((c) => (
              <button
                key={c}
                onClick={() => setCurrency(c)}
                className={`flex items-center justify-center rounded-lg border px-4 py-3 text-sm font-medium transition-colors cursor-pointer ${
                  currency === c
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border hover:bg-accent"
                }`}
              >
                {CURRENCIES[c]}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
