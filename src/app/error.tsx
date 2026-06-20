"use client";

import { useEffect } from "react";

import { ErrorState } from "@/components/ui/page-states";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    if (process.env.NODE_ENV === "development") {
      console.error(error);
    }
  }, [error]);

  return (
    <html lang="en" className="dark">
      <body className="min-h-dvh bg-[var(--dq-layer-0)] px-6 py-16">
        <ErrorState
          title="Application error"
          description="An unexpected error occurred. You can try again or return later."
          onRetry={reset}
        />
      </body>
    </html>
  );
}
