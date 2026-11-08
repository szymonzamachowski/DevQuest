"use server";

import { getEnv } from "@/lib/env";
import { createGuestToken } from "@/lib/guest-token";
import { checkRateLimit, clientKey } from "@/lib/rate-limit";
import { createDemoSandbox } from "@/lib/services/demo-sandbox.service";

const HOUR = 60 * 60 * 1000;

export type StartDemoResult =
  | { ok: true; token: string; projectId: string }
  | { ok: false; error: "RATE_LIMITED" | "UNAVAILABLE" };

/** Creates a private sandbox for an anonymous visitor and returns a one-off login token. */
export async function startDemoAction(): Promise<StartDemoResult> {
  const perVisitor = await checkRateLimit(await clientKey("demo"), { limit: 5, windowMs: HOUR });
  const global = await checkRateLimit("demo:global", { limit: 200, windowMs: HOUR });
  if (!perVisitor.allowed || !global.allowed) return { ok: false, error: "RATE_LIMITED" };

  try {
    const { userId, projectId } = await createDemoSandbox();
    return { ok: true, token: createGuestToken(userId, getEnv().AUTH_SECRET), projectId };
  } catch (error) {
    console.error("startDemoAction failed", error);
    return { ok: false, error: "UNAVAILABLE" };
  }
}
