import { NextResponse } from "next/server";
import { createAuthSession, hashPassword } from "@/lib/auth";
import { exec, one } from "@/lib/db";
import { nowIso, uid } from "@/lib/utils";
import type { Role } from "@/types/domain";

export async function POST(req: Request) {
  const body = (await req.json()) as { email: string; password: string; displayName: string; role: Role };
  const existing = await one<{ id: string }>("SELECT id FROM users WHERE email = ?", [body.email]);
  if (existing) return NextResponse.json({ error: "Email already exists" }, { status: 409 });

  const userId = uid("usr");
  await exec(
    "INSERT INTO users (id, email, password_hash, role, display_name, status, created_at, updated_at) VALUES (?, ?, ?, ?, ?, 'active', ?, ?)",
    [userId, body.email, await hashPassword(body.password), body.role ?? "user", body.displayName, nowIso(), nowIso()]
  );
  await createAuthSession(userId, body.role ?? "user");
  return NextResponse.json({ ok: true, userId, role: body.role ?? "user" });
}
