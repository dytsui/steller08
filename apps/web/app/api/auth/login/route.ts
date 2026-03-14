import { NextResponse } from "next/server";
import { createAuthSession, verifyPassword } from "@/lib/auth";
import { one } from "@/lib/db";
import type { Role } from "@/types/domain";

export async function POST(req: Request) {
  const body = (await req.json()) as { email: string; password: string };
  const user = await one<{ id: string; password_hash: string; role: Role }>("SELECT id, password_hash, role FROM users WHERE email = ?", [body.email]);
  if (!user) return NextResponse.json({ error: "invalid credentials" }, { status: 401 });
  if (!(await verifyPassword(body.password, user.password_hash))) {
    return NextResponse.json({ error: "invalid credentials" }, { status: 401 });
  }
  await createAuthSession(user.id, user.role);
  return NextResponse.json({ ok: true });
}
