import { NextResponse } from "next/server";

import { prisma } from "@/lib/db";
import { deleteExpiredGuests } from "@/lib/services/demo-sandbox.service";

export const dynamic = "force-dynamic";

/**
 * Daily Vercel Cron job: removes expired demo sandboxes and stale rate-limit rows.
 * Vercel sends `Authorization: Bearer $CRON_SECRET`; anything else is rejected.
 */
export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret || request.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const now = new Date();
  const removed = await deleteExpiredGuests(now);
  const buckets = await prisma.rateLimitBucket.deleteMany({ where: { resetAt: { lt: now } } });

  return NextResponse.json({ ...removed, rateLimitBuckets: buckets.count });
}
