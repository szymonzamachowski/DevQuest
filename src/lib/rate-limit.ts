import { createHash } from "node:crypto";

import { Prisma } from "@prisma/client";
import { headers } from "next/headers";

import { prisma } from "@/lib/db";

export type RateLimitResult = { allowed: boolean; retryAfterMs: number };

/** Pure decision for one bucket state; kept separate so it can be unit tested. */
export function evaluateBucket(
  count: number,
  resetAt: Date,
  limit: number,
  now: Date = new Date(),
): RateLimitResult {
  if (count <= limit) return { allowed: true, retryAfterMs: 0 };
  return { allowed: false, retryAfterMs: Math.max(0, resetAt.getTime() - now.getTime()) };
}

/**
 * Fixed-window counter stored in Postgres, so the limit holds across serverless
 * instances (an in-memory Map would reset per instance on Vercel).
 */
export async function checkRateLimit(
  key: string,
  { limit, windowMs }: { limit: number; windowMs: number },
): Promise<RateLimitResult> {
  const seconds = Math.ceil(windowMs / 1000);
  const rows = await prisma.$queryRaw<Array<{ count: number; resetAt: Date }>>(Prisma.sql`
    INSERT INTO "RateLimitBucket" ("key", "count", "resetAt")
    VALUES (${key}, 1, now() + make_interval(secs => ${seconds}))
    ON CONFLICT ("key") DO UPDATE SET
      "count" = CASE WHEN "RateLimitBucket"."resetAt" <= now() THEN 1
                     ELSE "RateLimitBucket"."count" + 1 END,
      "resetAt" = CASE WHEN "RateLimitBucket"."resetAt" <= now()
                       THEN now() + make_interval(secs => ${seconds})
                       ELSE "RateLimitBucket"."resetAt" END
    RETURNING "count", "resetAt"
  `);
  const row = rows[0];
  return row ? evaluateBucket(row.count, row.resetAt, limit) : { allowed: true, retryAfterMs: 0 };
}

/** Client IP from proxy headers, hashed so raw addresses are never stored. */
export async function clientKey(scope: string): Promise<string> {
  const headerStore = await headers();
  const ip =
    headerStore.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    headerStore.get("x-real-ip") ??
    "unknown";
  const digest = createHash("sha256")
    .update(`${process.env.AUTH_SECRET ?? ""}:${ip}`)
    .digest("hex")
    .slice(0, 32);
  return `${scope}:${digest}`;
}
