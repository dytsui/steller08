"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

type Invite = {
  id: string;
  inviteCode: string;
  email?: string | null;
  status: string;
  expiresAt: string;
  createdAt: string;
};

export default function ProInvitesPage() {
  const [email, setEmail] = useState("");
  const [invites, setInvites] = useState<Invite[]>([]);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    const res = await fetch("/api/pro/invites", { cache: "no-store" });
    const json = await res.json();
    setInvites(json.invites ?? []);
  }

  useEffect(() => {
    void load();
  }, []);

  async function createInvite() {
    setError(null);
    const res = await fetch("/api/pro/invites", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email })
    });
    const json = await res.json();
    if (!res.ok) {
      setError(json.error ?? "invite_failed");
      return;
    }
    setEmail("");
    setInvites((prev: Invite[]) => [json.invite, ...prev]);
  }

  return (
    <main className="page stack">
      <section className="surface-title-row">
        <div>
          <span className="kicker">pro workspace</span>
          <h1 className="page-title">邀请绑定</h1>
        </div>
      </section>
      <Card className="stack">
        <strong>发送邀请码</strong>
        <input className="input" placeholder="学员邮箱（可选）" value={email} onChange={(event: any) => setEmail(event.target.value)} />
        <Button tone="primary" onClick={createInvite}>生成邀请码</Button>
        {error ? <span className="muted">{error}</span> : null}
      </Card>
      <section className="students-grid">
        {invites.map((invite) => (
          <Card key={invite.id} className="stack">
            <div className="row-between"><strong>{invite.inviteCode}</strong><span className="badge">{invite.status}</span></div>
            <span className="muted">邮箱：{invite.email || "未指定"}</span>
            <span className="muted">到期：{invite.expiresAt}</span>
          </Card>
        ))}
      </section>
    </main>
  );
}
