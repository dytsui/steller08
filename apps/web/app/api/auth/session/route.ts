import { NextResponse } from "next/server";
import { getCurrentSessionPayload } from "@/lib/auth";
import { getUserById } from "@/lib/auth-store";

export async function GET() {
  const payload = await getCurrentSessionPayload();
  if (!payload) {
    return NextResponse.json({ user: null });
  }
  const user = await getUserById(payload.userId);
  if (!user) {
    return NextResponse.json({ user: null });
  }
  return NextResponse.json({ user });
}
