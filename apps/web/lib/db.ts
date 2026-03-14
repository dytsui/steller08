import { getRuntimeEnv } from "@/lib/runtime";

export function db(): D1Database {
  return getRuntimeEnv().DB;
}

export async function one<T>(sql: string, binds: unknown[] = []): Promise<T | null> {
  return db().prepare(sql).bind(...binds).first<T>();
}

export async function many<T>(sql: string, binds: unknown[] = []): Promise<T[]> {
  const result = await db().prepare(sql).bind(...binds).all<T>();
  return result.results;
}

export async function exec(sql: string, binds: unknown[] = []): Promise<void> {
  await db().prepare(sql).bind(...binds).run();
}
