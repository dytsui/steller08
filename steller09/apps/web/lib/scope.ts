import { getAuthSession } from "@/lib/auth";
import type { RequestScope } from "@/types/domain";

export async function getRequestScope(): Promise<RequestScope | null> {
  const auth = await getAuthSession();
  if (!auth) return null;
  return { userId: auth.userId, role: auth.role, canReadAll: auth.role === "admin" };
}
