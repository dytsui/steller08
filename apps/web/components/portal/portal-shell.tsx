import type { ReactNode } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/card";

export function PortalShell({
  title,
  subtitle,
  roleLabel,
  links,
  children
}: {
  title: string;
  subtitle: string;
  roleLabel: string;
  links: Array<{ href: string; label: string }>;
  children?: ReactNode;
}) {
  return (
    <main className="page stack">
      <section className="hero-shell">
        <div className="hero-grid">
          <div className="hero-copy">
            <span className="kicker">{roleLabel}</span>
            <h1 className="page-title">{title}</h1>
            <p className="subhead">{subtitle}</p>
            <div className="hero-actions">
              {links.map((link) => (
                <Link key={link.href} href={link.href}><span className="button button-primary">{link.label}</span></Link>
              ))}
            </div>
          </div>
          <Card className="panel-soft stack">
            <span className="kicker">portal structure</span>
            <strong>用户端 / Pro端</strong>
            <span className="muted">统一账号体系、统一登录、按角色分流到训练门户与 Pro 工作台。</span>
          </Card>
        </div>
      </section>
      {children}
    </main>
  );
}
