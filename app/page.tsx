"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useLanguage } from "@/contexts/language-context";
import { Locale } from "@/lib/i18n/translations";
import {
  Boxes,
  CalendarDays,
  Users,
  FileText,
  Sun,
  Moon,
  ArrowRight,
  Check,
  ShieldCheck,
  Zap,
  Clock,
  BarChart3,
  Star,
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

  const stats = [
    { value: "500+", label: l.stats.organizations },
    { value: "12,000+", label: l.stats.assetsTracked },
    { value: "98%", label: l.stats.uptime },
    { value: "3×", label: l.stats.fasterBookings },
  ];

  // Alternating feature rows — reference rocket-rms layout (text + screenshot)
  const featureRows = [
    {
      icon: Boxes,
      eyebrow: "Inventory",
      title: l.features.inventory.title,
      desc: l.features.inventory.desc,
      points: [l.hero.bullet2, l.pricing.unlimitedAssets, "Categories & daily rates"],
      mock: "inventory" as const,
    },
    {
      icon: CalendarDays,
      eyebrow: "Bookings",
      title: l.features.bookings.title,
      desc: l.features.bookings.desc,
      points: ["Availability conflict checks", "Smart scheduling", "Drag-free calendar view"],
      mock: "bookings" as const,
    },
    {
      icon: FileText,
      eyebrow: "Invoicing",
      title: l.features.invoicing.title,
      desc: l.features.invoicing.desc,
      points: [l.pricing.invoicing, "Auto invoice numbers", "Paid / partial / overdue tracking"],
      mock: "invoicing" as const,
    },
  ];

  const valueProps = [
    { icon: ShieldCheck, title: "Role-based access", desc: "Owner, admin, and staff roles keep your data secure and scoped." },
    { icon: Zap, title: "Fast order creation", desc: "Build a booking and invoice in seconds, not minutes." },
    { icon: Clock, title: "Real-time tracking", desc: "Know what's out, what's due back, and what's overdue at a glance." },
    { icon: BarChart3, title: "Revenue analytics", desc: "Track monthly revenue and utilization across your fleet." },
  ];

  const testimonials = [
    { quote: "We cut our order processing time by more than half. The team picked it up in a day.", name: "Davit M.", role: "Owner, EventGear Tbilisi" },
    { quote: "Invoicing used to be a spreadsheet nightmare. Now it's automatic and always accurate.", name: "Nina K.", role: "Operations, RentPro" },
    { quote: "Finally one place for inventory, bookings, and customers. No more juggling tools.", name: "Levan T.", role: "Manager, ToolHub" },
  ];

  return (
    <div className="min-h-screen flex flex-col overflow-x-hidden bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100">
      {/* Top bar */}
      <header className="sticky top-0 z-50 border-b border-slate-200/80 dark:border-white/10 bg-white/90 dark:bg-slate-950/90 backdrop-blur-md">
        <nav className="max-w-7xl mx-auto flex h-16 items-center justify-between px-6">
          <Link href="/" className="flex items-center">
            <span className="font-extrabold text-xl tracking-tight brand-text">Qiravo</span>
          </Link>

          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600 dark:text-slate-300">
            <a href="#features" className="hover:text-blue-700 dark:hover:text-blue-400 transition-colors cursor-pointer">Features</a>
            <a href="#why" className="hover:text-blue-700 dark:hover:text-blue-400 transition-colors cursor-pointer">Why Qiravo</a>
            <a href="#pricing" className="hover:text-blue-700 dark:hover:text-blue-400 transition-colors cursor-pointer">Pricing</a>
            <a href="#testimonials" className="hover:text-blue-700 dark:hover:text-blue-400 transition-colors cursor-pointer">Customers</a>
          </div>

          <div className="flex items-center gap-2">
            <div className="hidden sm:flex items-center rounded-lg border border-slate-200 dark:border-white/10 overflow-hidden text-xs font-semibold">
              {(Object.keys(localeLabels) as Locale[]).map((loc) => (
                <button
                  key={loc}
                  onClick={() => setLocale(loc)}
                  className={`px-2.5 py-1.5 transition-colors cursor-pointer ${
                    locale === loc
                      ? "bg-blue-700 text-white"
                      : "text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/10"
                  }`}
                >
                  {localeLabels[loc]}
                </button>
              ))}
            </div>

            <button
              onClick={() => setDark((d) => !d)}
              className="p-2 rounded-lg border border-slate-200 dark:border-white/10 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/10 transition-colors cursor-pointer"
              aria-label="Toggle theme"
            >
              {dark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>

            <Link
              href="/login"
              className="hidden sm:inline-flex text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white px-3.5 py-2 rounded-lg transition-colors"
            >
              {l.hero.cta2}
            </Link>
            <Link
              href="/register"
              className="inline-flex items-center gap-1.5 text-sm brand-gradient text-white px-4 py-2 rounded-lg font-semibold transition-all cursor-pointer shadow-md shadow-blue-700/20 hover:shadow-lg hover:shadow-blue-700/30 hover:-translate-y-0.5"
            >
              {l.hero.cta1}
            </Link>
          </div>
        </nav>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-b from-slate-50 to-white dark:from-slate-900 dark:to-slate-950 border-b border-slate-200/70 dark:border-white/10">
        {/* Ambient glow mesh */}
        <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="rms-drift absolute -top-24 left-1/2 h-[420px] w-[680px] -translate-x-1/2 rounded-full bg-blue-400/25 dark:bg-blue-500/20 blur-[120px]" />
          <div className="rms-drift absolute top-10 -right-20 h-72 w-72 rounded-full bg-indigo-400/20 dark:bg-indigo-500/15 blur-[100px]" style={{ animationDelay: "-5s" }} />
          <div className="rms-drift absolute top-40 -left-20 h-72 w-72 rounded-full bg-sky-300/20 dark:bg-cyan-500/15 blur-[100px]" style={{ animationDelay: "-9s" }} />
        </div>
        {/* Dotted grid backdrop */}
        <div aria-hidden className="rms-grid pointer-events-none absolute inset-0 text-slate-300/40 dark:text-white/[0.04] [mask-image:radial-gradient(ellipse_at_center,black,transparent_75%)]" />

        <div className="relative max-w-7xl mx-auto px-6 pt-20 pb-16 lg:pt-28 text-center">
          <div className="rms-rise inline-flex items-center gap-2 bg-blue-50 dark:bg-blue-500/10 border border-blue-100 dark:border-blue-500/20 text-blue-700 dark:text-blue-300 text-xs font-semibold px-3.5 py-1.5 rounded-full">
            <ShieldCheck className="h-3.5 w-3.5" />
            {l.hero.badge}
          </div>

          <h1 className="rms-rise mt-6 text-4xl sm:text-6xl lg:text-7xl font-extrabold leading-[1.05] tracking-tight max-w-4xl mx-auto break-words hyphens-auto" style={{ animationDelay: "0.05s" }}>
            {l.hero.headline}{" "}
            <span className="brand-text">{l.hero.headlineAccent}</span>
          </h1>

          <p className="rms-rise mt-6 text-slate-600 dark:text-slate-400 text-lg leading-relaxed max-w-2xl mx-auto" style={{ animationDelay: "0.1s" }}>
            {l.hero.subtitle}
          </p>

          <div className="rms-rise mt-8 flex flex-wrap justify-center gap-3" style={{ animationDelay: "0.15s" }}>
            <Link
              href="/register"
              className="inline-flex items-center gap-2 brand-gradient text-white px-7 py-3.5 rounded-xl font-semibold transition-all text-sm cursor-pointer shadow-lg shadow-blue-700/25 hover:shadow-xl hover:shadow-blue-700/35 hover:-translate-y-0.5"
            >
              {l.hero.cta1}
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/login"
              className="inline-flex items-center gap-2 border border-slate-300 dark:border-white/15 hover:border-blue-400 dark:hover:border-blue-500/50 text-slate-700 dark:text-slate-200 px-6 py-3 rounded-lg font-medium transition-colors text-sm bg-white dark:bg-white/5 cursor-pointer"
            >
              {l.hero.cta2}
            </Link>
          </div>

          <p className="rms-rise mt-4 text-xs text-slate-400 dark:text-slate-500" style={{ animationDelay: "0.2s" }}>{l.cta.subtitle}</p>

          {/* Product screenshot */}
          <div className="rms-rise mt-14 max-w-5xl mx-auto" style={{ animationDelay: "0.25s" }}>
            <div className="rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900 shadow-2xl shadow-slate-900/10 dark:shadow-black/40 overflow-hidden text-left">
              <div className="flex items-center gap-1.5 px-4 py-3 border-b border-slate-100 dark:border-white/8 bg-slate-50 dark:bg-white/5">
                <div className="h-2.5 w-2.5 rounded-full bg-red-400" />
                <div className="h-2.5 w-2.5 rounded-full bg-yellow-400" />
                <div className="h-2.5 w-2.5 rounded-full bg-green-400" />
                <div className="ml-4 h-5 w-56 bg-slate-100 dark:bg-white/10 rounded-md flex items-center px-2.5">
                  <span className="text-[10px] text-slate-400 dark:text-slate-500">app.rms.io/dashboard</span>
                </div>
              </div>

              <div className="flex" style={{ height: 380 }}>
                <div className="hidden sm:flex w-16 bg-slate-50 dark:bg-slate-950/60 border-r border-slate-100 dark:border-white/8 flex-col items-center py-5 gap-3">
                  <div className="h-8 w-8 rounded-lg bg-blue-700 flex items-center justify-center mb-1">
                    <Boxes className="h-4 w-4 text-white" />
                  </div>
                  {([Boxes, CalendarDays, Users, FileText, BarChart3] as const).map((Icon, i) => (
                    <div key={i} className={`h-9 w-9 rounded-lg flex items-center justify-center ${i === 0 ? "bg-blue-100 dark:bg-blue-500/20" : ""}`}>
                      <Icon className={`h-4 w-4 ${i === 0 ? "text-blue-700 dark:text-blue-400" : "text-slate-300 dark:text-slate-600"}`} />
                    </div>
                  ))}
                </div>

                <div className="flex-1 p-6 overflow-hidden bg-slate-50/40 dark:bg-transparent">
                  <div className="text-slate-800 dark:text-slate-100 text-base font-semibold mb-5">{t.dashboard.title}</div>
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
                    {[
                      { label: t.dashboard.totalAssets, value: "248" },
                      { label: t.dashboard.activeBookings, value: "34" },
                      { label: t.dashboard.monthlyRevenue, value: "$8,240" },
                      { label: t.dashboard.overdueInvoices, value: "3" },
                    ].map((card) => (
                      <div key={card.label} className="bg-white dark:bg-white/5 rounded-xl p-3.5 border border-slate-200 dark:border-white/8">
                        <div className="text-slate-500 dark:text-slate-500 text-[10px] mb-1.5 font-medium truncate">{card.label}</div>
                        <div className="font-bold text-lg text-slate-900 dark:text-white">{card.value}</div>
                      </div>
                    ))}
                  </div>
                  <div className="bg-white dark:bg-white/5 rounded-xl p-4 border border-slate-200 dark:border-white/8">
                    <div className="text-slate-500 dark:text-slate-500 text-[10px] mb-3 font-medium">{t.dashboard.revenueChart}</div>
                    <div className="flex items-end gap-2 h-24">
                      {[40, 60, 45, 80, 65, 90, 75, 85].map((h, i) => (
                        <div key={i} className="flex-1 rounded-t-sm bg-blue-600/80" style={{ height: `${h}%`, opacity: i === 6 ? 1 : 0.45 }} />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats strip */}
      <section className="border-b border-slate-200/70 dark:border-white/10 bg-white dark:bg-slate-950 py-12">
        <div className="max-w-6xl mx-auto px-6">
          <p className="text-center text-slate-400 dark:text-slate-500 text-xs uppercase tracking-widest font-semibold mb-8">{l.stats.trustedBy}</p>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 text-center">
            {stats.map(({ value, label }) => (
              <div key={label}>
                <div className="text-4xl lg:text-5xl font-extrabold tracking-tight brand-text">{value}</div>
                <div className="mt-1.5 text-sm text-slate-500 dark:text-slate-400">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Feature rows — alternating */}
      <section id="features" className="py-20 lg:py-28 bg-white dark:bg-slate-950">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold tracking-tight">{l.features.title}</h2>
            <p className="mt-4 text-slate-600 dark:text-slate-400 text-lg">{l.features.subtitle}</p>
          </div>

          <div className="space-y-20 lg:space-y-28">
            {featureRows.map((row, i) => {
              const Icon = row.icon;
              const reversed = i % 2 === 1;
              return (
                <div key={row.title} className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">
                  <div className={reversed ? "lg:order-2" : ""}>
                    <div className="inline-flex items-center gap-2 text-blue-700 dark:text-blue-400 text-xs font-bold uppercase tracking-wider">
                      <Icon className="h-4 w-4" />
                      {row.eyebrow}
                    </div>
                    <h3 className="mt-3 text-2xl lg:text-3xl font-bold tracking-tight">{row.title}</h3>
                    <p className="mt-4 text-slate-600 dark:text-slate-400 leading-relaxed">{row.desc}</p>
                    <ul className="mt-6 space-y-3">
                      {row.points.map((p) => (
                        <li key={p} className="flex items-center gap-3 text-sm text-slate-700 dark:text-slate-300">
                          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-500/20 flex-shrink-0">
                            <Check className="h-3 w-3 text-blue-700 dark:text-blue-400" />
                          </span>
                          {p}
                        </li>
                      ))}
                    </ul>
                    <Link href="/register" className="mt-7 inline-flex items-center gap-2 text-sm font-semibold text-blue-700 dark:text-blue-400 hover:gap-3 transition-all cursor-pointer">
                      {l.pricing.cta}
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </div>

                  <FeatureMock variant={row.mock} reversed={reversed} />
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Why RMS — value props */}
      <section id="why" className="py-20 lg:py-24 bg-slate-50 dark:bg-slate-900 border-y border-slate-200/70 dark:border-white/10">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <h2 className="text-3xl lg:text-4xl font-bold tracking-tight">Built for rental teams that move fast</h2>
            <p className="mt-4 text-slate-600 dark:text-slate-400 text-lg">Everything runs in one secure system — no spreadsheets, no juggling tools.</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {valueProps.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="rounded-xl bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 p-6 hover:border-blue-300 dark:hover:border-blue-500/40 hover:shadow-md hover:shadow-blue-900/5 transition-all">
                <div className="h-11 w-11 rounded-lg bg-blue-100 dark:bg-blue-500/15 flex items-center justify-center">
                  <Icon className="h-5 w-5 text-blue-700 dark:text-blue-400" />
                </div>
                <h3 className="mt-4 font-semibold text-base">{title}</h3>
                <p className="mt-2 text-sm text-slate-600 dark:text-slate-400 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="py-20 lg:py-24 bg-white dark:bg-slate-950">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <h2 className="text-3xl lg:text-4xl font-bold tracking-tight">Loved by rental businesses</h2>
            <p className="mt-4 text-slate-600 dark:text-slate-400 text-lg">Teams switch to Qiravo and never look back.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((tm) => (
              <figure key={tm.name} className="rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 p-6 flex flex-col">
                <div className="flex gap-0.5 text-amber-400">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-current" />
                  ))}
                </div>
                <blockquote className="mt-4 text-slate-700 dark:text-slate-200 leading-relaxed flex-1">“{tm.quote}”</blockquote>
                <figcaption className="mt-5 flex items-center gap-3">
                  <div className="h-9 w-9 rounded-full bg-blue-700 text-white flex items-center justify-center text-sm font-bold">{tm.name.charAt(0)}</div>
                  <div>
                    <div className="text-sm font-semibold text-slate-900 dark:text-white">{tm.name}</div>
                    <div className="text-xs text-slate-500 dark:text-slate-400">{tm.role}</div>
                  </div>
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-20 lg:py-24 bg-slate-50 dark:bg-slate-900 border-y border-slate-200/70 dark:border-white/10">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <h2 className="text-3xl lg:text-4xl font-bold tracking-tight">{l.pricing.title}</h2>
            <p className="mt-4 text-slate-600 dark:text-slate-400 text-lg">{l.pricing.subtitle}</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {/* Free Trial */}
            <PlanCard
              label={l.pricing.trial}
              price="Free"
              desc={l.pricing.trialDesc}
              feats={[
                { feat: l.pricing.unlimitedAssets, ok: true },
                { feat: l.pricing.teamAccess, ok: false },
                { feat: l.pricing.invoicing, ok: false },
              ]}
              cta={l.pricing.cta}
            />
            {/* Starter */}
            <PlanCard
              label={l.pricing.starter}
              price="₾10"
              per={l.pricing.perMonth}
              desc={l.pricing.starterDesc}
              feats={[
                { feat: l.pricing.assetLimit.replace("{n}", "20"), ok: true },
                { feat: l.pricing.teamAccess, ok: false },
                { feat: l.pricing.invoicing, ok: false },
              ]}
              cta={l.pricing.ctaStarter}
            />
            {/* Pro */}
            <PlanCard
              featured
              label={l.pricing.pro}
              price="₾30"
              per={l.pricing.perMonth}
              desc={l.pricing.proDesc}
              badge={l.pricing.mostPopular}
              feats={[
                { feat: l.pricing.unlimitedAssets, ok: true },
                { feat: l.pricing.allFeatures, ok: true },
                { feat: l.pricing.teamAccess, ok: true },
                { feat: l.pricing.invoicing, ok: true },
              ]}
              cta={l.pricing.ctaPro}
            />
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative overflow-hidden brand-gradient">
        <div aria-hidden className="rms-grid pointer-events-none absolute inset-0 text-white/10" />
        <div aria-hidden className="pointer-events-none absolute -top-20 left-1/4 h-72 w-72 rounded-full bg-white/15 blur-3xl" />
        <div className="relative max-w-4xl mx-auto px-6 py-24 text-center">
          <h2 className="text-3xl lg:text-5xl font-extrabold text-white tracking-tight">{l.cta.title}</h2>
          <p className="mt-4 text-blue-100 text-lg">{l.cta.subtitle}</p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Link href="/register" className="inline-flex items-center gap-2 bg-white text-blue-700 hover:bg-blue-50 px-8 py-3.5 rounded-lg font-bold text-sm transition-colors cursor-pointer">
              {l.cta.btn1}
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link href="/join" className="inline-flex items-center gap-2 border border-white/40 text-white hover:bg-white/10 px-8 py-3.5 rounded-lg font-semibold text-sm transition-colors cursor-pointer">
              {l.cta.btn2}
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 dark:bg-slate-950 text-slate-400 border-t border-white/5">
        <div className="max-w-6xl mx-auto px-6 pt-16 pb-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-10 mb-12">
            <div className="col-span-2 md:col-span-1 space-y-4">
              <div className="flex items-center">
                <span className="font-extrabold text-lg text-white tracking-tight">Qiravo</span>
              </div>
              <p className="text-sm leading-relaxed max-w-[210px]">Modern rental management for teams that move fast.</p>
              <div className="flex items-center gap-3 pt-1">
                <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors" aria-label="Twitter / X">
                  <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" /></svg>
                </a>
                <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors" aria-label="LinkedIn">
                  <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" /></svg>
                </a>
                <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors" aria-label="GitHub">
                  <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor"><path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" /></svg>
                </a>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-xs font-bold text-white uppercase tracking-widest">Product</h3>
              <ul className="space-y-2.5 text-sm">
                {[
                  { label: "Inventory Management", href: "/register" },
                  { label: "Booking & Scheduling", href: "/register" },
                  { label: "Invoice Generation", href: "/register" },
                  { label: "Team Collaboration", href: "/register" },
                  { label: "Analytics & Reports", href: "/register" },
                ].map(({ label, href }) => (
                  <li key={label}><Link href={href} className="hover:text-white transition-colors">{label}</Link></li>
                ))}
              </ul>
            </div>

            <div className="space-y-4">
              <h3 className="text-xs font-bold text-white uppercase tracking-widest">Company</h3>
              <ul className="space-y-2.5 text-sm">
                {[
                  { label: "Pricing", href: "#pricing" },
                  { label: "Get started", href: "/register" },
                  { label: "Sign in", href: "/login" },
                  { label: "Join organization", href: "/join" },
                  { label: "Privacy Policy", href: "#" },
                  { label: "Terms of Service", href: "#" },
                ].map(({ label, href }) => (
                  <li key={label}><Link href={href} className="hover:text-white transition-colors">{label}</Link></li>
                ))}
              </ul>
            </div>

            <div className="space-y-4">
              <h3 className="text-xs font-bold text-white uppercase tracking-widest">Contact</h3>
              <ul className="space-y-3 text-sm">
                <li className="flex items-start gap-2.5">
                  <svg viewBox="0 0 20 20" className="h-4 w-4 text-slate-500 flex-shrink-0 mt-0.5" fill="currentColor"><path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" /><path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" /></svg>
                  <a href="mailto:hello@rms.app" className="hover:text-white transition-colors">hello@rms.app</a>
                </li>
                <li className="flex items-start gap-2.5">
                  <svg viewBox="0 0 20 20" className="h-4 w-4 text-slate-500 flex-shrink-0 mt-0.5" fill="currentColor"><path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" /></svg>
                  <a href="tel:+995322000000" className="hover:text-white transition-colors">+995 32 200 00 00</a>
                </li>
                <li className="flex items-start gap-2.5">
                  <svg viewBox="0 0 20 20" className="h-4 w-4 text-slate-500 flex-shrink-0 mt-0.5" fill="currentColor"><path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" /></svg>
                  <span className="leading-relaxed">14 Rustaveli Ave<br />Tbilisi, Georgia</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="h-px bg-white/8" />
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-6 text-xs text-slate-500">
            <p>&copy; {new Date().getFullYear()} Qiravo — Rental Management System. All rights reserved.</p>
            <div className="flex items-center gap-1.5">
              <div className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              <span>All systems operational</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

/* ---------- Pricing card ---------- */
function PlanCard({
  label,
  price,
  per,
  desc,
  feats,
  cta,
  featured,
  badge,
}: {
  label: string;
  price: string;
  per?: string;
  desc: string;
  feats: { feat: string; ok: boolean }[];
  cta: string;
  featured?: boolean;
  badge?: string;
}) {
  return (
    <div
      className={`relative rounded-2xl p-7 flex flex-col gap-6 ${
        featured
          ? "brand-gradient text-white shadow-xl shadow-blue-900/25 scale-[1.02]"
          : "bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10"
      }`}
    >
      {badge && (
        <div className="absolute top-0 right-0 bg-white/20 text-white text-[10px] font-bold px-3 py-1 rounded-bl-xl rounded-tr-2xl tracking-wider uppercase">
          {badge}
        </div>
      )}
      <div>
        <div className={`text-xs font-semibold uppercase tracking-wider mb-3 ${featured ? "text-blue-200" : "text-slate-400 dark:text-slate-500"}`}>{label}</div>
        <div className="flex items-baseline gap-1">
          <span className="text-4xl font-extrabold tracking-tight">{price}</span>
          {per && <span className={`text-sm ${featured ? "text-blue-200/70" : "text-slate-400 dark:text-slate-500"}`}>{per}</span>}
        </div>
        <div className={`text-sm mt-1.5 ${featured ? "text-blue-100/80" : "text-slate-500 dark:text-slate-400"}`}>{desc}</div>
      </div>
      <ul className="space-y-3 flex-1">
        {feats.map(({ feat, ok }) => (
          <li
            key={feat}
            className={`flex items-center gap-2.5 text-sm ${
              featured ? "text-white" : ok ? "text-slate-700 dark:text-slate-300" : "text-slate-400 dark:text-slate-600"
            }`}
          >
            <span
              className={`flex h-5 w-5 items-center justify-center rounded-full flex-shrink-0 ${
                featured ? "bg-white/20" : ok ? "bg-blue-100 dark:bg-blue-500/20" : "bg-slate-100 dark:bg-white/5"
              }`}
            >
              {ok ? (
                <Check className={`h-3 w-3 ${featured ? "text-white" : "text-blue-700 dark:text-blue-400"}`} />
              ) : (
                <svg viewBox="0 0 14 14" className="h-3 w-3 text-slate-300 dark:text-slate-600" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="3.5" y1="3.5" x2="10.5" y2="10.5" /><line x1="10.5" y1="3.5" x2="3.5" y2="10.5" />
                </svg>
              )}
            </span>
            {feat}
          </li>
        ))}
      </ul>
      <Link
        href="/register"
        className={`block text-center px-6 py-2.5 rounded-lg font-semibold text-sm transition-colors cursor-pointer ${
          featured
            ? "bg-white text-blue-700 hover:bg-blue-50"
            : "border border-blue-200 dark:border-blue-500/30 text-blue-700 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-500/10"
        }`}
      >
        {cta}
      </Link>
    </div>
  );
}

/* ---------- Feature mockups ---------- */
function FeatureMock({ variant, reversed }: { variant: "inventory" | "bookings" | "invoicing"; reversed: boolean }) {
  return (
    <div className={reversed ? "lg:order-1" : ""}>
      <div className="rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900 shadow-xl shadow-slate-900/5 dark:shadow-black/30 overflow-hidden">
        <div className="flex items-center gap-2 px-4 py-2.5 border-b border-slate-100 dark:border-white/8 bg-slate-50 dark:bg-white/5">
          <div className="h-2 w-2 rounded-full bg-slate-300 dark:bg-white/20" />
          <div className="h-2 w-2 rounded-full bg-slate-300 dark:bg-white/20" />
          <div className="h-2 w-2 rounded-full bg-slate-300 dark:bg-white/20" />
        </div>
        <div className="p-5">
          {variant === "inventory" && (
            <div className="space-y-2.5">
              {[
                { name: "Sony FX6 Camera", status: "Available", color: "text-emerald-600 bg-emerald-50 dark:bg-emerald-500/10" },
                { name: "DJI Ronin Gimbal", status: "Rented", color: "text-blue-600 bg-blue-50 dark:bg-blue-500/10" },
                { name: "Aputure 600D Light", status: "Available", color: "text-emerald-600 bg-emerald-50 dark:bg-emerald-500/10" },
                { name: "Manfrotto Tripod", status: "Maintenance", color: "text-amber-600 bg-amber-50 dark:bg-amber-500/10" },
              ].map((r) => (
                <div key={r.name} className="flex items-center justify-between rounded-lg border border-slate-100 dark:border-white/8 px-3.5 py-2.5">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-md bg-slate-100 dark:bg-white/10" />
                    <span className="text-sm font-medium text-slate-700 dark:text-slate-200">{r.name}</span>
                  </div>
                  <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${r.color}`}>{r.status}</span>
                </div>
              ))}
            </div>
          )}
          {variant === "bookings" && (
            <div>
              <div className="grid grid-cols-7 gap-1.5 mb-2 text-center text-[10px] font-semibold text-slate-400">
                {["M", "T", "W", "T", "F", "S", "S"].map((d, i) => <div key={i}>{d}</div>)}
              </div>
              <div className="grid grid-cols-7 gap-1.5">
                {Array.from({ length: 28 }).map((_, i) => {
                  const booked = [3, 4, 5, 11, 12, 18, 19, 20].includes(i);
                  return (
                    <div key={i} className={`aspect-square rounded-md flex items-center justify-center text-[10px] ${booked ? "bg-blue-600 text-white font-semibold" : "bg-slate-50 dark:bg-white/5 text-slate-400"}`}>{i + 1}</div>
                  );
                })}
              </div>
            </div>
          )}
          {variant === "invoicing" && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="text-sm font-bold text-slate-800 dark:text-slate-100">INV-0042</div>
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full text-emerald-600 bg-emerald-50 dark:bg-emerald-500/10">Paid</span>
              </div>
              {[
                { item: "Camera kit — 3 days", amt: "$540" },
                { item: "Lighting — 3 days", amt: "$270" },
                { item: "Delivery", amt: "$45" },
              ].map((r) => (
                <div key={r.item} className="flex items-center justify-between text-sm border-b border-slate-100 dark:border-white/8 pb-2">
                  <span className="text-slate-600 dark:text-slate-300">{r.item}</span>
                  <span className="font-medium text-slate-800 dark:text-slate-100">{r.amt}</span>
                </div>
              ))}
              <div className="flex items-center justify-between pt-1">
                <span className="text-sm font-semibold text-slate-800 dark:text-slate-100">Total</span>
                <span className="text-lg font-extrabold text-blue-700 dark:text-blue-400">$855</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
