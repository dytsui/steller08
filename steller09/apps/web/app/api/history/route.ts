import { NextResponse } from "next/server";
import { getRequestScope } from "@/lib/scope";
import { many } from "@/lib/db";

export async function GET(){
  const scope = await getRequestScope();
  if (!scope) return NextResponse.json({ items: [] });
  const items = await many(`SELECT s.id, s.status, s.light_score, s.final_score, s.created_at, st.name AS student_name FROM sessions s JOIN students st ON st.id=s.student_id WHERE ${scope.canReadAll ? "1=1" : scope.role === "pro" ? "st.coach_user_id=?" : "st.user_id=?"} ORDER BY s.created_at DESC`, scope.canReadAll ? [] : [scope.userId]);
  return NextResponse.json({ items });
}
