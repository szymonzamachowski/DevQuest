-- Guest accounts for the no-signup demo sandbox.
ALTER TABLE "User" ADD COLUMN "isGuest" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "User" ADD COLUMN "guestExpiresAt" TIMESTAMP(3);
CREATE INDEX "User_guestExpiresAt_idx" ON "User"("guestExpiresAt");

-- Rate limit counters in Postgres, so limits hold across serverless instances.
CREATE TABLE "RateLimitBucket" (
    "key" TEXT NOT NULL,
    "count" INTEGER NOT NULL,
    "resetAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "RateLimitBucket_pkey" PRIMARY KEY ("key")
);

-- Same rule as 0007: nothing in `public` is readable through Supabase's Data API.
ALTER TABLE "RateLimitBucket" ENABLE ROW LEVEL SECURITY;
