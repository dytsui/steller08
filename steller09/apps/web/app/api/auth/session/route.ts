import { NextResponse } from "next/server";
import { getAuthSession } from "@/lib/auth";

export async function GET() { return NextResponse.json({ session: await getAuthSession() }); }
