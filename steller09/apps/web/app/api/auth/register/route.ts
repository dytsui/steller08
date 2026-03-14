import { NextResponse } from "next/server";
import { createSession, hashPassword } from "@/lib/auth";
import { exec, one } from "@/lib/db";
import { nowIso, uid } from "@/lib/utils";
import type { Role } from "@/types/domain";

export async function POST(req: Request) {
  const body = (await req.json()) as { email: string; password: string; displayName: string; role: Role };
  const existing = await one<{ id: string }>("SELECT id FROM users WHERE email=?", [body.email]);
  if (existing) return NextResponse.json({ error: "email exists" }, { status: 409 });
  const id = uid("usr");
  const role: Role = body.role ?? "user";
  await exec("INSERT INTO users (id, email, password_hash, role, display_name, status, created_at, updated_at) VALUES (?, ?, ?, ?, ?, 'active', ?, ?)", [id, body.email, await hashPassword(body.password), role, body.displayName, nowIso(), nowIso()]);
  await createSession(id, role);
  return NextResponse.json({ ok: true, id, role });
}
