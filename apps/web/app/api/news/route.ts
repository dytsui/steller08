import { NextResponse } from "next/server";
import { fetchChineseGolfNews } from "@/lib/news";

export async function GET() {
  return NextResponse.json({ items: await fetchChineseGolfNews() });
}
