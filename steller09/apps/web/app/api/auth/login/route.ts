import { NextResponse } from "next/server";
import { createSession, verifyPassword } from "@/lib/auth";
import { one } from "@/lib/db";
import type { Role } from "@/types/domain";

export async function POST(req: Request) {
  const body = (await req.json()) as { email: string; password: string };
  const row = await one<{ id: string; password_hash: string; role: Role }>("SELECT id, password_hash, role FROM users WHERE email=?", [body.email]);
  if (!row || !(await verifyPassword(body.password, row.password_hash))) return NextResponse.json({ error: "invalid credentials" }, { status: 401 });
  await createSession(row.id, row.role);
  return NextResponse.json({ ok: true, role: row.role });
}
