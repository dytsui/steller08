"use client";

import { useLocale } from "@/components/layout/use-locale";

export function LocaleSwitcher() {
  const { locale, setLocale } = useLocale();
  return (
    <div className="locale-switcher">
      <button className={locale === "zh-CN" ? "active" : ""} onClick={() => setLocale("zh-CN")}>中文</button>
      <button className={locale === "en" ? "active" : ""} onClick={() => setLocale("en")}>EN</button>
    </div>
  );
}
