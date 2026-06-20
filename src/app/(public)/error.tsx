"use client";

import { ErrorState } from "@/components/ui/page-states";

export default function PublicError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <ErrorState
      title="Unable to load page"
      description={error.message || "Please try again."}
      onRetry={reset}
    />
  );
}
