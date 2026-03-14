import { getRuntimeEnv } from "@/lib/runtime";

const db = (): D1Database => getRuntimeEnv().DB;

export const one = <T>(sql: string, binds: unknown[] = []) => db().prepare(sql).bind(...binds).first<T>();
export const many = async <T>(sql: string, binds: unknown[] = []) => (await db().prepare(sql).bind(...binds).all<T>()).results;
export const exec = async (sql: string, binds: unknown[] = []) => {
  await db().prepare(sql).bind(...binds).run();
};
