import { NextResponse } from "next/server";
import { getRequestScope } from "@/lib/scope";
import { many } from "@/lib/db";

export async function GET() {
  const scope = await getRequestScope();
  if (!scope) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const items = await many("SELECT * FROM students WHERE user_id=? AND is_current=1 LIMIT 1", [scope.userId]);
  return NextResponse.json({ item: items[0] ?? null });
}
