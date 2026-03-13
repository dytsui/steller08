"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { LocaleSwitcher } from "@/components/layout/locale-switcher";
import { useLocale } from "@/components/layout/use-locale";
import { dictionaries } from "@/lib/i18n";
import { getCurrentStudentId, subscribeCurrentStudent } from "@/lib/current-student";
import { cn } from "@/lib/utils";
import { fetchAuthSession, logoutSession } from "@/lib/services/auth";

const nav = [
  ["/", "home"],
  ["/students", "students"],
  ["/upload", "upload"],
  ["/capture", "capture"],
  ["/history", "history"],
  ["/training", "training"],
  ["/settings", "settings"]
] as const;

export function Header() {
  const pathname = usePathname();
  const { locale } = useLocale();
  const dict = dictionaries[locale as keyof typeof dictionaries];
  const [currentStudentId, setCurrentStudentId] = useState("");
  const [session, setSession] = useState<{ displayName: string; role: string } | null>(null);

  useEffect(() => {
    setCurrentStudentId(getCurrentStudentId());
    void fetchAuthSession().then((payload) => setSession(payload.user ? { displayName: payload.user.displayName, role: payload.user.role } : null));
    return subscribeCurrentStudent(setCurrentStudentId);
  }, []);

  async function onLogout() {
    await logoutSession();
    window.location.href = "/login";
  }

  const portalHref = session?.role === "pro" ? "/pro" : "/app";

  return (
    <header className="header">
      <div className="header-inner">
        <Link href="/" className="brand-shell" aria-label="Steller08 home">
          <span className="brand-mark" />
          <span className="brand-copy">
            <span className="brand-title">Steller08</span>
            <span className="brand-subtitle">User / Pro dual portal operating edition</span>
          </span>
        </Link>

        <nav className="top-nav">
          {nav.map(([href, key]) => (
            <Link key={href} href={href} className={cn("nav-link", pathname === href && "nav-link-active")}>
              {dict[key as keyof typeof dict]}
            </Link>
          ))}
        </nav>

        <div className="header-tools">
          <Link href="/students" className="quick-link">
            当前学员
            <strong>{currentStudentId ? currentStudentId.slice(0, 8) : "未设定"}</strong>
          </Link>
          {session ? (
            <>
              <Link href={portalHref} className="quick-link">
                当前门户
                <strong>{session.role === "pro" ? "Pro端" : "用户端"}</strong>
              </Link>
              <button type="button" className="button button-neutral" onClick={onLogout}>退出</button>
            </>
          ) : (
            <>
              <Link href="/login" className="button button-neutral">登录</Link>
              <Link href="/register" className="button button-primary">注册</Link>
            </>
          )}
          <LocaleSwitcher />
        </div>
      </div>
    </header>
  );
}
