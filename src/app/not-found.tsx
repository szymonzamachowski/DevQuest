import Link from "next/link";

import { BrandLogo } from "@/components/brand/brand-logo";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-6 bg-[var(--dq-layer-0)] px-6 text-center">
      <BrandLogo href="/" />
      <div>
        <h1 className="font-heading text-3xl text-[var(--foreground)]">Page not found</h1>
        <p className="mt-2 max-w-md text-sm text-[var(--muted-foreground)]">
          The page you requested does not exist or is no longer available.
        </p>
      </div>
      <div className="flex flex-wrap justify-center gap-3">
        <Button asChild>
          <Link href="/">Go home</Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/campaigns">Browse campaigns</Link>
        </Button>
      </div>
    </div>
  );
}
