import { createHmac, timingSafeEqual } from "node:crypto";

/** One-time-ish login token for a freshly created guest: `userId.expiresAtMs.signature`. */
export function createGuestToken(
  userId: string,
  secret: string,
  ttlMs = 2 * 60_000,
  now = Date.now(),
) {
  const expiresAt = now + ttlMs;
  return `${userId}.${expiresAt}.${sign(`${userId}.${expiresAt}`, secret)}`;
}

/** Returns the user id when the signature is valid and the token has not expired. */
export function verifyGuestToken(token: string, secret: string, now = Date.now()): string | null {
  const [userId, expiresAtRaw, signature] = token.split(".");
  if (!userId || !expiresAtRaw || !signature) return null;
  const expected = Buffer.from(sign(`${userId}.${expiresAtRaw}`, secret));
  const given = Buffer.from(signature);
  if (expected.length !== given.length || !timingSafeEqual(expected, given)) return null;
  if (Number(expiresAtRaw) < now) return null;
  return userId;
}

function sign(payload: string, secret: string) {
  return createHmac("sha256", secret).update(payload).digest("base64url");
}
