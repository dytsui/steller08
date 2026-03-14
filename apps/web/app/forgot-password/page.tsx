import Link from 'next/link';
import { Card } from '@/components/ui/card';

export default function ForgotPasswordPage() {
  return (
    <main className="page stack auth-page">
      <section className="hero-shell">
        <div className="hero-grid">
          <div className="hero-copy">
            <span className="kicker">account recovery</span>
            <h1 className="page-title">忘记密码</h1>
            <p className="subhead">当前仓库还没有接入真实的邮件重置服务，所以这里不会伪造“已发送邮件”。上线前需要接入真实邮件服务后再开放自动找回。</p>
            <div className="hero-actions">
              <Link href="/login"><span className="button button-primary">返回登录</span></Link>
            </div>
          </div>
          <Card className="stack auth-card">
            <strong>当前状态</strong>
            <span className="muted">路由已补齐，避免出现 404；但密码重置功能尚未接通真实邮件服务。</span>
          </Card>
        </div>
      </section>
    </main>
  );
}
