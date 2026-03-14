import Link from "next/link";
import { Card } from "@/components/ui/card";
import { RegisterForm } from "@/components/auth/auth-form";

export default function RegisterPage() {
  return (
    <main className="page stack auth-page">
      <section className="hero-shell">
        <div className="hero-grid">
          <div className="hero-copy">
            <span className="kicker">create account</span>
            <h1 className="page-title">创建用户端 / Pro端账号</h1>
            <p className="subhead">先完成注册，再进入角色分流门户。用户端面向训练者，Pro端面向教练、工作室、练习场与机构。</p>
            <div className="hero-actions">
              <Link href="/login"><span className="button button-neutral">已有账号去登录</span></Link>
              <Link href="/forgot-password"><span className="button button-neutral">忘记密码</span></Link>
            </div>
          </div>
          <Card className="stack auth-card">
            <div>
              <span className="kicker">sign up</span>
              <h2 className="section-title">注册</h2>
            </div>
            <RegisterForm />
          </Card>
        </div>
      </section>
    </main>
  );
}
