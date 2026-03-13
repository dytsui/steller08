"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { LocaleSwitcher } from "@/components/layout/locale-switcher";
import { BrandLogo } from "@/components/layout/brand-logo";
import { useLocale } from "@/components/layout/use-locale";
import { dictionaries } from "@/lib/i18n";
import { fetchAuthSession, logoutSession } from "@/lib/services/auth";

type CurrentStudent = { id: string; name: string } | null;

export function Header() {
  const pathname = usePathname();
  const { locale } = useLocale();
  const dict = dictionaries[locale as keyof typeof dictionaries];
  const [session, setSession] = useState<{ displayName: string; role: string } | null>(null);
  const [currentStudent, setCurrentStudent] = useState<CurrentStudent>(null);

  useEffect(() => {
    void fetchAuthSession().then((payload) => setSession(payload.user ? { displayName: payload.user.displayName, role: payload.user.role } : null));
    void fetch('/api/students/current', { cache: 'no-store' }).then((r) => r.json()).then((data) => setCurrentStudent(data.student ?? null)).catch(() => undefined);
  }, [pathname]);

  async function onLogout() {
    await logoutSession();
    window.location.href = "/login";
  }

  const isProPortal = pathname.startsWith('/pro');
  const nav = useMemo(() => {
    if (!session) {
      return [
        ['/', dict.home],
        ['/login', dict.login],
        ['/register', dict.register]
      ] as const;
    }
    if (isProPortal || session.role === 'pro') {
      return [
        ['/pro', dict.proHome],
        ['/pro/students', dict.proStudents],
        ['/pro/upload', dict.upload],
        ['/pro/capture', dict.capture],
        ['/pro/invites', dict.proInvites],
        ['/pro/training', dict.training],
        ['/pro/settings', dict.settings]
      ] as const;
    }
    return [
      ['/app', dict.home],
      ['/app/capture', dict.capture],
      ['/app/upload', dict.upload],
      ['/app/history', dict.history],
      ['/app/training', dict.training],
      ['/app/profile', dict.profile]
    ] as const;
  }, [session, isProPortal, dict]);

  return (
    <header className="header">
      <div className="header-inner">
        <BrandLogo href="/" ariaLabel="Homepage" />

        <nav className="top-nav">
          {nav.map(([href, label]: readonly [string, string]) => (
            <Link key={href} href={href} className={`nav-link ${pathname === href ? 'nav-link-active' : ''}`}>
              {label}
            </Link>
          ))}
        </nav>

        <div className="header-tools">
          {currentStudent && !isProPortal ? (
            <Link href="/app/profile" className="quick-link">
              {dict.currentStudent}
              <strong>{currentStudent.name}</strong>
            </Link>
          ) : null}
          {session ? (
            <>
              <Link href={isProPortal || session.role === 'pro' ? '/pro' : '/app'} className="quick-link">
                {dict.currentPortal}
                <strong>{session.role === "pro" ? dict.proLabel : dict.userLabel}</strong>
              </Link>
              <button type="button" className="button button-neutral" onClick={onLogout}>{dict.logout}</button>
            </>
          ) : (
            <>
              <Link href="/login" className="button button-neutral">{dict.login}</Link>
              <Link href="/register" className="button button-primary">{dict.register}</Link>
            </>
          )}
          <LocaleSwitcher />
        </div>
      </div>
    </header>
  );
}
