"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useLanguage } from "@/contexts/language-context";
import { Locale } from "@/lib/i18n/translations";
import {
  Building2,
  Package,
  CalendarDays,
  Users,
  FileText,
  TrendingUp,
  Shield,
  Zap,
  Sun,
  Moon,
} from "lucide-react";

const localeLabels: Record<Locale, string> = {
  en: "EN",
  ka: "ქარ",
  ru: "РУ",
};

export default function LandingPage() {
  const [dark, setDark] = useState(false);
  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
  }, [dark]);
  const { t, locale, setLocale } = useLanguage();
  const l = t.landing;

  const features = [
    { icon: Package, ...l.features.inventory },
    { icon: CalendarDays, ...l.features.bookings },
    { icon: FileText, ...l.features.invoicing },
    { icon: Users, ...l.features.team },
  ];

  const stats = [
    { value: "500+", label: l.stats.organizations, icon: Building2 },
    { value: "12,000+", label: l.stats.assetsTracked, icon: Package },
    { value: "98%", label: l.stats.uptime, icon: Shield },
    { value: "3×", label: l.stats.fasterBookings, icon: TrendingUp },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      {/* Nav */}
      <nav className="sticky top-0 z-50 bg-white/95 dark:bg-slate-900/95 backdrop-blur border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-6 flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-500 text-white">
              <Building2 className="h-4 w-4" />
            </div>
            <span className="font-bold text-lg text-slate-900 dark:text-white tracking-tight">RMS</span>
          </div>

          <div className="flex items-center gap-2">
            {/* Language switcher */}
            <div className="flex items-center rounded-md border border-slate-200 dark:border-slate-700 overflow-hidden text-xs font-medium">
              {(Object.keys(localeLabels) as Locale[]).map((loc) => (
                <button
                  key={loc}
                  onClick={() => setLocale(loc)}
                  className={`px-2.5 py-1.5 transition-colors ${
                    locale === loc
                      ? "bg-indigo-500 text-white"
                      : "text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                  }`}
                >
                  {localeLabels[loc]}
                </button>
              ))}
            </div>

            {/* Theme toggle */}
            <button
              onClick={() => setDark(d => !d)}
              className="p-2 rounded-md border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              aria-label="Toggle theme"
            >
              {dark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>

            <Link
              href="/login"
              className="text-sm text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white px-4 py-2 rounded-md transition-colors"
            >
              {l.hero.cta2}
            </Link>
            <Link
              href="/register"
              className="text-sm bg-indigo-500 hover:bg-indigo-400 text-white px-4 py-2 rounded-md font-medium transition-colors"
            >
              {l.hero.cta1}
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="bg-gradient-to-br from-slate-50 via-white to-indigo-50/40 dark:from-slate-900 dark:via-slate-900 dark:to-slate-900 text-slate-900 dark:text-white overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 py-20 lg:py-28 grid lg:grid-cols-2 gap-16 items-center">
          {/* Left */}
          <div className="space-y-8">
            <div className="inline-flex items-center gap-2 bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-100 dark:border-indigo-500/20 text-indigo-600 dark:text-indigo-400 text-xs font-medium px-3 py-1.5 rounded-full">
              <Zap className="h-3 w-3" />
              {l.hero.badge}
            </div>
            <h1 className="text-4xl lg:text-5xl font-bold leading-tight tracking-tight text-slate-900 dark:text-white">
              {l.hero.headline}{" "}
              <span className="text-indigo-500 dark:text-indigo-400">{l.hero.headlineAccent}</span>
            </h1>
            <p className="text-slate-600 dark:text-slate-400 text-lg leading-relaxed">
              {l.hero.subtitle}
            </p>
            <ul className="space-y-3">
              {[l.hero.bullet1, l.hero.bullet2, l.hero.bullet3].map((item) => (
                <li key={item} className="flex items-center gap-3 text-slate-700 dark:text-slate-300 text-sm">
                  <div className="h-1.5 w-1.5 rounded-full bg-indigo-500 dark:bg-indigo-400 flex-shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
            <div className="flex flex-wrap gap-3 pt-2">
              <Link
                href="/register"
                className="bg-indigo-500 hover:bg-indigo-400 text-white px-6 py-3 rounded-lg font-medium transition-colors text-sm"
              >
                {l.hero.cta1}
              </Link>
              <Link
                href="/login"
                className="border border-slate-300 dark:border-slate-700 hover:border-indigo-300 dark:hover:border-slate-500 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white px-6 py-3 rounded-lg font-medium transition-colors text-sm"
              >
                {l.hero.cta2}
              </Link>
              <Link
                href="/join"
                className="text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300 px-6 py-3 rounded-lg font-medium transition-colors text-sm underline-offset-4 hover:underline"
              >
                {l.hero.cta3}
              </Link>
            </div>
          </div>

          {/* Right — dashboard mockup */}
          <div className="relative hidden lg:block">
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/10 to-purple-500/10 rounded-2xl blur-3xl" />
            <div className="relative bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-xl dark:shadow-2xl">
              {/* Mock browser chrome */}
              <div className="flex items-center gap-1.5 px-4 py-3 border-b border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80">
                <div className="h-2.5 w-2.5 rounded-full bg-red-400" />
                <div className="h-2.5 w-2.5 rounded-full bg-yellow-400" />
                <div className="h-2.5 w-2.5 rounded-full bg-green-400" />
                <div className="ml-4 h-5 w-44 bg-slate-200 dark:bg-slate-700 rounded flex items-center px-2">
                  <span className="text-[10px] text-slate-500 dark:text-slate-400">rms.app/dashboard</span>
                </div>
              </div>

              <div className="flex" style={{ height: 340 }}>
                {/* Mock sidebar */}
                <div className="w-14 bg-slate-50 dark:bg-slate-900 border-r border-slate-100 dark:border-slate-700 flex flex-col items-center py-4 gap-3">
                  <div className="h-7 w-7 rounded-lg bg-indigo-500 flex items-center justify-center mb-1">
                    <Building2 className="h-3.5 w-3.5 text-white" />
                  </div>
                  {([Building2, Package, CalendarDays, Users, FileText] as const).map((Icon, i) => (
                    <div
                      key={i}
                      className={`h-8 w-8 rounded-md flex items-center justify-center ${
                        i === 0 ? "bg-indigo-500/15" : ""
                      }`}
                    >
                      <Icon className={`h-4 w-4 ${i === 0 ? "text-indigo-500" : "text-slate-400 dark:text-slate-600"}`} />
                    </div>
                  ))}
                </div>

                {/* Mock content */}
                <div className="flex-1 p-5 overflow-hidden bg-white dark:bg-slate-800">
                  <div className="text-slate-800 dark:text-slate-200 text-sm font-semibold mb-4">
                    {t.dashboard.title}
                  </div>

                  {/* Stat cards */}
                  <div className="grid grid-cols-2 gap-2.5 mb-3.5">
                    {[
                      { label: t.dashboard.totalAssets, value: "248", color: "text-indigo-500 dark:text-indigo-400" },
                      { label: t.dashboard.activeBookings, value: "34", color: "text-green-600 dark:text-green-400" },
                      { label: t.dashboard.monthlyRevenue, value: "$8,240", color: "text-blue-600 dark:text-blue-400" },
                      { label: t.dashboard.overdueInvoices, value: "3", color: "text-red-500 dark:text-red-400" },
                    ].map((card) => (
                      <div
                        key={card.label}
                        className="bg-slate-50 dark:bg-slate-900/60 rounded-lg p-3 border border-slate-100 dark:border-slate-700/50"
                      >
                        <div className="text-slate-500 dark:text-slate-500 text-[9px] mb-1">{card.label}</div>
                        <div className={`font-bold text-sm ${card.color}`}>{card.value}</div>
                      </div>
                    ))}
                  </div>

                  {/* Mini bar chart */}
                  <div className="bg-slate-50 dark:bg-slate-900/60 rounded-lg p-3 border border-slate-100 dark:border-slate-700/50">
                    <div className="text-slate-500 text-[9px] mb-2">{t.dashboard.revenueChart}</div>
                    <div className="flex items-end gap-1.5 h-14">
                      {[40, 60, 45, 80, 65, 90].map((h, i) => (
                        <div
                          key={i}
                          className="flex-1 rounded-sm bg-indigo-400/50 dark:bg-indigo-500/40"
                          style={{ height: `${h}%` }}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="bg-white dark:bg-slate-800 border-t border-slate-100 dark:border-slate-700 py-16">
        <div className="max-w-7xl mx-auto px-6">
          <p className="text-center text-slate-400 dark:text-slate-500 text-xs uppercase tracking-widest font-medium mb-12">
            {l.stats.trustedBy}
          </p>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 text-center">
            {stats.map(({ value, label, icon: Icon }) => (
              <div key={label} className="space-y-3">
                <div className="flex justify-center">
                  <div className="h-10 w-10 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center">
                    <Icon className="h-5 w-5 text-indigo-500 dark:text-indigo-400" />
                  </div>
                </div>
                <div className="text-3xl font-bold text-slate-900 dark:text-white">{value}</div>
                <div className="text-sm text-slate-500 dark:text-slate-400">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="bg-slate-50 dark:bg-slate-900 py-20 border-t border-slate-100 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-3">{l.features.title}</h2>
            <p className="text-slate-500 dark:text-slate-400 max-w-xl mx-auto">{l.features.subtitle}</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map(({ icon: Icon, title, desc }) => (
              <div
                key={title}
                className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700 hover:border-indigo-200 dark:hover:border-indigo-500/30 hover:shadow-sm transition-all"
              >
                <div className="h-10 w-10 rounded-lg bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center mb-4">
                  <Icon className="h-5 w-5 text-indigo-500 dark:text-indigo-400" />
                </div>
                <h3 className="font-semibold text-slate-900 dark:text-white mb-2">{title}</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="bg-white dark:bg-slate-800 py-20 border-t border-slate-100 dark:border-slate-700">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-3">{l.pricing.title}</h2>
            <p className="text-slate-500 dark:text-slate-400 max-w-xl mx-auto">{l.pricing.subtitle}</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {/* Free Trial */}
            <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 p-8 flex flex-col gap-6">
              <div>
                <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">{l.pricing.trial}</div>
                <div className="text-4xl font-bold text-slate-900 dark:text-white">Free</div>
                <div className="text-sm text-slate-500 dark:text-slate-400 mt-1">{l.pricing.trialDesc}</div>
              </div>
              <ul className="space-y-3 flex-1">
                {[
                  { feat: l.pricing.unlimitedAssets, included: true },
                  { feat: l.pricing.teamAccess, included: false },
                  { feat: l.pricing.invoicing, included: false },
                ].map(({ feat, included }) => (
                  <li key={feat} className={`flex items-center gap-2 text-sm ${included ? "text-slate-700 dark:text-slate-300" : "text-slate-400 dark:text-slate-500"}`}>
                    <div className={`h-4 w-4 rounded-full flex items-center justify-center shrink-0 ${included ? "bg-indigo-100 dark:bg-indigo-500/20" : "bg-slate-200 dark:bg-slate-700"}`}>
                      {included ? (
                        <svg viewBox="0 0 10 10" className="h-2.5 w-2.5 text-indigo-500 dark:text-indigo-400" fill="none" stroke="currentColor" strokeWidth="1.5">
                          <polyline points="2,5 4.5,7.5 8,3" />
                        </svg>
                      ) : (
                        <svg viewBox="0 0 10 10" className="h-2.5 w-2.5 text-slate-400" fill="none" stroke="currentColor" strokeWidth="1.5">
                          <line x1="3" y1="3" x2="7" y2="7" /><line x1="7" y1="3" x2="3" y2="7" />
                        </svg>
                      )}
                    </div>
                    {feat}
                  </li>
                ))}
              </ul>
              <Link
                href="/register"
                className="block text-center bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-200 px-6 py-2.5 rounded-lg font-medium text-sm transition-colors"
              >
                {l.pricing.cta}
              </Link>
            </div>

            {/* Starter */}
            <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 p-8 flex flex-col gap-6">
              <div>
                <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">{l.pricing.starter}</div>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-bold text-slate-900 dark:text-white">₾10</span>
                  <span className="text-slate-500 dark:text-slate-400 text-sm">{l.pricing.perMonth}</span>
                </div>
                <div className="text-sm text-slate-500 dark:text-slate-400 mt-1">{l.pricing.starterDesc}</div>
              </div>
              <ul className="space-y-3 flex-1">
                {[
                  { feat: l.pricing.assetLimit.replace("{n}", "20"), included: true },
                  { feat: l.pricing.teamAccess, included: false },
                  { feat: l.pricing.invoicing, included: false },
                ].map(({ feat, included }) => (
                  <li key={feat} className={`flex items-center gap-2 text-sm ${included ? "text-slate-700 dark:text-slate-300" : "text-slate-400 dark:text-slate-500"}`}>
                    <div className={`h-4 w-4 rounded-full flex items-center justify-center shrink-0 ${included ? "bg-indigo-100 dark:bg-indigo-500/20" : "bg-slate-200 dark:bg-slate-700"}`}>
                      {included ? (
                        <svg viewBox="0 0 10 10" className="h-2.5 w-2.5 text-indigo-500 dark:text-indigo-400" fill="none" stroke="currentColor" strokeWidth="1.5">
                          <polyline points="2,5 4.5,7.5 8,3" />
                        </svg>
                      ) : (
                        <svg viewBox="0 0 10 10" className="h-2.5 w-2.5 text-slate-400" fill="none" stroke="currentColor" strokeWidth="1.5">
                          <line x1="3" y1="3" x2="7" y2="7" /><line x1="7" y1="3" x2="3" y2="7" />
                        </svg>
                      )}
                    </div>
                    {feat}
                  </li>
                ))}
              </ul>
              <Link
                href="/register"
                className="block text-center border border-indigo-500 text-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 px-6 py-2.5 rounded-lg font-medium text-sm transition-colors"
              >
                {l.pricing.ctaStarter}
              </Link>
            </div>

            {/* Pro — highlighted */}
            <div className="relative rounded-2xl border-2 border-indigo-500 bg-indigo-600 dark:bg-indigo-600 p-8 flex flex-col gap-6 shadow-xl shadow-indigo-500/20">
              <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-indigo-500 text-white text-xs font-semibold px-4 py-1 rounded-full whitespace-nowrap border border-indigo-400">
                {l.pricing.mostPopular}
              </div>
              <div>
                <div className="text-xs font-semibold text-indigo-200 uppercase tracking-wider mb-1">{l.pricing.pro}</div>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-bold text-white">₾30</span>
                  <span className="text-indigo-200 text-sm">{l.pricing.perMonth}</span>
                </div>
                <div className="text-sm text-indigo-200 mt-1">{l.pricing.proDesc}</div>
              </div>
              <ul className="space-y-3 flex-1">
                {[l.pricing.unlimitedAssets, l.pricing.allFeatures, l.pricing.teamAccess, l.pricing.invoicing].map((feat) => (
                  <li key={feat} className="flex items-center gap-2 text-sm text-white">
                    <div className="h-4 w-4 rounded-full bg-white/20 flex items-center justify-center shrink-0">
                      <svg viewBox="0 0 10 10" className="h-2.5 w-2.5 text-white" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <polyline points="2,5 4.5,7.5 8,3" />
                      </svg>
                    </div>
                    {feat}
                  </li>
                ))}
              </ul>
              <Link
                href="/register"
                className="block text-center bg-white hover:bg-indigo-50 text-indigo-600 px-6 py-2.5 rounded-lg font-semibold text-sm transition-colors"
              >
                {l.pricing.ctaPro}
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* CTA banner */}
      <section className="bg-indigo-600 dark:bg-indigo-700 py-16">
        <div className="max-w-3xl mx-auto px-6 text-center space-y-6">
          <h2 className="text-3xl font-bold text-white">{l.cta.title}</h2>
          <p className="text-indigo-200">{l.cta.subtitle}</p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              href="/register"
              className="bg-white text-indigo-600 hover:bg-indigo-50 px-8 py-3 rounded-lg font-semibold text-sm transition-colors"
            >
              {l.cta.btn1}
            </Link>
            <Link
              href="/join"
              className="border border-indigo-400 text-white hover:bg-indigo-500 dark:hover:bg-indigo-600 px-8 py-3 rounded-lg font-semibold text-sm transition-colors"
            >
              {l.cta.btn2}
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-100 dark:bg-slate-900 text-slate-500 dark:text-slate-400 border-t border-slate-200 dark:border-slate-800 py-8">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded bg-indigo-500 text-white">
              <Building2 className="h-3 w-3" />
            </div>
            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">RMS</span>
          </div>
          <p className="text-xs text-slate-400 dark:text-slate-500">Rental Management System</p>
          <div className="flex gap-4 text-xs">
            <Link href="/login" className="hover:text-slate-700 dark:hover:text-slate-300 transition-colors">{l.hero.cta2}</Link>
            <Link href="/register" className="hover:text-slate-700 dark:hover:text-slate-300 transition-colors">{l.hero.cta1}</Link>
            <Link href="/join" className="hover:text-slate-700 dark:hover:text-slate-300 transition-colors">{l.hero.cta3}</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
