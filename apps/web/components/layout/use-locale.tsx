"use client";

import { createContext, useContext, useEffect, useMemo, useState, type PropsWithChildren } from "react";
import type { Locale } from "@/lib/types";

const KEY = 'steller08.locale';

const LocaleContext = createContext<{
  locale: Locale;
  setLocale: (locale: Locale) => void;
} | null>(null);

export function LocaleProvider({ children }: PropsWithChildren) {
  const [locale, setLocaleState] = useState<Locale>('zh-CN');

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const stored = window.localStorage.getItem(KEY) as Locale | null;
    if (stored === 'zh-CN' || stored === 'en') setLocaleState(stored);
  }, []);

  function setLocale(locale: Locale) {
    setLocaleState(locale);
    if (typeof window !== 'undefined') window.localStorage.setItem(KEY, locale);
  }

  const value = useMemo(() => ({ locale, setLocale }), [locale]);
  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
}

export function useLocale() {
  const value = useContext(LocaleContext);
  if (!value) throw new Error("LocaleProvider missing");
  return value;
}
