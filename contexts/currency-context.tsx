"use client";

import { createContext, useContext, useState, useMemo, ReactNode } from "react";

export type Currency = "USD" | "GEL";

interface CurrencyContextValue {
  currency: Currency;
  setCurrency: (c: Currency) => void;
  currencySymbol: string;
  formatCurrency: (amount: number) => string;
}

const CurrencyContext = createContext<CurrencyContextValue | null>(null);

const CURRENCY_CONFIG: Record<Currency, { locale: string; symbol: string }> = {
  USD: { locale: "en-US", symbol: "$" },
  GEL: { locale: "ka-GE", symbol: "₾" },
};

export function CurrencyProvider({ children }: { children: ReactNode }) {
  const [currency, setCurrency] = useState<Currency>("GEL");

  const value = useMemo(() => {
    const { locale, symbol } = CURRENCY_CONFIG[currency];
    const formatter = new Intl.NumberFormat(locale, {
      style: "currency",
      currency,
      maximumFractionDigits: 0,
    });
    return {
      currency,
      setCurrency,
      currencySymbol: symbol,
      formatCurrency: (amount: number) => formatter.format(amount),
    };
  }, [currency]);

  return <CurrencyContext.Provider value={value}>{children}</CurrencyContext.Provider>;
}

export function useCurrency(): CurrencyContextValue {
  const ctx = useContext(CurrencyContext);
  if (!ctx) throw new Error("useCurrency must be used inside CurrencyProvider");
  return ctx;
}
