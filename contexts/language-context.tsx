"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { translations, Locale, Translations } from "@/lib/i18n/translations";

const STORAGE_KEY = "rms_locale";

interface LanguageContextValue {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: Translations;
}

const LanguageContext = createContext<LanguageContextValue | null>(null);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [locale, _setLocale] = useState<Locale>("ka");

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY) as Locale | null;
    if (saved && saved in translations) _setLocale(saved);
  }, []);

  function setLocale(loc: Locale) {
    _setLocale(loc);
    localStorage.setItem(STORAGE_KEY, loc);
  }

  return (
    <LanguageContext.Provider value={{ locale, setLocale, t: translations[locale] }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage(): LanguageContextValue {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLanguage must be used inside LanguageProvider");
  return ctx;
}
