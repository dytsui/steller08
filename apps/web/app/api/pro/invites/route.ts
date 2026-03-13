import { NextResponse } from "next/server";
import { getCurrentSessionPayload } from "@/lib/auth";
import { createCoachInvite, listCoachInvites } from "@/lib/auth-store";
import type { CoachInvite } from "@/lib/types";
import { makeId } from "@/lib/utils";

export async function GET() {
  const session = await getCurrentSessionPayload();
  if (!session || session.role !== "pro") {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }
  const invites = await listCoachInvites(session.userId);
  return NextResponse.json({ invites });
}

export async function POST(request: Request) {
  const session = await getCurrentSessionPayload();
  if (!session || session.role !== "pro") {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }
  const body = await request.json() as { email?: string };
  const invite: CoachInvite = {
    id: makeId("inv"),
    coachUserId: session.userId,
    inviteCode: crypto.randomUUID().slice(0, 8).toUpperCase(),
    email: body.email?.trim().toLowerCase() || null,
    status: "pending",
    expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7).toISOString(),
    createdAt: new Date().toISOString()
  };
  await createCoachInvite(invite);
  return NextResponse.json({ invite });
}
