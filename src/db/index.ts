import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error("DATABASE_URL is required");
}

const globalForDb = globalThis as typeof globalThis & {
  __arenaNextJsPostgresqlPool?: Pool;
};

export const pool =
  globalForDb.__arenaNextJsPostgresqlPool ??
  new Pool({
    connectionString: databaseUrl,
    // Vercel functions are short-lived; keep the pool small so concurrent
    // invocations do not exhaust a free Neon/Supabase connection limit.
    max: (() => {
      const configured = Number(process.env.DATABASE_POOL_MAX);
      if (Number.isInteger(configured) && configured > 0 && configured <= 20) return configured;
      return process.env.VERCEL ? 1 : 10;
    })(),
    idleTimeoutMillis: 10_000,
    connectionTimeoutMillis: 10_000,
  });

if (process.env.NODE_ENV !== "production") {
  globalForDb.__arenaNextJsPostgresqlPool = pool;
}

export const db = drizzle(pool);
