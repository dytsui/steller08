import Link from "next/link";
import { Card } from "@/components/ui/card";
import { LoginForm } from "@/components/auth/auth-form";

export default function LoginPage() {
  return (
    <main className="page stack auth-page">
      <section className="hero-shell">
        <div className="hero-grid">
          <div className="hero-copy">
            <span className="kicker">account access</span>
            <h1 className="page-title">进入用户端 / Pro端</h1>
            <p className="subhead">统一登录后，根据角色进入用户端训练首页或 Pro 工作台。Pro 端覆盖教练、工作室、练习场与机构。</p>
            <div className="hero-actions">
              <Link href="/register"><span className="button button-primary">创建账号</span></Link>
              <Link href="/"><span className="button button-neutral">返回首页</span></Link>
            </div>
          </div>
          <Card className="stack auth-card">
            <div>
              <span className="kicker">sign in</span>
              <h2 className="section-title">登录</h2>
            </div>
            <LoginForm />
          </Card>
        </div>
      </section>
      <section className="stats-grid">
        <Card className="stack"><strong>用户端</strong><span className="muted">拍摄、上传、查看分析、训练计划、成长趋势。</span></Card>
        <Card className="stack"><strong>Pro端</strong><span className="muted">管理用户、下发训练计划、查看历史分析、绑定邀请。</span></Card>
      </section>
    </main>
  );
}
