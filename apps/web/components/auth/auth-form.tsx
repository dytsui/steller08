"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { loginWithPassword, registerAccount } from "@/lib/services/auth";

export function LoginForm() {
  const router = useRouter();
  const search = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(event: any) {
    event.preventDefault();
    setPending(true);
    setError(null);
    const result = await loginWithPassword({ email, password });
    setPending(false);
    if (result?.error) {
      setError(result.error);
      return;
    }
    const next = search.get("next");
    const role = result?.user?.role;
    router.push(next || (role === "pro" ? "/pro" : "/app"));
    router.refresh();
  }

  return (
    <form className="stack" onSubmit={onSubmit}>
      <label className="stack">
        <span className="muted">邮箱</span>
        <input className="input" value={email} onChange={(event: any) => setEmail(event.target.value)} placeholder="you@example.com" />
      </label>
      <label className="stack">
        <span className="muted">密码</span>
        <input className="input" type="password" value={password} onChange={(event: any) => setPassword(event.target.value)} placeholder="至少 6 位" />
      </label>
      {error ? <div className="empty-state"><strong>登录失败</strong><span>{error}</span></div> : null}
      <Button tone="primary" disabled={pending}>{pending ? "登录中..." : "登录"}</Button>
    </form>
  );
}

export function RegisterForm() {
  const router = useRouter();
  const [role, setRole] = useState<"user" | "pro">("user");
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(event: any) {
    event.preventDefault();
    setPending(true);
    setError(null);
    const result = await registerAccount({ displayName, email, password, role });
    setPending(false);
    if (result?.error) {
      setError(result.error);
      return;
    }
    router.push(role === "pro" ? "/pro" : "/app");
    router.refresh();
  }

  return (
    <form className="stack" onSubmit={onSubmit}>
      <div className="pill-row">
        <button type="button" className={`button ${role === "user" ? "button-primary" : "button-neutral"}`} onClick={() => setRole("user")}>用户端</button>
        <button type="button" className={`button ${role === "pro" ? "button-primary" : "button-neutral"}`} onClick={() => setRole("pro")}>Pro端</button>
      </div>
      <label className="stack">
        <span className="muted">昵称</span>
        <input className="input" value={displayName} onChange={(event: any) => setDisplayName(event.target.value)} placeholder={role === "pro" ? "教练 / 工作室名称" : "你的名称"} />
      </label>
      <label className="stack">
        <span className="muted">邮箱</span>
        <input className="input" value={email} onChange={(event: any) => setEmail(event.target.value)} placeholder="you@example.com" />
      </label>
      <label className="stack">
        <span className="muted">密码</span>
        <input className="input" type="password" value={password} onChange={(event: any) => setPassword(event.target.value)} placeholder="至少 6 位" />
      </label>
      {error ? <div className="empty-state"><strong>注册失败</strong><span>{error}</span></div> : null}
      <Button tone="primary" disabled={pending}>{pending ? "创建中..." : `创建${role === "pro" ? "Pro端" : "用户端"}账号`}</Button>
    </form>
  );
}
